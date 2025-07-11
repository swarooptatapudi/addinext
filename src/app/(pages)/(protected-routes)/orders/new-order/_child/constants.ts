export const BK_FORM_INITIAL_VALUES = {
  patient_name: '',
  gender: '',
  date_of_birth: '',
  height: '',
  weight: '',
  mobile_no: '',
  email: '',
  authorized_representative: '',
  assessment_date: '',
  amputation_date: '',
  reason_for_amputation: '',
  stump_condition: '',
  stump_length: '',
  file_dimensions:'',
  amputated_leg: '',
  stump_size: '',
  previous_prosthetic_experience: '',
  stump_type: '',
  locking_system: '',
  scan_condition: '',
  scan_markings: '',
  foot_type: '',
  shoe_size: '',
  selectedColor: '',
  flexion_angle: '',
  add_abd_angle: '',
  liner_type: '',
  liner_thickness:'',
  direct_body: '',
  activity_level: '',
  adapter_type: '',
  socket_type: 'Check Socket',
  design_variation: '',
  model_name: '',
  additional_customization_requirements: '',
  foot_Amputation :'',
  leftFootFile: null, // Store Left Foot STL file
  rightFootFile: null, // Store Right Foot STL file
  upload_link:'',
  global_volume_reduction: '',
  gst_5: 0.0,
  gst_18: 0.0,
  item_discount: 0.0,
  additional_discount: 0.0,
  socket_design_details: [
    {
      area: 'A',
      area_name: 'Patella',
      default_mm: '+1',
      cpo_input_mm: ''
    },
    {
      area: 'B',
      area_name: 'Patella Tendon',
      default_mm: '-8',

      cpo_input_mm: ''
    },
    {
      area: 'C',
      area_name: 'Crest of Tibia',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'D',
      area_name: 'Lateral Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'E',
      area_name: 'Medial Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'F',
      area_name: 'Distal End Tibia',
      default_mm: '+6',
      cpo_input_mm: ''
    },
    {
      area: 'G',
      area_name: 'Medial Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'H',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'I',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'J',
      area_name: 'Posterior Conmpartment',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'K',
      area_name: 'Lateral Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'L',
      area_name: 'Head of Fibula',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'M',
      area_name: 'Distal End Fibula',
      default_mm: '+4',
      cpo_input_mm: ''
    },
    {
      area: 'N',
      area_name: 'Tibial Tuberosity',
      default_mm: '+1',
      cpo_input_mm: ''
    }
  ],
  value_c_details: [
    {
        gap: "00 cm",
        value: ""
    },
    {
        gap: "05 cm",
        value: ""
    },
    {
        gap: "10 cm",
        value: ""
    },
    {
        gap: "15 cm",
        value: ""
    },
    {
        gap: "20 cm",
        value: ""
    },
    {
        gap: "25 cm",
        value: ""
    },
    {
        gap: "30 cm",
        value: ""
    },
    {
        gap: "35 cm",
        value: ""
    }
]
};

// ak form

export const AK_FORM_INITIAL_VALUES = {
  patient_name: '',
  email: '',
 mobile_no: '',
  gender: '',
  date_of_birth: '',
  height: '',
  authorized_representative: '',
  assessment_date: '',
  weight: '',
  amputation_date: '',
  amputated_leg: '',
  reason_for_amputation: '',
  medical_history: '',
  shape: '',
  skin_condition: '',
  locking_system: '',
  adapter_type: '',
  liner_type: '',
  activity_level: '',
  socket_type: 'Check Socket',
  design_variation: '',
  model_name: '',
  stump_length: '',
  marking_sock_thickness: '',
  global_volume_reduction: '2%',
  ak_socket_measurements: [
    {
      circumference_at_cm: '0cm',
      standard_reduction_: '-5%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '5cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '10cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '15cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '20cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '25cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '30cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '35cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    }
  ],
  flexion_angle: '',
  abduction_angle: '',
  adduction_angle: '',
  ml_vernier: '',
  ap_vernier: '',
  table_zbib: [
    {
      point_name: 'Ischial Tuberosity (IT)',
      pressure_mm: ''
    },
    {
      point_name: 'Greater Trochanter (GT)',
      pressure_mm: ''
    },
    {
      point_name: 'Distal end of Femur',
      pressure_mm: ''
    },
    {
      point_name: 'Add. Tendon Lateral Edge',
      pressure_mm: ''
    },
    {
      point_name: 'Add. Tendon Medical Edge',
      pressure_mm: ''
    },
    {
      point_name: '6 cm below ASIS (Ant. superior lliac Spine) - for trimline',
      pressure_mm: ''
    },
    {
      point_name: 'Post Trochanter region',
      pressure_mm: ''
    },
    {
      point_name: 'Gluteal Muscles region',
      pressure_mm: ''
    },
    {
      point_name: 'Surgical Suture',
      pressure_mm: ''
    },
    {
      point_name: 'Posterior Flare of the Stump',
      pressure_mm: ''
    },
    {
      point_name: 'Lateral Flare of the Stump',
      pressure_mm: ''
    },
    {
      point_name: 'Anterior Flare of the Stump',
      pressure_mm: ''
    },
    {
      point_name: 'Medical Flare of the Stump',
      pressure_mm: ''
    }
  ],
  other_customization_requirements: '',
};


