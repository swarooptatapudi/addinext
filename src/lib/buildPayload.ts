// src/lib/buildPayload.ts

export interface WikyPayload {
  identifier: 'none';
  ID: string;
  userId: string;
  clientId: string;
  data: {
    'Patient Data': {
      name: string;
      surname: string;
      birthDate: string;
      weight?: number;
      shoeSize?: number;
      sex: string;
    };
    files: string[];
    'Device Info': {
      appVersion: string;
      device: string;
      ios: string;
      app: string;
    };
  };
}

export function buildWikyPayload(input: {
  scanId: string;
  userId: string;
  clientId: string;
  patient: {
    name: string;
    surname?: string;
    dob: string;
    weight?: number;
    shoe_size_eu?: number;
    gender: string;
  };
  files: {
    renamed_left?: string;
    renamed_right?: string;
  }[];
}): WikyPayload {
  const fileNames: string[] = [];

  for (const f of input.files) {
    if (f.renamed_left) fileNames.push(f.renamed_left);
    if (f.renamed_right) fileNames.push(f.renamed_right);
  }

  return {
    identifier: 'none',
    ID: input.scanId,
    userId: input.userId,
    clientId: input.clientId,
    data: {
      'Patient Data': {
        name: input.patient.name,
        surname: input.patient.surname ?? '',
        birthDate: input.patient.dob,
        weight: input.patient.weight,
        shoeSize: input.patient.shoe_size_eu,
        sex: input.patient.gender.toLowerCase().startsWith('m') ? 'm' : 'f',
      },
      files: fileNames,
      'Device Info': {
        appVersion: '2.00',
        device: 'Not registered',
        ios: 'Not registered',
        app: 'Addiwise',
      },
    },
  };
}
