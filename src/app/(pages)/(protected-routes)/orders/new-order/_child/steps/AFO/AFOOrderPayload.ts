export interface AFOOrderPayload {
  /* -------------------- STEP 1: PRODUCT & PATIENT -------------------- */
  product_type: "AFO" | "DAFO";

  first_name: string;
  last_name: string;
  parent_name?: string;
  parent_mobile?: string;
  gender: "Male" | "Female" | "Other";
  date_of_birth: string; // YYYY-MM-DD
  patient_age: number;
  weight: number;
  email?: string;

  /* -------------------- STEP 2: MEASUREMENTS (ALL REQUIRED) -------------------- */
  heel_to_sulcus_cm: number;
  heel_to_toe_cm: number;

  fibula_head_circumference_cm: number;
  fibula_head_ml_cm: number;
  fibula_head_to_ankle_cm: number;

  widest_calf_circumference_cm: number;
  widest_calf_ml_cm: number;

  ankle_circumference_cm: number;
  ankle_ml_cm: number;
  ankle_to_ground_cm: number;

  forefoot_ml_cm: number;

  /* DAFO ONLY */
  ankle_joint_type?: "Tamrack flexure" | "Oklahoma" | "Camber axis";

  /* -------------------- STEP 3: CLINICAL -------------------- */
  clinic_name: string;
  assessment_date: string;
  medical_condition: string;
  treatment_suggested: string;
  special_instructions?: string;

  /* -------------------- STEP 4: LATERALITY & FILES -------------------- */
  laterality: "Unilateral" | "Bilateral";

  left_leg_file?: File | string;
  right_leg_file?: File | string;

  drive_url?: string;
}
