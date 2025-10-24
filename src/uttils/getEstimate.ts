import { getGstStateCode } from '../uttils/stateGstCodes';
import type { BaseQueryApi, BaseQueryFn } from '@reduxjs/toolkit/query';

type CouponInput = { code: string; discount_type: 'Percent' | 'Amount'; discount_value: number };

export async function estimateOrderClientSide({
                                                company,
                                                customer,
                                                items,
                                                coupon,
                                                price_list = 'Standard Selling',
                                                baseQuery,
                                                api,
                                              }: {
  company: any; // can be undefined; we’ll resolve from item defaults if so
  customer: any; // can be undefined; we’ll guard null access
  items: { item_code: string; qty: number }[];
  coupon?: CouponInput;
  price_list?: string;
  baseQuery: BaseQueryFn;
  api: BaseQueryApi;
}): Promise<{ result?: any; error?: string }> {
  let subtotal = 0;
  let total_discount = 0;
  let coupon_discount = 0;
  let tax = 0;
  const breakdownItems: any[] = [];

  // ---- Safe helpers (all null-guarded) ----
  function getCompanyStateCode(c: any): string | null {
    if (!c) return null;
    if (c.gstin) return String(c.gstin).substring(0, 2);
    if (c.state) return getGstStateCode(c.state) ?? null;
    return null;
  }

  function getCustomerStateCode(cust: any): string | null {
    if (!cust) return null;
    const billingAddr = cust.__onload?.addr_list?.find((a: any) => a?.is_primary_address);
    if (billingAddr?.gst_state_number) return billingAddr.gst_state_number;
    if (billingAddr?.state) return getGstStateCode(billingAddr.state) ?? null;
    return null;
  }

  function getTaxCategory(comp: any, cust: any): 'In-State' | 'Out-State' {
    const compCode = getCompanyStateCode(comp);
    const custCode = getCustomerStateCode(cust);
    return compCode && custCode && compCode === custCode ? 'In-State' : 'Out-State';
  }

  async function fetchTaxRateFromTemplate(templateName: string): Promise<number> {
    if (!templateName) return 0;

    const res = await baseQuery(
      { url: `/resource/Item Tax Template/${encodeURIComponent(templateName)}`, method: 'GET' },
      api,
      {}
    );
    if ('error' in res && res.error) return 0;

    const template = (res.data as any)?.data;

    // 1) Prefer top-level gst_rate (your API shows this)
    const topGst = Number(template?.gst_rate);
    if (Number.isFinite(topGst) && topGst > 0) return topGst;

    // 2) Fall back to first child row’s tax_rate (standard ERPNext field)
    const row = Array.isArray(template?.taxes) ? template.taxes[0] : undefined;
    const rowRate = Number(row?.tax_rate ?? row?.rate ?? 0); // <- note tax_rate first
    return Number.isFinite(rowRate) ? rowRate : 0;
  }

  async function fetchItemPrice(item_code: string, price_list: string) {
    const filters = encodeURIComponent(JSON.stringify([
      ["item_code", "=", item_code],
      ["price_list", "=", price_list]
    ]));
    // Specify the fields you want, e.g. price_list_rate, currency, etc.
    const fields = encodeURIComponent(JSON.stringify([
      "name", "item_code", "price_list", "price_list_rate", "currency"
    ]));
    const res = await baseQuery(
      { url: `/resource/Item Price?filters=${filters}&fields=${fields}`, method: 'GET' },
      api,
      {}
    );
    if ('error' in res && res.error) return undefined;
    return (res.data as any)?.data?.[0]?.price_list_rate;
  }

  async function fetchCompanyDetails(companyName: string) {
    if (!companyName) return undefined;
    const res = await baseQuery(
      { url: `/resource/Company/${encodeURIComponent(companyName)}`, method: 'GET' },
      api,
      {}
    );
    if ('error' in res && res.error) return undefined;
    return (res.data as any)?.data;
  }

  async function fetchItemDetails(item_code: string) {
    const res = await baseQuery({ url: `/resource/Item/${item_code}`, method: 'GET' }, api, {});
    if ('error' in res && res.error) return undefined;
    return (res.data as any)?.data;
  }

  try {
    for (const item of items) {
      // 1) Item details
      const itemDetails = await fetchItemDetails(item.item_code);
      if (!itemDetails) return { error: `No item details found for ${item.item_code}` };

      // 2) Resolve company per item if not provided
      let usedCompany = company;
      if (!usedCompany) {
        const companyName = itemDetails.item_defaults?.[0]?.company;
        usedCompany = await fetchCompanyDetails(companyName);
      }

      // 3) Price
      const price = await fetchItemPrice(item.item_code, price_list);
      if (typeof price !== 'number') {
        return { error: `No price found for ${item.item_code} in price list ${price_list}` };
      }

      // 4) Discounts
      const stdPct = Number(itemDetails.custom_standard_discount_ || 0);
      const spcPct = Number(itemDetails.custom_special_discount || 0);
      const stdDiscPerUnit = (price * stdPct) / 100;
      const spcDiscPerUnit = (price * spcPct) / 100;
      const discountPerUnit = stdDiscPerUnit + spcDiscPerUnit;

      const linePrice = price * item.qty;
      const lineDiscount = discountPerUnit * item.qty;
      const linePriceAfterDiscount = (price - discountPerUnit) * item.qty;

      // 5) Taxes (compute category now that we have usedCompany)
      const taxCategory = getTaxCategory(usedCompany, customer);
      let itemTaxRate = 0;
      let usedTaxCategory: string = taxCategory;

      const taxesArr = Array.isArray(itemDetails.taxes) ? itemDetails.taxes : [];
      if (taxesArr.length > 0) {
        const row =
          taxesArr.find((t: any) => t?.tax_category === taxCategory) ??
          taxesArr[0];
        usedTaxCategory = row?.tax_category || usedTaxCategory;
        itemTaxRate = await fetchTaxRateFromTemplate(row?.item_tax_template || '');
      }

      const lineTax = (linePriceAfterDiscount * itemTaxRate) / 100;
      const itemTaxRow = itemDetails.taxes.find((t:any) => t.tax_category === taxCategory) || itemDetails.taxes[0];
      subtotal += linePrice;
      total_discount += lineDiscount;
      tax += lineTax;

      breakdownItems.push({
        item_code: item.item_code,
        qty: item.qty,
        price: price * item.qty,
        discount: lineDiscount,
        tax: lineTax,
        tax_rate: itemTaxRate,               // <-- percent, e.g. 5
        tax_template: itemTaxRow?.item_tax_template ?? null
      });
    }

    // 6) Coupon
    if (coupon) {
      const base = subtotal - total_discount;
      coupon_discount =
        coupon.discount_type === 'Percent'
          ? (base * coupon.discount_value) / 100
          : coupon.discount_value;
    }

    const total = subtotal - total_discount - coupon_discount + tax;

    return {
      result: {
        subtotal,
        total_discount,
        coupon_discount,
        tax,
        total,
        breakdown: { items: breakdownItems },
      },
    };
  } catch (err: any) {
    return { error: `Unexpected error: ${err?.message || err}` };
  }
}
