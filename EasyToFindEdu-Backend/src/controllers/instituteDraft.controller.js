import InstituteDraft from '../models/InstituteDraft.js';
import { uploadOnCloudinary } from '../config/cloudinary.js';

// Get draft for logged-in owner
export const getDraft = async (req, res) => {
  try {
    const ownerId = req.user.id;

    let draft = await InstituteDraft.findOne({
      owner: ownerId,
      status: 'draft'
    }).sort({ lastSavedAt: -1 });

    if (!draft) {
      // Create new draft if none exists
      draft = new InstituteDraft({
        owner: ownerId,
        status: 'draft',
        currentStep: 1,
        completionPercentage: 0
      });
      await draft.save();
    }

    res.status(200).json({
      success: true,
      data: draft
    });
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve draft',
      error: error.message
    });
  }
};

// Save draft (manual save or auto-save)
export const saveDraft = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      currentStep,
      step1InstituteInfo,
      step2Category,
      step3LocationContact,
      step4Courses,
      step5Facilities,
      step6Faculty,
      step7Fees,
      step8Admission,
      step9Career,
      step10Gallery,
      step11Verification
    } = req.body;

    let draft = await InstituteDraft.findOne({
      owner: ownerId,
      status: 'draft'
    });

    if (!draft) {
      draft = new InstituteDraft({ owner: ownerId });
    }

    // Update fields
    if (currentStep) draft.currentStep = currentStep;
    if (step1InstituteInfo) draft.step1InstituteInfo = { ...draft.step1InstituteInfo, ...step1InstituteInfo };
    if (step2Category) draft.step2Category = { ...draft.step2Category, ...step2Category };
    if (step3LocationContact) draft.step3LocationContact = { ...draft.step3LocationContact, ...step3LocationContact };
    if (step4Courses) draft.step4Courses = { ...draft.step4Courses, ...step4Courses };
    if (step5Facilities) draft.step5Facilities = { ...draft.step5Facilities, ...step5Facilities };
    if (step6Faculty) draft.step6Faculty = { ...draft.step6Faculty, ...step6Faculty };
    if (step7Fees) draft.step7Fees = { ...draft.step7Fees, ...step7Fees };
    if (step8Admission) draft.step8Admission = { ...draft.step8Admission, ...step8Admission };
    if (step9Career) draft.step9Career = { ...draft.step9Career, ...step9Career };
    if (step10Gallery) draft.step10Gallery = { ...draft.step10Gallery, ...step10Gallery };
    if (step11Verification) draft.step11Verification = { ...draft.step11Verification, ...step11Verification };

    // Calculate completion percentage
    draft.calculateCompletion();

    // Update last saved timestamp
    draft.lastSavedAt = new Date();

    await draft.save();

    res.status(200).json({
      success: true,
      message: 'Draft saved successfully',
      data: {
        currentStep: draft.currentStep,
        completionPercentage: draft.completionPercentage,
        lastSavedAt: draft.lastSavedAt
      }
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message
    });
  }
};

// Upload file for draft (images, documents)
export const uploadDraftFile = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { fieldName, stepNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadOnCloudinary(req.file, {
      folder: `institute-drafts/${ownerId}`,
      resource_type: 'auto'
    });

    // Get or create draft
    let draft = await InstituteDraft.findOne({
      owner: ownerId,
      status: 'draft'
    });

    if (!draft) {
      draft = new InstituteDraft({ owner: ownerId });
    }

    // Store file URL based on step and field
    const fileUrl = result.secure_url;
    const stepKey = `step${stepNumber}`;

    if (!draft[stepKey]) {
      draft[stepKey] = {};
    }

    draft[stepKey][fieldName] = fileUrl;
    draft.lastSavedAt = new Date();

    await draft.save();

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        fieldName,
        stepNumber
      }
    });
  } catch (error) {
    console.error('Upload draft file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

// Submit draft for verification (final submission)
export const submitDraft = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const draft = await InstituteDraft.findOne({
      owner: ownerId,
      status: 'draft'
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'No draft found to submit'
      });
    }

    // Validate required fields
    if (!draft.step1InstituteInfo?.instituteName) {
      return res.status(400).json({
        success: false,
        message: 'Institute name is required'
      });
    }

    if (!draft.step11Verification?.ownerName || !draft.step11Verification?.idProofPreview) {
      return res.status(400).json({
        success: false,
        message: 'Verification documents are required'
      });
    }

    // Update status to submitted
    draft.status = 'submitted';
    draft.currentStep = 11;
    draft.completionPercentage = 100;
    draft.lastSavedAt = new Date();

    await draft.save();

    res.status(200).json({
      success: true,
      message: 'Registration submitted successfully. Your institute will be reviewed by our team.',
      data: draft
    });
  } catch (error) {
    console.error('Submit draft error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit registration',
      error: error.message
    });
  }
};

// Delete draft
export const deleteDraft = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const draft = await InstituteDraft.findOneAndDelete({
      owner: ownerId,
      status: 'draft'
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'No draft found to delete'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete draft',
      error: error.message
    });
  }
};

// Get draft status for dashboard
export const getDraftStatus = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const draft = await InstituteDraft.findOne({
      owner: ownerId,
      status: 'draft'
    }).select('currentStep completionPercentage lastSavedAt status');

    res.status(200).json({
      success: true,
      data: draft || null
    });
  } catch (error) {
    console.error('Get draft status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get draft status',
      error: error.message
    });
  }
};
