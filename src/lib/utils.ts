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

export type AddishieldType =
  | 'AddiShield Pro Order'
  | 'AddiShield EpiPro Order'
  | 'AddiShield EpiPro Active Order';

export async function exportAddishieldOrderToExcel(
  orderId: string,
  orderType: AddishieldType,
  opts?: { apiPath?: string }
) {
  const apiPath =
    opts?.apiPath ??
    '/api/method/addiwise.apis.order.get_sales_order_details';

  const payload = { order_id: orderId, order_type: orderType };

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
    throw new Error(`API failed ${resp.status}`);
  }

  const json: any = await resp.json();

  const d =
    json?.message?.data ??   // ✅ YOUR API
    json?.data ??            // fallback (other APIs)
    {};
  const orderIdVal =
    d.sales_order_id ??
    d.so_order_id ??
    orderId;

  /* -------------------------------------------------------
   Patient Details (COMMON)
  ------------------------------------------------------- */
  const patientDetails = [
    {
      OrderID: orderIdVal,
      FirstName: d.first_name ?? '',
      LastName: d.last_name ?? '',
      ParentMobile: d.parent_mobile ?? '',
      DateOfBirth: d.date_of_birth ?? '',
      Gender: d.gender ?? '',
      HeightCM: d.height_cm ?? '',
      WeightKG: d.weight_kg ?? '',
      Email: d.email ?? '',
      ClinicName: d.clinic_name ?? '',
    },
  ];

  /* -------------------------------------------------------
   Measurement (VARIES)
  ------------------------------------------------------- */
  const baseMeasurement: any = {
    OrderID: orderIdVal,
    Length_AP_CM: d.length_ap_cm ?? '',
    HeadCircumference_CM: d.head_circumference_cm ?? '',
    TempleWidth_CM: d.temple_width_cm ?? '',
    Width_ML_CM: d.width_ml_cm ?? '',
    EyebrowToVertex_CM: d.eyebrow_to_vertex_cm ?? '',
    TragusToVertex_CM: d.tragus_to_vertex_cm ?? '',
    OcciputToVertex_CM: d.occiput_to_vertex_cm ?? '',
    SuboccipitalChin_CM: d.suboccipital_chin_cm ?? '',
    EarClearance_CM: d.ear_clearance_cm ?? '',
    NeckClearance_CM: d.neck_clearance_cm ?? '',
  };

  if (orderType === 'AddiShield Pro Order') {
    baseMeasurement.BonyDefectSize = d.bony_defect_size ?? '';
  }

  const measurement = [baseMeasurement];

  /* -------------------------------------------------------
   Assessment (VARIES)
  ------------------------------------------------------- */
  let assessment: any[] = [];

  if (
    orderType === 'AddiShield Pro Order' ||
    orderType === 'AddiShield EpiPro Active Order'
  ) {
    assessment = [
      {
        OrderID: orderIdVal,
        SiteOfCraniectomy: d.site_of_craniectomy ?? '',
        SideOfCraniectomy: d.side_of_craniectomy ?? '',
        ScalpSkinCondition: d.scalp_skin_condition ?? '',
        MobilityLevel: d.mobility_level ?? '',
      },
    ];
  }

  if (orderType === 'AddiShield EpiPro Order') {
    assessment = [
      {
        OrderID: orderIdVal,
        SeizureFrequency: d.seizure_frequency ?? '',
        EpilepsyType: d.epilepsy_type ?? '',
        RiskSituations: d.risk_situations ?? '',
        FallPattern: d.fall_pattern ?? '',
      },
    ];
  }

  /* -------------------------------------------------------
   Scan File Details (COMMON)
  ------------------------------------------------------- */
  const scanFileDetails = [
    {
      OrderID: orderIdVal,
      ScanFile: d.uploaded_stl_file ?? '',
      ExtraFiles: Array.isArray(d.extra_files)
        ? d.extra_files.map((f: any) => f?.name ?? '').join(', ')
        : '',
      Remarks: d.other_remarks ?? '',
    },
  ];

  /* -------------------------------------------------------
   Payment Summary (COMMON)
  ------------------------------------------------------- */
  const paymentSummary = [
    {
      OrderID: orderIdVal,
      DesignBy: d.design_by ?? '',
      PrintBy: d.print_by ?? '',
      Colour: d.colour ?? '',
      CouponCode: d.coupon_code ?? '',
      DesignPrice: d.design_price ?? '',
      PrintPrice: d.print_price ?? '',
      DiscountedPrice: d.discounted_price ?? '',
      GST5: d.gst_5 ?? '',
      GST18: d.gst_18 ?? '',
      TotalPrice: d.total_price ?? '',
    },
  ];

  /* -------------------------------------------------------
   Workbook
  ------------------------------------------------------- */
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(patientDetails),
    'Patient Details'
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(measurement),
    'Measurement'
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(assessment),
    'Assessment'
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(scanFileDetails),
    'Scan File Details'
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(paymentSummary),
    'Payment Summary'
  );

  XLSX.writeFile(
    wb,
    `${orderType}_${orderIdVal}.xlsx`
  );
}