export const AKB_FORM_INITIAL_VALUES = {
  patient_name: '',
  gender: '',
  date_of_birth: '',
  height: '',
  weight: '',
 mobile_no: '',
  email: '',
  authorized_representative: '',
  assessment_date: '',
  amputation_date: '',
  reason_for_amputation: '',
  stump_condition: '',
  stump_length: '',
  mpt_distance:'',
  floor_distance:'',
  waist_circumference:'',
  Foot_length:'',
  amputated_leg: '',
  stump_size: '',
  previous_prosthetic_experience: '',
  stump_type: '',
  locking_system: '',
  scan_condition: '',
  scan_markings: '',
  foot_type: '',
  shoe_size: '',
  flexion_angle: '',
  abductionadduction_angle: '',
  liner_type: '',
  liner_thickness:'',
  direct_body: '',
  activity_level: '',
  adapter_type: '',
  socket_type: 'Check Socket',
  design_variation: '',
  model_name: '',
  additional_customization_requirements: '',
  foot_Amputation :'Both',
  images_link:'',
  global_volume_reduction: '',
  socket_design_details: [
    {
      area: 'A',
      area_name: 'Patella',
      default_mm: '+1',
      cpo_input_mm: ''
    },
    {
      area: 'B',
      area_name: 'Patella Tendon',
      default_mm: '-8',

      cpo_input_mm: ''
    },
    {
      area: 'C',
      area_name: 'Crest of Tibia',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'D',
      area_name: 'Lateral Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'E',
      area_name: 'Medial Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'F',
      area_name: 'Distal End Tibia',
      default_mm: '+6',
      cpo_input_mm: ''
    },
    {
      area: 'G',
      area_name: 'Medial Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'H',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'I',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'J',
      area_name: 'Posterior Conmpartment',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'K',
      area_name: 'Lateral Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'L',
      area_name: 'Head of Fibula',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'M',
      area_name: 'Distal End Fibula',
      default_mm: '+4',
      cpo_input_mm: ''
    },
    {
      area: 'N',
      area_name: 'Tibial Tuberosity',
      default_mm: '+1',
      cpo_input_mm: ''
    }
  ],
  ak_socket_measurements: [
    {
      circumference_at_cm: '0cm',
      standard_reduction_: '-5%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '5cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '10cm',
      standard_reduction_: '-5%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '15cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '20cm',
      standard_reduction_: '-3%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '25cm',
      standard_reduction_: '-2%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '30cm',
      standard_reduction_: '-1%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '35cm',
      standard_reduction_: ' 0%',
      desired_reduction_: ''
    }
  ],
  table_zbib: [
    {
      point_name: 'Ischial Tuberosity (IT)',
      pressure_mm: ''
    },
    {
      point_name: 'Greater Trochanter (GT)',
      pressure_mm: ''
    },
    {
      point_name: 'Distal end of Femur',
      pressure_mm: ''
    },
    {
      point_name: 'Add. Tendon Lateral Edge',
      pressure_mm: ''
    },
    {
      point_name: 'Add. Tendon Medical Edge',
      pressure_mm: ''
    },
    {
      point_name: '6 cm below ASIS (Ant. superior lliac Spine) - for trimline',
      pressure_mm: ''
    },
    {
      point_name: 'Post Trochanter region',
      pressure_mm: ''
    },
    {
      point_name: 'Gluteal Muscles region',
      pressure_mm: ''
    },
    {
      point_name: 'Surgical Suture',
      pressure_mm: ''
    },
    {
      point_name: 'Posterior Flare of the Stump',
      pressure_mm: ''
    },
    {
      point_name: 'Lateral Flare of the Stump',
      pressure_mm: ''
    },
    {
      point_name: 'Anterior Flare of the Stump',
      pressure_mm: ''
    },
    {
      point_name: 'Medical Flare of the Stump',
      pressure_mm: ''
    }
  ],
};

