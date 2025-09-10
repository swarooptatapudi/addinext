// // ✅ thicknessChart.ts
// export type ActivityLevel = "LOW" | "MID" | "HIGH";
// type WeightRange = "0-40" | "40-60" | "60-80" | "80-100" | "100+";
// type ThicknessChart = Record<ActivityLevel, Record<WeightRange, string>>;


// export const thicknessCharts: Record<string, ThicknessChart> = {
//     default: {
//         LOW: {
//             "0-40": "2 MM",
//             "40-60": "2.5 MM",
//             "60-80": "3 MM",
//             "80-100": "3.5 MM",
//             "100+": "4 MM",
//         },
//         MID: {
//             "0-40": "2.5 MM",
//             "40-60": "3 MM",
//             "60-80": "3 MM",
//             "80-100": "3.5 MM",
//             "100+": "4 MM",
//         },
//         HIGH: {
//             "0-40": "3 MM",
//             "40-60": "3.5 MM",
//             "60-80": "4 MM",
//             "80-100": "4 MM",
//             "100+": "4.5 MM",
//         },
//     },

//     // 🔹 AddiSole / AddiSole L from the pic
//     AddiSole: {
//         LOW: {
//             "0-40": "2.5 MM",   // 0–60 K1/K2 → 2.5
//             "40-60": "2.5 MM",  // still in 0–60 range
//             "60-80": "3 MM",    // 61–80 K1/K2
//             "80-100": "3.5 MM", // 81–100 K1/K2
//             "100+": "4 MM",     // 100+ K1/K2
//         },
//         MID: {
//             "0-40": "3 MM",     // 0–60 K3/K4
//             "40-60": "3 MM",    // still in 0–60
//             "60-80": "3.5 MM",  // 61–80 K3/K4
//             "80-100": "3.5 MM", // 81–100 K3/K4
//             "100+": "4 MM",     // 100+ K3/K4
//         },
//         HIGH: {
//             "0-40": "3 MM",     // same as MID (K3/K4)
//             "40-60": "3 MM",
//             "60-80": "3.5 MM",
//             "80-100": "3.5 MM",
//             "100+": "4 MM",
//         },
//     },
//     AddiSoleL: {
//         LOW: {
//             "0-40": "2.5 MM",   // 0–60 K1/K2 → 2.5
//             "40-60": "2.5 MM",  // still in 0–60 range
//             "60-80": "3 MM",    // 61–80 K1/K2
//             "80-100": "3.5 MM", // 81–100 K1/K2
//             "100+": "4 MM",     // 100+ K1/K2
//         },
//         MID: {
//             "0-40": "3 MM",     // 0–60 K3/K4
//             "40-60": "3 MM",    // still in 0–60
//             "60-80": "3.5 MM",  // 61–80 K3/K4
//             "80-100": "3.5 MM", // 81–100 K3/K4
//             "100+": "4 MM",     // 100+ K3/K4
//         },
//         HIGH: {
//             "0-40": "3 MM",     // same as MID (K3/K4)
//             "40-60": "3 MM",
//             "60-80": "3.5 MM",
//             "80-100": "3.5 MM",
//             "100+": "4 MM",
//         },
//     },

//     // 🔹 AddiSoleEco from the pic
//     AddiSoleEco: {
//         LOW: {
//             "0-40": "3 MM",     // 0–60 K1/K2
//             "40-60": "3 MM",
//             "60-80": "3.5 MM",  // 61–80 K1/K2
//             "80-100": "3.5 MM", // 81–100 K1/K2
//             "100+": "4 MM",     // 100+ K1/K2
//         },
//         MID: {
//             "0-40": "3 MM",     // 0–60 K3/K4
//             "40-60": "3 MM",
//             "60-80": "3.5 MM",  // 61–80 K3/K4
//             "80-100": "3.5 MM", // 81–100 K3/K4
//             "100+": "4 MM",     // 100+ K3/K4
//         },
//         HIGH: {
//             "0-40": "3 MM",     // same as MID (K3/K4)
//             "40-60": "3 MM",
//             "60-80": "3.5 MM",
//             "80-100": "3.5 MM",
//             "100+": "4 MM",
//         },
//     },
// };


// function getWeightRange(weightKg: number): WeightRange {
//     if (weightKg <= 40) return "0-40";
//     if (weightKg <= 60) return "40-60";
//     if (weightKg <= 80) return "60-80";
//     if (weightKg <= 100) return "80-100";
//     return "100+";
// }

