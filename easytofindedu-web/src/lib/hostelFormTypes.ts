// Complete list of ALL amenities from old website
export const AMENITIES = {
  room: [
    { key: "mattress", label: "Mattress (Gadda)" },
    { key: "pillow", label: "Pillow" },
    { key: "bed_with_storage", label: "Bed with Storage" },
    { key: "bed", label: "Bed" },
    { key: "wardrobe", label: "Wardrobe / Almirah" },
    { key: "study_table", label: "Study Table" },
    { key: "study_chair", label: "Study Chair" },
    { key: "bookshelf", label: "Bookshelf" },
    { key: "shoe_rack", label: "Shoe Rack" },
    { key: "mirror", label: "Mirror" },
    { key: "curtains", label: "Curtains" },
    { key: "fan", label: "Fan" },
    { key: "ac", label: "AC" },
    { key: "cooler", label: "Air Cooler" },
    { key: "room_heater", label: "Room Heater" },
    { key: "attached_bathroom", label: "Attached Bathroom" },
    { key: "balcony", label: "Private Balcony" }
  ],
  washroom: [
    { key: "indian_toilet", label: "Indian Toilet" },
    { key: "western_toilet", label: "Western Toilet" },
    { key: "geyser", label: "Geyser" },
    { key: "24x7_water_in_washroom", label: "24x7 Water in Washroom" },
    { key: "separate_bath_toilet", label: "Separate Bath & Toilet" }
  ],
  utilities: [
    { key: "wifi", label: "WiFi" },
    { key: "ro_water", label: "RO Water" },
    { key: "water_cooler", label: "Water Cooler" },
    { key: "24x7_water_supply", label: "24x7 Water Supply" },
    { key: "electricity_backup", label: "Electricity Backup" },
    { key: "inverter_backup", label: "Inverter Backup" },
    { key: "induction", label: "Induction" },
    { key: "tiffin_service", label: "Tiffin Service" },
    { key: "refrigerator", label: "Refrigerator / Fridge" },
    { key: "guest_room_for_parents", label: "Guest Room for Parents" }
  ],
  cleaning: [
    { key: "daily_room_cleaning", label: "Daily Room Cleaning" },
    { key: "6_days_week_cleaning", label: "6 Days/Week Cleaning" },
    { key: "5_days_week_cleaning", label: "5 Days/Week Cleaning" }
  ],
  building: [
    { key: "lift", label: "Lift / Elevator" },
    { key: "parking", label: "Parking Space" },
    { key: "wheelchair_access", label: "Wheelchair Access" },
    { key: "terrace_access", label: "Terrace Access" }
  ],
  recreation: [
    { key: "common_tv", label: "Common TV" },
    { key: "common_hall", label: "Common Hall" },
    { key: "indoor_games", label: "Indoor Games" },
    { key: "gym", label: "Gym" },
    { key: "study_room", label: "Study Room" },
    { key: "library", label: "Library" },
    { key: "newspaper_magazine", label: "Newspaper / Magazine" }
  ]
};

export const ROOM_TYPES = [
  { value: "single_sharing_wall", label: "Single Sharing (Wall)" },
  { value: "single_sharing_partition", label: "Single Sharing (Partition)" },
  { value: "single_sharing_attached_washroom", label: "Single Sharing (Attached Washroom)" },
  { value: "double_sharing_wall", label: "Double Sharing (Wall)" },
  { value: "double_sharing_partition", label: "Double Sharing (Partition)" },
  { value: "double_sharing_attached_washroom", label: "Double Sharing (Attached Washroom)" },
  { value: "triple_sharing_wall", label: "Triple Sharing (Wall)" },
  { value: "triple_sharing_partition", label: "Triple Sharing (Partition)" },
  { value: "triple_sharing_attached_washroom", label: "Triple Sharing (Attached Washroom)" },
  { value: "quad_sharing_wall", label: "Quad Sharing (Wall)" },
  { value: "quad_sharing_attached_washroom", label: "Quad Sharing (Attached Washroom)" }
];

export const CITIES = ["Patna", "Muzaffarpur", "Gaya", "Bhagalpur", "Darbhanga"];
export const AREAS_PATNA = [
  "Boring Road", "Bazar Samiti", "Kankarbagh", "NIT Ghat",
  "Ashiyana Digha Road", "Saguna More", "Bailey Road", "Naya Tola",
  "Income Tax", "Dak Banglow Chauraha", "Gandhi Maidan"
];
export const SUBAREAS_PATNA = [
  "Boring Road Chauraha", "Nageshwar Colony", "Anandpuri",
  "Punchmukhi Hanuman Mandir", "Buddha Colony", "Rajapur Pull",
  "Jamuna Apartment", "Krishna Apartment", "Shivpuri", "Punaichak"
];

export interface PhoneNumber {
  number: string;
  label: string;
}

export interface Room {
  room_type: string;
  total_beds: number;
  available_beds_count: number;
  monthly_rent: number;
  is_available: boolean;
  ac: boolean;
}

