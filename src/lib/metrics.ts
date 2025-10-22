// src/lib/cranial/metrics.ts
export type CephalicRatioResult = {
  value: number;
  severity: string;
  description: string;
  range: string;
};

export type CVAIResult = {
  valueShorterDenominator: number;
  valueLongerDenominator: number;
  severity: string;
  description: string;
  diagonalDifference: number;
  range: string;
};

export type CranialAsymmetryResult = {
  value: number;
  severity: string;
  description: string;
  range: string;
};

export function calculateCephalicRatio(apLength: number, mlWidth: number): CephalicRatioResult {
  if (apLength <= 0 || mlWidth <= 0) throw new Error('Measurements must be greater than 0');
  const value = (mlWidth / apLength) * 100;

  let severity: string, description: string, range: string;
  if (value < 76)       { severity = 'Dolichocephaly'; description = 'Head is longer than normal (narrow head shape)'; range = '<76%'; }
  else if (value <= 90) { severity = 'Normal';         description = 'Normal head shape proportions';                  range = '76-90%'; }
  else if (value <= 93) { severity = 'Mild Brachycephaly';     description = 'Slightly wider head shape';            range = '91-93%'; }
  else if (value <= 97) { severity = 'Moderate Brachycephaly'; description = 'Moderately wide head shape';           range = '94-97%'; }
  else                  { severity = 'Severe Brachycephaly';   description = 'Significantly wide head shape';        range = '>97%'; }

  return { value: Number(value.toFixed(2)), severity, description, range };
}

export function calculateCVAI(diagonalA: number, diagonalB: number): CVAIResult {
  if (diagonalA <= 0 || diagonalB <= 0) throw new Error('Diagonal measurements must be greater than 0');
  if (diagonalA < diagonalB) throw new Error('Diagonal A must be the longer diagonal');

  const difference = diagonalA - diagonalB;
  const valueShorterDenominator = (difference / diagonalB) * 100;
  const valueLongerDenominator  = (difference / diagonalA) * 100;

  let severity: string, description: string, range: string;
  if (valueShorterDenominator < 3.5)       { severity = 'Normal';               description = 'Normal cranial symmetry'; range = '<3.5%'; }
  else if (valueShorterDenominator < 6.25) { severity = 'Mild Plagiocephaly';   description = 'Mild asymmetry';         range = '3.5-6.25%'; }
  else if (valueShorterDenominator < 8.75) { severity = 'Moderate Plagiocephaly';description = 'Moderate asymmetry';    range = '6.25-8.75%'; }
  else if (valueShorterDenominator <= 11)  { severity = 'Severe Plagiocephaly'; description = 'Severe asymmetry';       range = '8.75-11.0%'; }
  else                                     { severity = 'Very Severe';          description = 'Very severe asymmetry';  range = '>11.0%'; }

  return {
    valueShorterDenominator: Number(valueShorterDenominator.toFixed(2)),
    valueLongerDenominator: Number(valueLongerDenominator.toFixed(2)),
    severity,
    description,
    diagonalDifference: Number(difference.toFixed(2)),
    range
  };
}

export function calculateCranialAsymmetry(diagonalA: number, diagonalB: number): CranialAsymmetryResult {
  if (diagonalA <= 0 || diagonalB <= 0) throw new Error('Diagonal measurements must be greater than 0');
  const value = diagonalA - diagonalB;

  let severity: string, description: string, range: string;
  if (value <= 4)      { severity = 'Normal';               description = 'Normal cranial symmetry'; range = '0-4 mm'; }
  else if (value <= 9) { severity = 'Mild Plagiocephaly';   description = 'Mild asymmetry detected'; range = '5-9 mm'; }
  else if (value <= 15){ severity = 'Moderate Plagiocephaly';description = 'Moderate asymmetry';     range = '10-15 mm'; }
  else                 { severity = 'Severe Plagiocephaly'; description = 'Severe asymmetry';        range = '>15 mm'; }

  return { value: Number(value.toFixed(2)), severity, description, range };
}

// Product code
const PRODUCT_PREFIX = 'CH' as const;
export const SEVERITY = { LIGHT: 'L', MODERATE: 'M', SEVERE: 'S' } as const;
export const CONDITION = { PLAGIOCEPHALY: 'P', BRACHYCEPHALY: 'B', SCAPHOCEPHALY: 'SC', ASYMMETRIC_BRACHYCEPHALY: 'ASB' } as const;
export type SeverityCode = typeof SEVERITY[keyof typeof SEVERITY];
export type ConditionCode = typeof CONDITION[keyof typeof CONDITION];
export type ProductCode = `${typeof PRODUCT_PREFIX}-${SeverityCode}-${ConditionCode}`;

export function makeProductCode(severity: SeverityCode, condition: ConditionCode): ProductCode {
  return `${PRODUCT_PREFIX}-${severity}-${condition}`;
}

export function productCodeFromDropdowns(
  severity: 'light' | 'moderate' | 'severe',
  diagnosis: 'plagiocephaly' | 'brachycephaly' | 'scaphocephaly' | 'asymmetrical-brachycephaly'
): ProductCode {
  const severityMap: Record<string, SeverityCode> = { light: 'L', moderate: 'M', severe: 'S' };
  const diagnosisMap: Record<string, ConditionCode> = { plagiocephaly: 'P', brachycephaly: 'B', scaphocephaly: 'SC', 'asymmetrical-brachycephaly': 'ASB' };
  return makeProductCode(severityMap[severity], diagnosisMap[diagnosis]);
}

// Optional: order number helper (if you need client-side numbers)
export type OrderNumberConfig = { prefix: string; sequenceLength: number; includeDate?: boolean };
export type OrderNumberResult = { orderNumber: string; newSequence: number; newDate: string };

export function generateOrderNumber(config: OrderNumberConfig, currentSequence: number, lastDate?: string): OrderNumberResult {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let sequence = currentSequence;
  if (config.includeDate && lastDate && lastDate !== today) sequence = 0;
  sequence++;
  const padded = sequence.toString().padStart(config.sequenceLength, '0');
  const orderNumber = config.includeDate ? `${config.prefix}-${today}-${padded}` : `${config.prefix}-${padded}`;
  return { orderNumber, newSequence: sequence, newDate: today };
}