export const AKINSOLES_FORM_INITIAL_VALUES = {
  patient_name: '',
  gender: '',
  date_of_birth: '',
  height: '',
  weight: '',
 mobile_no: '',
  email: '',
  authorized_representative: '',
  assessment_date: '',
  amputation_date: '',
  reason_for_amputation: '',
  stump_condition: '',
  stump_length: '',
  amputated_leg: '',
  stump_size: '',
  previous_prosthetic_experience: '',
  stump_type: '',
  locking_system: '',
  scan_condition: '',
  scan_markings: '',
  foot_type: '',
  shoe_size: '',
  flexion_angle: '',
  abductionadduction_angle: '',
  liner_type: '',
  liner_thickness:'',
  direct_body: '',
  activity_level: '',
  adapter_type: '',
  socket_type: 'Check Socket',
  design_variation: '',
  model_name: '',
  additional_customization_requirements: '',
  foot_Amputation :'Both',
  images_link:'',
  global_volume_reduction: '',
  shoe_width:'',
  foot_length:'',
  metatarsal_length:'',
  metatarsal_width:'',
  insole_model:'',
  socket_design_details: [
    {
      area: 'A',
      area_name: 'Patella',
      default_mm: '+1',
      cpo_input_mm: ''
    },
    {
      area: 'B',
      area_name: 'Patella Tendon',
      default_mm: '-8',

      cpo_input_mm: ''
    },
    {
      area: 'C',
      area_name: 'Crest of Tibia',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'D',
      area_name: 'Lateral Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'E',
      area_name: 'Medial Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'F',
      area_name: 'Distal End Tibia',
      default_mm: '+6',
      cpo_input_mm: ''
    },
    {
      area: 'G',
      area_name: 'Medial Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'H',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'I',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'J',
      area_name: 'Posterior Conmpartment',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'K',
      area_name: 'Lateral Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'L',
      area_name: 'Head of Fibula',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'M',
      area_name: 'Distal End Fibula',
      default_mm: '+4',
      cpo_input_mm: ''
    },
    {
      area: 'N',
      area_name: 'Tibial Tuberosity',
      default_mm: '+1',
      cpo_input_mm: ''
    }
  ],
  ak_socket_measurements: [
    {
      circumference_at_cm: '0cm',
      standard_reduction_: '-5%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '5cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '10cm',
      standard_reduction_: '-5%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '15cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '20cm',
      standard_reduction_: '-3%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '25cm',
      standard_reduction_: '-2%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '30cm',
      standard_reduction_: '-1%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '35cm',
      standard_reduction_: ' 0%',
      desired_reduction_: ''
    }
  ],
  table_zbib: [
    {
      point_name: 'Ischial Tuberosity (IT)',
      pressure_mm: ''
    },
    {
      point_name: 'Greater Trochanter (GT)',
      pressure_mm: ''
    },
    {
      point_name: 'Distal end of Femur',
      pressure_mm: ''
    },
    {
      point_name: 'Add. Tendon Lateral Edge',
      pressure_mm: ''
    },
    {
      point_name: 'Add. Tendon Medical Edge',
      pressure_mm: ''
    },
    {
      point_name: '6 cm below ASIS (Ant. superior lliac Spine) - for trimline',
      pressure_mm: ''
    },
    {
      point_name: 'Post Trochanter region',
      pressure_mm: ''
    },
    {
      point_name: 'Gluteal Muscles region',
      pressure_mm: ''
    },
    {
      point_name: 'Surgical Suture',
      pressure_mm: ''
    },
    {
      point_name: 'Posterior Flare of the Stump',
      pressure_mm: ''
    },
    {
      point_name: 'Lateral Flare of the Stump',
      pressure_mm: ''
    },
    {
      point_name: 'Anterior Flare of the Stump',
      pressure_mm: ''
    },
    {
      point_name: 'Medical Flare of the Stump',
      pressure_mm: ''
    }
  ],
  selected_foot_conditions: [],
};

