import baseQueryWithReauth from '../rtk-query/base/baseQueryReAuth';
import { getGstStateCode } from '../uttils/stateGstCodes';

export type ItemEstimateInput = {
    item_code: string;
    qty: number;
};

export type Coupon = {
    code: string;
    discount_type: 'Percent' | 'Amount';
    discount_value: number;
};

export type EstimateResult = {
    subtotal: number;
    total_discount: number;
    coupon_discount: number;
    tax: number;
    total: number;
    breakdown: {
        items: Array<{
            item_code: string;
            qty: number;
            price: number;
            discount: number;
            tax: number;
            tax_rate: number;
            tax_category: string;
        }>;
    };
};

// --- GST State Code Extraction ---
function getCompanyStateCode(company: any): string | null {
    if (company.gstin) return company.gstin.substring(0, 2);
    if (company.state) return getGstStateCode(company.state);
    return null;
}

function getCustomerStateCode(customer: any): string | null {
    const billingAddr = customer.__onload?.addr_list?.find((a: any) => a.is_primary_address);
    if (billingAddr?.gst_state_number) return billingAddr.gst_state_number;
    if (billingAddr?.state) return getGstStateCode(billingAddr.state);
    return null;
}

function getTaxCategory(company: any, customer: any): "In-State" | "Out-State" {
    const companyStateCode = getCompanyStateCode(company);
    const customerStateCode = getCustomerStateCode(customer);
    if (companyStateCode && customerStateCode && companyStateCode === customerStateCode) {
        return "In-State";
    }
    return "Out-State";
}

// --- API Helpers ---
async function fetchTaxRateFromTemplate(templateName: string): Promise<number> {
    if (!templateName) return 0;
    const res = await baseQueryWithReauth({
        url: `/resource/Item Tax Template/${encodeURIComponent(templateName)}`,
        method: 'GET'
    });
    if ('error' in res && res.error) return 0;
    const template = (res.data as any)?.data;
    if (template && Array.isArray(template.taxes) && template.taxes.length > 0) {
        return Number(template.taxes[0].rate) || 0;
    }
    return 0;
}

async function fetchItemPrice(item_code: string, price_list: string) {
    const res = await baseQueryWithReauth({
        url: `/resource/Item Price?filters=[["item_code","=","${item_code}"],["price_list","=","${price_list}"]]`,
        method: 'GET'
    });
    if ('error' in res && res.error) return undefined;
    return (res.data as any)?.data?.[0]?.price_list_rate;
}

async function fetchItemDetails(item_code: string) {
    const res = await baseQueryWithReauth({
        url: `/resource/Item/${item_code}`,
        method: 'GET'
    });
    if ('error' in res && res.error) return undefined;
    return (res.data as any)?.data;
}

// --- Main Estimation Utility ---
export async function estimateOrderClientSide({
    company,
    customer,
    items,
    coupon,
    price_list = "Standard Selling"
}: {
    company: any;
    customer: any;
    items: ItemEstimateInput[];
    coupon?: Coupon;
    price_list?: string;
}): Promise<{ result?: EstimateResult; error?: string }> {
    let subtotal = 0,
        total_discount = 0,
        coupon_discount = 0,
        tax = 0;
    const breakdownItems = [];

    try {
        const taxCategory = getTaxCategory(company, customer);

        for (const item of items) {
            // 1. Fetch item details
            const itemDetails = await fetchItemDetails(item.item_code);
            if (!itemDetails) return { error: `No item details found for ${item.item_code}` };

            // 2. Fetch item price
            const price = await fetchItemPrice(item.item_code, price_list);
            if (typeof price !== 'number') return { error: `No price found for ${item.item_code} in price list ${price_list}` };

            // 3. Discounts
            const stdDisc = (price * (itemDetails.custom_standard_discount_ || 0)) / 100;
            const spcDisc = (price * (itemDetails.custom_special_discount || 0)) / 100;
            const discount = (stdDisc + spcDisc) * item.qty;
            const priceAfterDiscount = (price - stdDisc - spcDisc) * item.qty;

            // 4. Tax: pick correct tax template for In-State/Out-State
            let itemTaxRate = 0;
            let usedTaxCategory = taxCategory;
            if (itemDetails.taxes && itemDetails.taxes.length > 0) {
                const itemTaxRow = itemDetails.taxes.find((t: any) => t.tax_category === taxCategory)
                    || itemDetails.taxes[0];
                usedTaxCategory = itemTaxRow.tax_category;
                itemTaxRate = await fetchTaxRateFromTemplate(itemTaxRow.item_tax_template);
            }
            const itemTax = (priceAfterDiscount * itemTaxRate) / 100;

            subtotal += price * item.qty;
            total_discount += discount;
            tax += itemTax;

            breakdownItems.push({
                item_code: item.item_code,
                qty: item.qty,
                price: price * item.qty,
                discount,
                tax: itemTax,
                tax_rate: itemTaxRate,
                tax_category: usedTaxCategory
            });
        }

        // 5. Coupon discount
        if (coupon) {
            const base = subtotal - total_discount;
            coupon_discount =
                coupon.discount_type === "Percent"
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
                breakdown: { items: breakdownItems }
            }
        };
    } catch (err: any) {
        return { error: `Unexpected error: ${err?.message || err}` };
    }
}