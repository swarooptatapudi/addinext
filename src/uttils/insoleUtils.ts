import { ActivityLevel } from "@/uttils/thicknessChart";

// ✅ Map K1/K2/K3 → LOW/MID/HIGH
export function mapActivityLevel(level: string): ActivityLevel {
    switch (level) {
        case "K1": return "LOW";
        case "K2": return "MID";
        case "K3": return "HIGH";
        default: return "MID";
    }
}

// ✅ Thickness code
export function getThicknessCode(thickness: string): "T1" | "T2" {
    const numeric = parseFloat(thickness);
    return numeric <= 3 ? "T1" : "T2";
}

// ✅ Finish / Usage map
export const finishMap: Record<string, string> = {
    "City Comfort": "CC",
    Endurance: "EN",
    Sensitive: "SN",
    Sports: "SP",
    Diabetic: "DI",
};

// ✅ Layering map
export const layeringMap: Record<string, string> = {
    Standard: "S",
    Premium: "P",
};

// ✅ Insole model map
export const modelMap: Record<string, string> = {
    AddiSole: "AS",
    AddiSoleSLS: "ASL",
    AddiSoleFDM: "ASE",
};
