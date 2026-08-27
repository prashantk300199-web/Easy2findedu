export interface CloudinaryImage {
  publicId?: string;
  url?: string;
}

export interface NamedRef {
  _id: string;
  name: string;
}

export interface InstituteFacilities {
  smartClass?: boolean;
  wifiCampus?: boolean;
  biometricAttendance?: boolean;
  cctv?: boolean;
  library?: boolean;
  hostel?: boolean;
  canteen?: boolean;
  parking?: boolean;
  acClassroom?: boolean;
  generatorBackup?: boolean;
  doubtFaculty?: boolean;
  recordedLecture?: boolean;
  testSeries?: boolean;
  mockTest?: boolean;
  parentMonitoring?: boolean;
  firstAidKit?: boolean;
  studentSupport?: boolean;
  careerCounseling?: boolean;
  digitalBoard?: boolean;
  appAccess?: boolean;
}

export interface Institute {
  _id: string;
  name: string;
  logo?: CloudinaryImage;
  coverImage?: CloudinaryImage;
  galleryImages?: CloudinaryImage[];
  establishedYear?: number;
  instituteAge?: number;
  directorName?: string;
  websiteUrl?: string;
  totalBranches?: number;
  about?: string;
  avgFacultyExperience?: number;
  location?: {
    state?: string;
    city?: NamedRef | string;
    cityName?: string;
    area?: NamedRef | string;
    areaName?: string;
    fullAddress?: string;
    landmark?: string;
    distanceFromLandmarks?: { landmarkName?: string; distanceInKm?: number }[];
  };
  facilities?: InstituteFacilities;
  academicInfo?: {
    studentFacultyRatio?: string;
    teachingMethodology?: string;
    mockTestFrequency?: string;
    remedialClasses?: boolean;
    parentTeacherMeeting?: boolean;
    onlineClasses?: boolean;
    dropoutRate?: number;
    residentialProgram?: boolean;
  };
  transparency?: {
    admissionProcess?: string;
    feeClarity?: string;
    refundPolicy?: string;
    termsAndConditions?: string;
    codeOfConduct?: string;
    grievanceSystem?: string;
  };
  comparisonMetrics?: {
    academicScore?: number;
    facultyScore?: number;
    infrastructureScore?: number;
    transparencyScore?: number;
    careerOutcomesScore?: number;
    overallScore?: number;
  };
  courses?: unknown[];
}

export interface CourseFees {
  tuitionFee?: number;
  examFee?: number;
  securityFee?: number;
  developmentFee?: number;
  uniformLabCharges?: number;
  otherFees?: number;
  totalYearlyExpense?: number;
}

export interface CourseDetail {
  _id?: string;
  courseName?: string;
  fullForm?: string;
  degreeType?: string;
  stream?: string;
  specialization?: string;
  semesters?: number;
  internshipIncluded?: boolean;
  eligibility?: string;
  requiredSubjects?: string[];
  entranceExamsAccepted?: string[];
  intakeSeats?: number;
  modeOfStudy?: string;
  careerOptions?: string[];
  duration?: { value?: number; unit?: string };
}

export interface CollegeCourse {
  _id?: string;
  course?: CourseDetail | string;
  fees?: CourseFees;
  examsAccepted?: string[];
  cutoffs?: unknown;
}

export interface College {
  _id: string;
  name: string;
  shortName?: string;
  about?: string;
  logo?: string;
  bannerImages?: string[];
  establishedYear?: number;
  ownershipType?: string;
  affiliationType?: string;
  collegeType?: string;
  approvedBy?: string[];
  accreditation?: string[];
  coursesOffered?: CollegeCourse[];
  contact?: {
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  admission?: {
    process?: string;
    quotas?: Record<string, boolean>;
    importantDates?: unknown[];
  };
  placements?: {
    placementPercentage?: number;
    internshipPercentage?: number;
    highestPackage?: number;
    averagePackage?: number;
    topRecruiters?: string[];
  };
  hostel?: {
    isAvailable?: boolean;
    foodIncluded?: boolean;
    otherFees?: number;
  };
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  views?: number;
  coverImage?: CloudinaryImage;
  publishedAt?: string;
}

export interface Pagination {
  page?: number;
  limit?: number;
  total?: number;
  pages?: number;
}

export interface HostelRoom {
  room_type?: string;
  total_beds?: number;
  available_beds_count?: number;
  monthly_rent?: number;
  is_available?: boolean;
  ac?: boolean;
}

export interface Hostel {
  _id: string;
  name: string;
  masked_name?: string;
  slug: string;
  hostel_type?: string;
  description?: string;
  photos?: CloudinaryImage[];
  address?: {
    line1?: string;
    area?: string;
    subarea?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  rooms?: HostelRoom[];
  total_hostel_beds?: number;
  in_room_amenities?: string[];
  common_amenities?: string[];
  recreation?: string[];
  meal_plans?: { frequency?: string; meal_type?: string; service_type?: string }[];
  security?: Record<string, boolean>;
  rules?: {
    gate_close_time?: string;
    late_entry_allowed?: boolean;
    smoking_allowed?: boolean;
    alcohol_allowed?: boolean;
    guest_policy?: string;
    pets_allowed?: boolean;
    custom_rules?: string[];
  };
  washroom_details?: { total_washrooms?: number; washroom_to_student_ratio?: string };
  warden?: { name?: string; contact_number?: string };
  nearby_distances?: {
    institutes?: { name?: string; distance_km?: number }[];
    landmarks?: { name?: string; distance_km?: number }[];
  };
  building_details?: { building_age_years?: number; number_of_floors?: number; flooring_type?: string };
  rent?: { registration_fee?: number; security_deposit_type?: string };
  is_open?: boolean;
  notice_period_days?: number;
  legal_docs?: Record<string, boolean>;
}
