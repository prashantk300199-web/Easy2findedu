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

const instituteDraftSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstituteOwner',
    required: true,
    index: true
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
    max: 11
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
    subcategories: [String],
    categorySpecificData: mongoose.Schema.Types.Mixed
  },

  // Step 3: Location & Contact
  step3LocationContact: {
    state: String,
    city: String,
    area: String,
    subarea: String,
    fullAddress: String,
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

  // Step 5: Facilities
  step5Facilities: {
    facilities: [String],
    otherFacilities: String
  },

  // Step 6: Faculty/Trainers
  step6Faculty: {
    totalFaculty: Number,
    trainerStudentRatio: String,
    teachingMethod: [String],
    studentSupport: String,
    doubtSupport: Boolean,
    oneToOneMentoring: Boolean,
    trainers: [trainerSchema]
  },

  // Step 7: Fees & Scholarships
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

  // Step 8: Admission/Enrollment
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

  // Step 9: Career/Outcomes
  step9Career: {
    careerServices: [String],
    topRecruiters: String,
    industryPartners: String,
    averagePackage: String,
    highestPackage: String,
    placementRate: Number,
    careerOutcomes: String
  },

  // Step 10: Gallery & Online Presence
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

  // Step 11: Verification
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

// Method to update last saved timestamp
instituteDraftSchema.methods.updateLastSaved = function() {
  this.lastSavedAt = new Date();
  return this.save();
};

// Method to calculate completion percentage
instituteDraftSchema.methods.calculateCompletion = function() {
  let completedSteps = 0;
  const totalSteps = 11;

  // Check each step for completion
  if (this.step1InstituteInfo?.instituteName) completedSteps++;
  if (this.step2Category?.primaryCategory) completedSteps++;
  if (this.step3LocationContact?.fullAddress) completedSteps++;
  if (this.step4Courses?.courses?.length > 0) completedSteps++;
  if (this.step5Facilities?.facilities?.length > 0) completedSteps++;
  if (this.step6Faculty?.totalFaculty) completedSteps++;
  if (this.step7Fees?.totalPayableAmount || this.step7Fees?.courseFee) completedSteps++;
  if (this.step8Admission?.admissionType) completedSteps++;
  if (this.step9Career?.careerServices?.length > 0) completedSteps++;
  if (this.step10Gallery?.galleryPreviews?.length > 0 || this.step10Gallery?.website) completedSteps++;
  if (this.step11Verification?.ownerName && this.step11Verification?.idProofPreview) completedSteps++;

  this.completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  return this.completionPercentage;
};

export default mongoose.model('InstituteDraft', instituteDraftSchema);
