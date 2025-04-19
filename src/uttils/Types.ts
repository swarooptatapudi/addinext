export interface USER {
  user_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_picture: string;
  customer_id: string;
  customer_group: string;
  territory: string;
  customer_type: string;
  customer_available_coins: number;
  active_plan: string;
  plan_expiration_date: string;
  clinic_name?:string;
}
export interface PatientFormValuesData {
  first_name: string;
  last_name:string,
  date_of_birth: string;
  height: string;
  weight: string;
  mobile_no: string;
  email: string;
  gender: string;
  clinic_name:string;
}

export interface SUBSCRIPTION_PLAN {
  name: string;
  creation: string;
  modified: string;
  plan_name: string;
  plan_amount: number;
  subscription_bonus_coins: number;
  subscription_features: Array<FEATURE>;
}

export interface FEATURE {
  name: string;
  creation: string;
  modified: string;
  idx: number;
  feature_name: string;
  feature_amount: number;
  subscription_bonus_coins: number;
}
export interface COINS_RULES {
  coins_rate: number;
  total_discount: number;
  after_discount_rate: number;
  coins_special_discount: number;
  plan_discount: number;
  minimum_coin_purchase: number;
  maximum_coin_purchase: number;
}

//bk form type

export interface BK_FORM_TYPE {
  clinic_name?:string;
  patient_name: string;
  gender: string;
  date_of_birth: string;
  height: string;
  mobile_no: string;
  email: string;
  authorized_representative: string;
  assessment_date: string;
  weight: string;
  amputation_date: string;
  reason_for_amputation: string;
  stump_condition: string;
  stump_length: string;
  amputated_leg: string;
  stump_size: string;
  previous_prosthetic_experience: string;
  stump_type: string;
  locking_system: string;
  scan_condition: string;
  scan_markings: string;
  foot_type: string;
  shoe_size: string;
  flexion_angle: string;
  abductionadduction_angle: string;
  liner_type: string;
  activity_level: string;
  adapter_type: string;
  socket_type: string;
  direct_body: string;
  design_variation: string;
  model_name: string;
  additional_customization_requirements: string;
  socket_design_details: Array<{
    area: string;
    area_name: string;
    default_mm: string;
    cpo_input_mm: string;
  }>;
}
