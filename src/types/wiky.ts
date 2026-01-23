// wiky.ts

export type WikyPatient = {
  name: string;
  surname?: string;
  birthDate: string;
  weight: number;
  shoeSize: number;
  sex: 'm' | 'f' | 'o';
};

export type WikyFile = {
  scanItemId: string;
  footSide: 'Left' | 'Right' | 'Both';
  leftFile?: string;
  rightFile?: string;
  renamedLeft?: string;
  renamedRight?: string;
};

export type WikyScanInfo = {
  scanId: string;
  formResponseId?: string;
  status: string;
  signedZipUrl?: string;
};

export type DesignWorkflowResponse = {
  order: {
    salesOrderId: string;
    orderType: string;
    orderId: string;
  };
  patient: WikyPatient;
  wiky: WikyScanInfo;
  files: WikyFile[];
};
