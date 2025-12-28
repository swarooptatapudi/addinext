// src/components/wiky/types.ts

export type WikyProduct = "INSOLES" | "AFO" | "SPINAL_BRACE";

export type WikyStep =
  | "START"
  | "UPLOAD"
  | "READY"
  | "CLEANING"
  | "DESIGN"
  | "SYNCING"
  | "FILES";

export type WikyFile = {
  name: string;
  path: string;
};
