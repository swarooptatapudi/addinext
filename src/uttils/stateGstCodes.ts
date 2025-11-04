// GST State Prefix mapping
const GST_STATE_PREFIX: { [key: string]: string } = {
    "jammu & kashmir": "01",
    "himachal pradesh": "02",
    "punjab": "03",
    "chandigarh": "04",
    "uttarakhand": "05",
    "haryana": "06",
    "delhi": "07",
    "rajasthan": "08",
    "uttar pradesh": "09",
    "bihar": "10",
    "sikkim": "11",
    "arunachal pradesh": "12",
    "nagaland": "13",
    "manipur": "14",
    "mizoram": "15",
    "tripura": "16",
    "meghalaya": "17",
    "assam": "18",
    "west bengal": "19",
    "jharkhand": "20",
    "odisha": "21",
    "chhattisgarh": "22",
    "madhya pradesh": "23",
    "gujarat": "24",
    "dadra and nagar haveli and daman and diu": "26",
    "maharashtra": "27",
    "andhra pradesh (old)": "28",
    "karnataka": "29",
    "goa": "30",
    "lakshadweep": "31",
    "kerala": "32",
    "tamil nadu": "33",
    "puducherry": "34",
    "andaman & nicobar islands": "35",
    "telangana": "36",
    "andhra pradesh (new)": "37",
    "ladakh": "38",
    "other territory": "97",
    "centre jurisdiction": "99"
};

// Utility function to get GST state code
export function getGstStateCode(state: string): string | null {
    if (!state) return null;
    const normalized = state.trim().toLowerCase().replace(/ +/g, " ");
    // Try normal lookup
    if (GST_STATE_PREFIX[normalized]) return GST_STATE_PREFIX[normalized];
    // Try fuzzy match
    for (const key in GST_STATE_PREFIX) {
        if (key.includes(normalized) || normalized.includes(key)) {
            return GST_STATE_PREFIX[key];
        }
    }
    return null;
}