// export function getThickness(
//     insoleModel: string,
//     weightKg: number,
//     activityLevel: ActivityLevel
// ): string {
//     const chart = thicknessCharts[insoleModel] || thicknessCharts.default;
//     const weightRange = getWeightRange(weightKg);
//     return chart[activityLevel][weightRange];
// }


// type KLevel = "K1" | "K2" | "K3" | "K4";
// type WeightRange = "0-60" | "61-80" | "81-100" | "100+";

// const getWeightRange = (kg: number): WeightRange => {
//     if (kg <= 60) return "0-60";
//     if (kg <= 80) return "61-80";
//     if (kg <= 100) return "81-100";
//     return "100+";
// };

// const getActivityGroup = (k: KLevel | string): "K1/K2" | "K3/K4" => {
//     const key = k.trim().toUpperCase();
//     if (key === "K1" || key === "K2") return "K1/K2";

//     return "K3/K4";
// };




// const thicknessCharts: Record<string, Record<WeightRange, Record<"K1/K2" | "K3/K4", number>>> = {
//     AddiSole: {
//         "0-60": { "K1/K2": 2.5, "K3/K4": 3 },

//         "61-80": { "K1/K2": 3, "K3/K4": 3.5 },

//         "81-100": { "K1/K2": 3.5, "K3/K4": 3.5 },
//         "100+": { "K1/K2": 4, "K3/K4": 4 },
//     },
//     AddiSoleEco: {
//         "0-60": { "K1/K2": 3, "K3/K4": 3 },
//         "61-80": { "K1/K2": 3.5, "K3/K4": 3.5 },
//         "81-100": { "K1/K2": 3.5, "K3/K4": 3.5 },
//         "100+": { "K1/K2": 4, "K3/K4": 4 },
//     },
// };

// // normalize any model name to valid chart key
// const normalizeModel = (name: string): keyof typeof thicknessCharts => {
//     const key = name.trim().toLowerCase();
//     if (key.includes("eco")) return "AddiSoleEco";
//     return "AddiSole"; // covers AddiSole, AdiSole, AdiSole L
// };

// export function getThickness(
//     model: string,
//     weightKg: number,
//     kLevel: KLevel
// ): number {
//     const range = getWeightRange(weightKg);
//     const activity = getActivityGroup(kLevel);
//     const chartKey = normalizeModel(model);
//     return thicknessCharts[chartKey][range][activity];
// }

// utils/thickness.ts
export function getThickness(
    model: string,
    weightKg: number,
    activity: "K1" | "K2" | "K3" | "K4"
): number {
    console.log("➡️ getThickness called with:", { model, weightKg, activity });

    if (model === "AddiSole") {
        console.log("📌 Model: AddiSole");

        if (weightKg <= 60) {
            console.log("🔎 Weight range: 0-60", "activity:", activity);
            if (activity === "K1" || activity === "K2") {
                console.log("✅ Matched K1 or K2 → Thickness = 2.5");
                return 2.5;
            }
            if (activity === "K3") {
                console.log("✅ Matched K3 → Thickness = 2.5");
                return 2.5;
            }
            if (activity === "K4") {
                console.log("✅ Matched K4 → Thickness = 3");
                return 3;
            }
        }

        if (weightKg <= 80) {
            console.log("🔎 Weight range: 61-80", "activity:", activity);
            if (activity === "K1" || activity === "K2") {
                console.log("✅ Matched K1 or K2 → Thickness = 3");
                return 3;
            }
            if (activity === "K3" || activity === "K4") {
                console.log("✅ Matched K3 or K4 → Thickness = 3.5");
                return 3.5;
            }
        }

        if (weightKg <= 100) {
            console.log("🔎 Weight range: 81-100 → Thickness = 3.5");
            return 3.5;
        }

        console.log("🔎 Weight range: 100+ → Thickness = 4");
        return 4;
    }

    if (model === "AddiSoleEco") {
        console.log("📌 Model: AddiSoleEco");

        if (weightKg <= 60) {
            console.log("🔎 Weight range: 0-60 → Thickness = 3");
            return 3;
        }
        if (weightKg <= 80) {
            console.log("🔎 Weight range: 61-80 → Thickness = 3.5");
            return 3.5;
        }
        if (weightKg <= 100) {
            console.log("🔎 Weight range: 81-100 → Thickness = 3.5");
            return 3.5;
        }

        console.log("🔎 Weight range: 100+ → Thickness = 4");
        return 4;
    }

    console.warn("⚠️ Unknown model. Returning fallback thickness = 0");
    return 0;
}