export const BE_FORM_INITIAL_VALUES = {
  patient_name: '',
  gender: '',
  date_of_birth: '',
  height: '',
  weight: '',
 mobile_no: '',
  email: '',
  authorized_representative: '',
  assessment_date: '',
  amputation_date: '',
  reason_for_amputation: '',
  stump_condition: '',
  stump_length: '',
  mpt_distance:'',
  floor_distance:'',
  waist_circumference:'',
  Foot_length:'',
  amputated_leg: '',
  stump_size: '',
  previous_prosthetic_experience: '',
  stump_type: '',
  locking_system: '',
  scan_condition: '',
  scan_markings: '',
  foot_type: '',
  shoe_size: '',
  flexion_angle: '',
  abductionadduction_angle: '',
  liner_type: '',
  liner_thickness:'',
  direct_body: '',
  activity_level: '',
  adapter_type: '',
  socket_type: 'Check Socket',
  design_variation: '',
  model_name: '',
  additional_customization_requirements: '',
  foot_Amputation :'Both',
  images_link:'',
  global_volume_reduction: '',
  shoulder_joint:'',
  socket_design_details: [
    {
      area: 'A',
      area_name: 'Patella',
      default_mm: '+1',
      cpo_input_mm: ''
    },
    {
      area: 'B',
      area_name: 'Patella Tendon',
      default_mm: '-8',

      cpo_input_mm: ''
    },
    {
      area: 'C',
      area_name: 'Crest of Tibia',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'D',
      area_name: 'Lateral Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'E',
      area_name: 'Medial Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'F',
      area_name: 'Distal End Tibia',
      default_mm: '+6',
      cpo_input_mm: ''
    },
    {
      area: 'G',
      area_name: 'Medial Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'H',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'I',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'J',
      area_name: 'Posterior Conmpartment',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'K',
      area_name: 'Lateral Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'L',
      area_name: 'Head of Fibula',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'M',
      area_name: 'Distal End Fibula',
      default_mm: '+4',
      cpo_input_mm: ''
    },
    {
      area: 'N',
      area_name: 'Tibial Tuberosity',
      default_mm: '+1',
      cpo_input_mm: ''
    }
  ],
  ak_socket_measurements: [
    {
      circumference_at_cm: '0cm',
      standard_reduction_: '-5%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '5cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '10cm',
      standard_reduction_: '-5%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '15cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '20cm',
      standard_reduction_: '-3%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '25cm',
      standard_reduction_: '-2%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '30cm',
      standard_reduction_: '-1%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '35cm',
      standard_reduction_: ' 0%',
      desired_reduction_: ''
    }
  ],
  table_zbib: [
    {
      point_name: 'Olecrenon Process',
      default_mm: '2',
      area:'A',
      modifications_mm: ''
    },
    {
      point_name: 'Medial Epicondyle',
      default_mm: '2',
      area:'B',
      modifications_mm: ''
    },
    {
      point_name: 'Lateral Epicondyle',
      default_mm: '2',
      area:'C',
      modifications_mm: ''
    },
    {
      point_name: 'Distal End Suture Line',
      area:'D',
      default_mm: '2',
      modifications_mm: ''
    },
    {
      point_name: 'Ant. Below the Elbow Crease',
      default_mm: '-2',
      area:'E',
      modifications_mm: ''
    },
    {
      point_name: 'Supra Epicondyles',
      default_mm: '-3',
      area:'F',
      modifications_mm: ''
    },
    {
      point_name: 'Supra Olecrenon',
      default_mm: '-3',
      area:'G',
      modifications_mm: ''
    },
  ],
};

