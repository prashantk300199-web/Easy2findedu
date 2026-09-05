import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
  id: String,
  name: String,
  qualification: String,
  experience: String,
  specialization: String,
  industryExperience: String,
  certifications: String,
  achievements: String,
  bio: String,
  photoFile: String,
  photoPreview: String
}, { _id: false });

const courseSchema = new mongoose.Schema({
  id: String,
  courseName: String,
  courseCode: String,
  category: String,
  duration: String,
  durationType: String,
  mode: String,
  level: String,
  eligibility: String,
  syllabus: String,
  description: String,
  certificationAvailable: Boolean,
  certificateAuthority: String,
  trialAvailable: Boolean,
  practicalTraining: Boolean,
  entranceExamRequired: Boolean,
  entranceExamName: String,
  outcomes: String,
  skills: String
}, { _id: false });

const batchSchema = new mongoose.Schema({
  id: String,
  batchName: String,
  courseId: String,
  courseName: String,
  startDate: String,
  endDate: String,
  daysOfWeek: [String],
  classTiming: String,
  classDuration: String,
  classesPerWeek: String,
  batchSize: String,
  seatsAvailable: String,
  scheduleType: String,
  timeSlot: String,
  mode: String,
  trialAvailable: Boolean,
  status: String
}, { _id: false });

const academicResultSchema = new mongoose.Schema({
  id: String,
  exam: String,
  year: String,
  studentsAppeared: String,
  qualified: String,
  selected: String,
  highestRank: String,
  topScores: String,
  selectionPercentage: String,
  airStateRank: String,
  supportingDocFile: String,
  supportingDocPreview: String
}, { _id: false });

const instituteDraftSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstituteOwner',
    required: true
  },

  // Registration status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },

  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 14
  },

  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  lastSavedAt: {
    type: Date,
    default: Date.now
  },

  // Step 1: Institute Information
  step1InstituteInfo: {
    instituteName: String,
    establishedYear: Number,
    registrationNumber: String,
    logoFile: String,
    logoPreview: String,
    coverImageFile: String,
    coverImagePreview: String,
    about: String,
    totalBranches: Number,
    totalStudents: Number,
    websiteUrl: String,
    awards: String,
    achievements: String
  },

  // Step 2: Category Selection
  step2Category: {
    primaryCategory: String,
    subcategory: String,
    categorySpecificData: mongoose.Schema.Types.Mixed
  },

  // Step 3: Location & Contact
  step3LocationContact: {
    fullAddress: String,
    area: String,
    city: String,
    state: String,
    country: String,
    landmark: String,
    pincode: String,
    googleMapsLink: String,
    phone: String,
    alternatePhone: String,
    email: String,
    whatsapp: String
  },

  // Step 4: Courses/Programs
  step4Courses: {
    courses: [courseSchema]
  },

  // Step 5: Batches & Schedule (NEW - Phase 6)
  step5Batches: {
    batches: [batchSchema]
  },

  // Step 6: Learning Experience (NEW - Phase 6)
  step6LearningExperience: {
    liveClasses: Boolean,
    recordedClasses: Boolean,
    practicalTraining: Boolean,
    liveProjects: Boolean,
    assignments: Boolean,
    tests: Boolean,
    mockTests: Boolean,
    doubtSessions: Boolean,
    personalMentorship: Boolean,
    oneToOneClasses: Boolean,
    studyMaterial: Boolean,
    workshops: Boolean,
    events: Boolean,
    competitions: Boolean,
    performanceOpportunities: Boolean,
    communityAccess: Boolean,
    learningPlatform: Boolean,
    mobileApp: Boolean,
    webPortal: Boolean,
    onlineTests: Boolean,
    whatsappSupport: Boolean,
    technicalSupport: Boolean
  },

  // Step 7: Facilities (RENUMBERED from Step 5)
  step7Facilities: {
    facilities: [String],
    otherFacilities: String
  },

  // Step 8: Faculty/Trainers (RENUMBERED from Step 6)
  step8Faculty: {
    totalFaculty: Number,
    trainerStudentRatio: String,
    teachingMethod: [String],
    studentSupport: String,
    doubtSupport: Boolean,
    oneToOneMentoring: Boolean,
    trainers: [trainerSchema]
  },

  // Step 9: Fees & Scholarships (RENUMBERED from Step 7)
  step9Fees: {
    registrationFee: String,
    admissionFee: String,
    courseFee: String,
    monthlyFee: String,
    quarterlyFee: String,
    materialFee: String,
    kitFee: String,
    examFee: String,
    certificationFee: String,
    otherCharges: String,
    totalPayableAmount: String,
    scholarshipAvailable: Boolean,
    scholarshipDetails: String,
    installmentAvailable: Boolean,
    installmentSchedule: String,
    emiProvider: String,
    refundPolicy: String,
    cancellationPolicy: String
  },

  // Step 10: Admission/Enrollment (RENUMBERED from Step 8)
  step10Admission: {
    admissionType: String,
    admissionProcess: String,
    admissionStartDate: String,
    admissionEndDate: String,
    nextBatchStartDate: String,
    registrationDeadline: String,
    applicationLink: String,
    applicationFee: String,
    requiredDocuments: String,
    admissionContactPerson: String,
    admissionContactNumber: String,
    walkInAvailable: Boolean,
    demoAvailable: Boolean
  },

  // Step 11: Career/Outcomes (RENUMBERED from Step 9, ENHANCED)
  step11Career: {
    placementAssistance: Boolean,
    jobAssistance: Boolean,
    internshipAssistance: Boolean,
    freelancingSupport: Boolean,
    businessSupport: Boolean,
    careerCounselling: Boolean,
    industryConnections: Boolean,
    portfolioDevelopment: Boolean,
    certification: Boolean,
    performanceOpportunities: Boolean,
    competitionOpportunities: Boolean,
    furtherEducationGuidance: Boolean,
    topRecruiters: String,
    industryPartners: String,
    averagePackage: String,
    highestPackage: String,
    placementRate: String,
    careerOutcomes: String
  },

  // Step 12: Results & Achievements (NEW - Phase 6)
  step12Results: {
    results: [academicResultSchema],
    awards: String,
    competitionWins: String,
    studentAchievements: String,
    successStories: String,
    certifications: String
  },

  // Step 13: Gallery & Online Presence (RENUMBERED from Step 10)
  step13Gallery: {
    galleryFiles: [String],
    galleryPreviews: [String],
    videoUrl: String,
    website: String,
    instagram: String,
    facebook: String,
    linkedin: String,
    youtube: String
  },

  // Step 14: Verification (RENUMBERED from Step 11)
  step14Verification: {
    ownerName: String,
    designation: String,
    idProofFile: String,
    idProofPreview: String,
    registrationDocFile: String,
    registrationDocPreview: String,
    gstNumber: String,
    panNumber: String,
    accreditation: String,
    affiliation: String,
    certificationAuthority: String,
    governmentRecognition: String,
    licenseNumber: String,
    addressProofFile: String,
    addressProofPreview: String
  },

  // DEPRECATED: Keep old step fields for backward compatibility during migration
  // These will be automatically migrated to new step numbers
  step5Facilities: {
    facilities: [String],
    otherFacilities: String
  },

  step6Faculty: {
    totalFaculty: Number,
    trainerStudentRatio: String,
    teachingMethod: [String],
    studentSupport: String,
    doubtSupport: Boolean,
    oneToOneMentoring: Boolean,
    trainers: [trainerSchema]
  },

  step7Fees: {
    registrationFee: String,
    admissionFee: String,
    courseFee: String,
    monthlyFee: String,
    quarterlyFee: String,
    materialFee: String,
    kitFee: String,
    examFee: String,
    certificationFee: String,
    otherCharges: String,
    totalPayableAmount: String,
    scholarshipAvailable: Boolean,
    scholarshipDetails: String,
    installmentAvailable: Boolean,
    installmentSchedule: String,
    emiProvider: String,
    refundPolicy: String,
    cancellationPolicy: String
  },

  step8Admission: {
    admissionType: String,
    admissionProcess: String,
    admissionStartDate: String,
    admissionEndDate: String,
    nextBatchStartDate: String,
    registrationDeadline: String,
    applicationLink: String,
    applicationFee: String,
    requiredDocuments: String,
    admissionContactPerson: String,
    admissionContactNumber: String,
    walkInAvailable: Boolean,
    demoAvailable: Boolean
  },

  step9Career: {
    careerServices: [String],
    topRecruiters: String,
    industryPartners: String,
    averagePackage: String,
    highestPackage: String,
    placementRate: Number,
    careerOutcomes: String
  },

  step10Gallery: {
    galleryFiles: [String],
    galleryPreviews: [String],
    videoUrl: String,
    website: String,
    instagram: String,
    facebook: String,
    linkedin: String,
    youtube: String
  },

  step11Verification: {
    ownerName: String,
    designation: String,
    idProofFile: String,
    idProofPreview: String,
    registrationDocFile: String,
    registrationDocPreview: String,
    gstNumber: String,
    panNumber: String,
    accreditation: String,
    affiliation: String,
    certificationAuthority: String,
    governmentRecognition: String,
    licenseNumber: String,
    addressProofFile: String,
    addressProofPreview: String
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
instituteDraftSchema.index({ owner: 1, status: 1 });
instituteDraftSchema.index({ lastSavedAt: -1 });

// Pre-save hook to auto-migrate old step data to new structure
instituteDraftSchema.pre('save', function(next) {
  // Migrate Step 5 (Facilities) → Step 7
  if (this.step5Facilities && !this.step7Facilities) {
    this.step7Facilities = this.step5Facilities;
  }

  // Migrate Step 6 (Faculty) → Step 8
  if (this.step6Faculty && !this.step8Faculty) {
    this.step8Faculty = this.step6Faculty;
  }

  // Migrate Step 7 (Fees) → Step 9
  if (this.step7Fees && !this.step9Fees) {
    this.step9Fees = this.step7Fees;
  }

  // Migrate Step 8 (Admission) → Step 10
  if (this.step8Admission && !this.step10Admission) {
    this.step10Admission = this.step8Admission;
  }

  // Migrate Step 9 (Career) → Step 11
  if (this.step9Career && !this.step11Career) {
    // Map old career structure to new enhanced structure
    this.step11Career = {
      topRecruiters: this.step9Career.topRecruiters,
      industryPartners: this.step9Career.industryPartners,
      averagePackage: this.step9Career.averagePackage,
      highestPackage: this.step9Career.highestPackage,
      placementRate: this.step9Career.placementRate?.toString(),
      careerOutcomes: this.step9Career.careerOutcomes,
      // Map old careerServices array to new boolean fields
      placementAssistance: this.step9Career.careerServices?.includes('Placement Assistance'),
      jobAssistance: this.step9Career.careerServices?.includes('Job Assistance'),
      internshipAssistance: this.step9Career.careerServices?.includes('Internship Assistance'),
      careerCounselling: this.step9Career.careerServices?.includes('Career Counselling')
    };
  }

  // Migrate Step 10 (Gallery) → Step 13
  if (this.step10Gallery && !this.step13Gallery) {
    this.step13Gallery = this.step10Gallery;
  }

  // Migrate Step 11 (Verification) → Step 14
  if (this.step11Verification && !this.step14Verification) {
    this.step14Verification = this.step11Verification;
  }

  // Update lastSavedAt
  this.lastSavedAt = new Date();

  next();
});

// Method to calculate completion percentage
instituteDraftSchema.methods.calculateCompletion = function() {
  const totalSteps = 14;
  let completedSteps = 0;

  if (this.step1InstituteInfo?.instituteName) completedSteps++;
  if (this.step2Category?.primaryCategory) completedSteps++;
  if (this.step3LocationContact?.fullAddress) completedSteps++;
  if (this.step4Courses?.courses?.length > 0) completedSteps++;
  if (this.step5Batches?.batches?.length > 0) completedSteps++;
  if (this.step6LearningExperience) completedSteps++;
  if (this.step7Facilities?.facilities?.length > 0) completedSteps++;
  if (this.step8Faculty?.totalFaculty) completedSteps++;
  if (this.step9Fees?.totalPayableAmount || this.step9Fees?.courseFee) completedSteps++;
  if (this.step10Admission?.admissionType) completedSteps++;
  if (this.step11Career) completedSteps++;
  if (this.step12Results) completedSteps++;
  if (this.step13Gallery?.galleryPreviews?.length > 0 || this.step13Gallery?.website) completedSteps++;
  if (this.step14Verification?.ownerName && this.step14Verification?.idProofPreview) completedSteps++;

  this.completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  return this.completionPercentage;
};

export default mongoose.model('InstituteDraft', instituteDraftSchema);