export interface MealPlan {
  frequency: string;
  meal_type: string;
  service_type: string;
  monthly_cost?: number;
  menu_file?: File;
}

export interface Warden {
  name: string;
  contact_number: string;
  email: string;
  gender: string;
  age: string;
}

export interface FormData {
  name: string;
  hostel_type: string;
  description: string;
  notice_period_days: number;
  total_hostel_beds: number;
  contact_info: {
    phone_numbers: PhoneNumber[];
    email: string;
    warden_name: string;
  };
  warden: Warden;
  address: {
    line1: string;
    line2: string;
    area: string;
    subarea: string;
    pincode: string;
    city: string;
    state: string;
    country: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  rent: {
    security_deposit_type: string;
    registration_fee: number;
  };
  rooms: Room[];
  meal_plans: MealPlan[];
  in_room_amenities: string[];
  washroom_amenities: string[];
  utilities: string[];
  cleaning: string[];
  building_amenities: string[];
  recreation: string[];
  laundry: {
    washing_machine: boolean;
    paid_laundry_service: boolean;
    drying_area: boolean;
  };
  washroom_details: {
    indian_toilet: boolean;
    western_toilet: boolean;
    attached_washroom_available: boolean;
    total_washrooms: number;
    washroom_to_student_ratio: string;
  };
  security: {
    full_time_warden: boolean;
    cctv: boolean;
    security_guard_24x7: boolean;
    biometric_entry: boolean;
    visitor_register: boolean;
    first_aid_kit: boolean;
    fire_extinguisher: boolean;
    transport_facilities: boolean;
  };
  rules: {
    gate_close_time: string;
    late_entry_allowed: boolean;
    smoking_allowed: boolean;
    alcohol_allowed: boolean;
    guest_policy: string;
    pets_allowed: boolean;
    custom_rules: string[];
  };
  nearby_distances: {
    institutes: Array<{ name: string; distance: number; unit: string }>;
    landmarks: Array<{ name: string; distance: number; unit: string }>;
  };
  building_details: {
    building_age_years: number;
    flooring_type: string;
    number_of_floors: number;
  };
  legal_docs: {
    hostel_registration: boolean;
    form_3: boolean;
    food_license: boolean;
    character_certificate: boolean;
    trade_license: boolean;
    fire_noc: boolean;
    hostel_association_member: boolean;
    member_of_hostel_wellfare_association: boolean;
  };
}

export const getInitialFormData = (): FormData => ({
  name: '',
  hostel_type: 'women',
  description: '',
  notice_period_days: 30,
  total_hostel_beds: 0,
  contact_info: {
    phone_numbers: [
      { number: '', label: 'Primary' },
      { number: '', label: 'Alternative' }
    ],
    email: '',
    warden_name: ''
  },
  warden: { name: '', contact_number: '', email: '', gender: 'male', age: '' },
  address: {
    line1: '',
    line2: '',
    area: '',
    subarea: '',
    pincode: '',
    city: 'Patna',
    state: 'Bihar',
    country: 'India'
  },
  location: { type: "Point", coordinates: [85.1376, 25.5941] },
  rent: { security_deposit_type: 'one_month_fee', registration_fee: 0 },
  rooms: [{
    room_type: 'single_sharing_wall',
    total_beds: 1,
    monthly_rent: 0,
    is_available: true,
    available_beds_count: 1,
    ac: false
  }],
  meal_plans: [{
    frequency: '3_times',
    meal_type: 'veg',
    service_type: 'in_house_kitchen',
    monthly_cost: 0
  }],
  in_room_amenities: [],
  washroom_amenities: [],
  utilities: [],
  cleaning: [],
  building_amenities: [],
  recreation: [],
  laundry: {
    washing_machine: false,
    paid_laundry_service: false,
    drying_area: false
  },
  washroom_details: {
    indian_toilet: false,
    western_toilet: false,
    attached_washroom_available: false,
    total_washrooms: 0,
    washroom_to_student_ratio: ''
  },
  security: {
    full_time_warden: false,
    cctv: false,
    security_guard_24x7: false,
    biometric_entry: false,
    visitor_register: false,
    first_aid_kit: false,
    fire_extinguisher: false,
    transport_facilities: false
  },
  rules: {
    gate_close_time: '22:00',
    late_entry_allowed: false,
    smoking_allowed: false,
    alcohol_allowed: false,
    guest_policy: 'family_only',
    pets_allowed: false,
    custom_rules: []
  },
  nearby_distances: {
    institutes: [{ name: '', distance: 0, unit: 'km' }],
    landmarks: [{ name: '', distance: 0, unit: 'km' }]
  },
  building_details: {
    building_age_years: 0,
    flooring_type: 'tiles',
    number_of_floors: 1
  },
  legal_docs: {
    hostel_registration: false,
    form_3: false,
    food_license: false,
    character_certificate: false,
    trade_license: false,
    fire_noc: false,
    hostel_association_member: false,
    member_of_hostel_wellfare_association: false
  }
});