export const AE_FORM_INITIAL_VALUES = {
  patient_name: '',
  gender: '',
  date_of_birth: '',
  height: '',
  weight: '',
 mobile_no: '',
  email: '',
  authorized_representative: '',
  assessment_date: '',
  amputation_date: '',
  reason_for_amputation: '',
  stump_condition: '',
  stump_length: '',
  mpt_distance:'',
  floor_distance:'',
  waist_circumference:'',
  Foot_length:'',
  amputated_leg: '',
  stump_size: '',
  previous_prosthetic_experience: '',
  stump_type: '',
  locking_system: '',
  scan_condition: '',
  scan_markings: '',
  foot_type: '',
  shoe_size: '',
  flexion_angle: '',
  abductionadduction_angle: '',
  liner_type: '',
  liner_thickness:'',
  direct_body: '',
  activity_level: '',
  adapter_type: '',
  socket_type: 'Check Socket',
  design_variation: '',
  model_name: '',
  additional_customization_requirements: '',
  foot_Amputation :'Both',
  images_link:'',
  global_volume_reduction: '',
  shoulder_joint:'',
  socket_design_details: [
    {
      area: 'A',
      area_name: 'Patella',
      default_mm: '+1',
      cpo_input_mm: ''
    },
    {
      area: 'B',
      area_name: 'Patella Tendon',
      default_mm: '-8',

      cpo_input_mm: ''
    },
    {
      area: 'C',
      area_name: 'Crest of Tibia',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'D',
      area_name: 'Lateral Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'E',
      area_name: 'Medial Shaft Tibia',
      default_mm: '-3',
      cpo_input_mm: ''
    },
    {
      area: 'F',
      area_name: 'Distal End Tibia',
      default_mm: '+6',
      cpo_input_mm: ''
    },
    {
      area: 'G',
      area_name: 'Medial Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'H',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'I',
      area_name: 'Hamstring Tendons',
      default_mm: '+2',
      cpo_input_mm: ''
    },
    {
      area: 'J',
      area_name: 'Posterior Conmpartment',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'K',
      area_name: 'Lateral Supracondylar',
      default_mm: '-4',
      cpo_input_mm: ''
    },
    {
      area: 'L',
      area_name: 'Head of Fibula',
      default_mm: '+3',
      cpo_input_mm: ''
    },
    {
      area: 'M',
      area_name: 'Distal End Fibula',
      default_mm: '+4',
      cpo_input_mm: ''
    },
    {
      area: 'N',
      area_name: 'Tibial Tuberosity',
      default_mm: '+1',
      cpo_input_mm: ''
    }
  ],
  ak_socket_measurements: [
    {
      circumference_at_cm: '0cm',
      standard_reduction_: '-5%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '5cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '10cm',
      standard_reduction_: '-5%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '15cm',
      standard_reduction_: '-4%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '20cm',
      standard_reduction_: '-3%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '25cm',
      standard_reduction_: '-2%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '30cm',
      standard_reduction_: '-1%',
      desired_reduction_: ''
    },
    {
      circumference_at_cm: '35cm',
      standard_reduction_: ' 0%',
      desired_reduction_: ''
    }
  ],
  table_zbib: [
    {
      point_name: 'Head Of Humerus',
      default_mm: '0',
      area:'A',
      modifications_mm: ''
    },
    {
      point_name: 'Subscapular Fossa',
      default_mm: '-3',
      area:'B',
      modifications_mm: ''
    },
    {
      point_name: 'Infraspinous Fossa',
      default_mm: '-3',
      area:'C',
      modifications_mm: ''
    },
    {
      point_name: 'Distal End Suture Line',
      area:'D',
      default_mm: '2',
      modifications_mm: ''
    },
    {
      point_name: 'Above the Shoulder Joint',
      default_mm: '-3',
      area:'E',
      modifications_mm: ''
    },
    {
      point_name: 'End of Rib Case (in case of Shoulder Disart)',
      default_mm: '-4',
      area:'F',
      modifications_mm: ''
    },
    {
      point_name: 'Overall Stump- If bulky –reduce 2mm If firm muscles—reduce 1mm If skinny- maintain as per scan',
      default_mm: '',
      area:' ',
      modifications_mm: ''
    },
  ],
};

