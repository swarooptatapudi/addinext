import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// utils/CranialOrderExcelExporter.ts
type SalesDetailsResp = {
  data?: Record<string, any>;
  message?: string;
};

// Exports a cranial order to Excel by calling the API endpoint directly.
// - orderId: sales order id string (e.g. "SAL-ORD-2025-01056")
// - orderType: "Cranial Helmet Orders"
// - opts: optional { apiPath } to override endpoint (defaults to provided route)
export async function exportCranialOrderToExcel(
  orderId: string,
  orderType: string,
  opts?: { apiPath?: string }
) {
  const apiPath = opts?.apiPath ?? '/api/method/addiwise.apis.order.get_sales_order_details';

  // POST payload
  const payload = { order_id: orderId, order_type: orderType };

  // Call API
  const resp = await fetch(apiPath, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`API request failed: ${resp.status} ${txt}`);
  }

  const json: SalesDetailsResp = await resp.json();
  const details = json?.data ?? {};

  // Map API fields to sheets (defensive: use empty string or nulls if missing)
  const orderIdVal = details.sales_order_id ?? details.order_id ?? orderId;
  const salesOrderDetails = [
    {
      OrderID: orderIdVal,
      Customer: details.customer ?? '',
      Clinic: details.clinic_name ?? '',
      PatientName: details.patient_name ?? `${details.first_name ?? ''} ${details.last_name ?? ''}`.trim(),
      DeviceType: details.order_type ?? details.device_type ?? orderType,
      OrderDate: details.order_date ?? '',
      DeliveryDate: details.delivery_date ?? '',
      OrderValue: details.order_value ?? details.order_amount ?? '',
      Status: details.status ?? '',
      Message: json.message ?? '',
    },
  ];

  const patientDetails = [
    {
      OrderID: orderIdVal,
      PatientName: details.patient_name ?? '',
      FirstName: details.first_name ?? '',
      LastName: details.last_name ?? '',
      ParentName: details.parent_name ?? '',
      ParentMobile: details.parent_mobile ?? '',
      DateOfBirth: details.date_of_birth ?? '',
      Gender: details.gender ?? '',
      HeightCM: details.height_cm ?? '',
      WeightKG: details.weight_kg ?? details.weight_kg ?? '',
      Email: details.email ?? '',
      ClinicName: details.clinic_name ?? '',
      Consultant: details.consultant ?? '',
    },
  ];

  const measurementComputation = [
    {
      OrderID: orderIdVal,
      AP: details.measurement_of_length_a_to_p__mm ?? details.ap ?? '',
      ML: details.measurement_of_width_m_to_l_mm ?? details.ml ?? '',
      DA: details.diagonal_a_mm ?? details.da ?? '',
      DB: details.diagonal_b_mm ?? details.db ?? '',
      HC: details.head_circumference_mm ?? details.hc ?? '',
      TW: details.temple_width_mm ?? details.tw ?? '',
      CR: details.cr ?? '',
      CVAI: details.cvai ?? '',
    },
  ];

  const assessment = [
    {
      OrderID: orderIdVal,
      OccipitalArea: details.occipital_area ?? '',
      ParietalArea: details.parietal_area ?? '',
      FrontalArea: details.frontal_area ?? '',
      EarAlignment: details.ear_alignment ?? '',
      Positional: details.positional ?? '',
      Severity: details.severity ?? '',
      Torticollis: details.torticollis ?? '',
      PostSurgical: details.post_surgical ?? '',
      SutureType: details.suture_type_surgical_diagnoses_only ?? '',
      DateOfSurgery: details.date_of_surgery ?? '',
      SurgicalComplications: details.surgical_complications ?? '',
      OtherDiagnosis: details.other_diagnosis_and_syndromes ?? '',
    },
  ];

  const scanFileDetails = [
    {
      OrderID: orderIdVal,
      ScanFile:
        details.scan_file && typeof details.scan_file === 'string'
          ? details.scan_file
          : details.scan_file?.name ?? '',
      ExtraFiles: Array.isArray(details.extra_files)
        ? details.extra_files.map((f: any) => (typeof f === 'string' ? f : f?.name ?? '')).join(', ')
        : '',
      ScanGDriveLink: details.scan_gdrive_link ?? '',
      PatientRemarks: details.patient_remarks ?? '',
      OtherRemarks: details.other_remarks ?? '',
    },
  ];

  const paymentSummary = [
    {
      OrderID: orderIdVal,
      DesignBy: details.design_by ?? '',
      PrintBy: details.print_by ?? '',
      Colour: details.colour ?? '',
      Thickness3Dmm: details.thickness_3d_mm ?? '',
      CouponCode: details.coupon_code ?? '',
      DesignPrice: details.design_price ?? '',
      PrintPrice: details.print_price ?? '',
      ItemSpecialDiscount: details.item_special_discount ?? '',
      ItemStandardDiscount: details.item_standard_discount ?? '',
      AdditionalDiscount: details.additional_discount ?? '',
      DiscountedPrice: details.discounted_price ?? '',
      GST5: details.gst_5_amt ?? '',
      GST18: details.gst_18_amt ?? '',
      TotalPrice: details.total_price ?? details.order_value ?? '',
      GST_Rate: details.gst_rate ?? '',
    },
  ];

  // Create workbook and append sheets
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesOrderDetails), 'Sales Order Details');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(patientDetails), 'Patient Details');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(measurementComputation), 'Measurement & Computation');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assessment), 'Assessment');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scanFileDetails), 'Scan File Details');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paymentSummary), 'Payment Summary');

  // Write file (browser download)
  const filename = `CranialOrder_${orderIdVal}.xlsx`;
  XLSX.writeFile(wb, filename);
}
