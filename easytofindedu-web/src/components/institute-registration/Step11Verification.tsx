import { useState } from 'react';
import { Shield, Upload, X, AlertTriangle } from 'lucide-react';

interface Step11Props {
  data?: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSaveDraft: (data: any) => void;
  loading: boolean;
}

export default function Step11Verification({ data, onNext, onBack, onSaveDraft, loading }: Step11Props) {
  const [formData, setFormData] = useState({
    ownerName: data?.ownerName || '',
    designation: data?.designation || '',
    idProofFile: null as File | null,
    idProofPreview: data?.idProofPreview || '',
    registrationDocFile: null as File | null,
    registrationDocPreview: data?.registrationDocPreview || '',
    gstNumber: data?.gstNumber || '',
    panNumber: data?.panNumber || '',
    accreditation: data?.accreditation || '',
    affiliation: data?.affiliation || '',
    certificationAuthority: data?.certificationAuthority || '',
    governmentRecognition: data?.governmentRecognition || '',
    licenseNumber: data?.licenseNumber || '',
    addressProofFile: null as File | null,
    addressProofPreview: data?.addressProofPreview || ''
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max for documents)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev: any) => ({
          ...prev,
          [field]: 'File size must be less than 10MB'
        }));
        return;
      }

      // Allow images and PDFs for documents
      const allowedTypes = ['image/', 'application/pdf'];
      const isAllowed = allowedTypes.some(type => file.type.startsWith(type));

      if (!isAllowed) {
        setErrors((prev: any) => ({
          ...prev,
          [field]: 'Only images and PDF files are allowed'
        }));
        return;
      }

      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';

      if (field === 'idProof') {
        setFormData(prev => ({
          ...prev,
          idProofFile: file,
          idProofPreview: previewUrl
        }));
      } else if (field === 'registrationDoc') {
        setFormData(prev => ({
          ...prev,
          registrationDocFile: file,
          registrationDocPreview: previewUrl
        }));
      } else if (field === 'addressProof') {
        setFormData(prev => ({
          ...prev,
          addressProofFile: file,
          addressProofPreview: previewUrl
        }));
      }

      if (errors[field]) {
        setErrors((prev: any) => ({ ...prev, [field]: '' }));
      }
    }
  };

  const removeFile = (field: string) => {
    if (field === 'idProof') {
      setFormData(prev => ({
        ...prev,
        idProofFile: null,
        idProofPreview: ''
      }));
    } else if (field === 'registrationDoc') {
      setFormData(prev => ({
        ...prev,
        registrationDocFile: null,
        registrationDocPreview: ''
      }));
    } else if (field === 'addressProof') {
      setFormData(prev => ({
        ...prev,
        addressProofFile: null,
        addressProofPreview: ''
      }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner/Representative name is required';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }

    if (!formData.idProofFile && !formData.idProofPreview) {
      newErrors.idProof = 'Government ID proof is required';
    }

    if (!formData.registrationDocFile && !formData.registrationDocPreview) {
      newErrors.registrationDoc = 'Institute registration document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  const handleSave = () => {
    onSaveDraft(formData);
  };

  const renderFileUpload = (
    field: string,
    label: string,
    required: boolean,
    file: File | null,
    preview: string
  ) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {preview || file ? (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preview ? (
                  <img
                    src={preview}
                    alt={label}
                    className="w-16 h-16 object-cover rounded border border-gray-300"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                    <Shield className="text-gray-400" size={24} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file?.name || 'Document uploaded'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file && (file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(field)}
                className="text-red-600 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Click to upload {label}</p>
              <p className="text-xs text-gray-400">Image or PDF up to 10MB</p>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileChange(e, field)}
              className="hidden"
            />
          </label>
        )}
        {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
      </div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification</h2>
      <p className="text-gray-600 mb-6">Provide verification documents for admin approval</p>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Privacy & Security</h4>
            <p className="text-sm text-blue-800">
              All verification documents are kept <strong>strictly confidential</strong> and are accessible only to authorized admin users.
              These documents will never be publicly visible or shared with third parties.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Required Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} />
            Required Information
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner / Authorized Representative Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Full name as per official documents"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.ownerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="E.g., Owner, Director, Principal"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.designation ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
              </div>
            </div>

            {renderFileUpload(
              'idProof',
              'Government / Official ID Proof (Aadhaar, PAN, Passport, etc.)',
              true,
              formData.idProofFile,
              formData.idProofPreview
            )}

            {renderFileUpload(
              'registrationDoc',
              'Authorization / Institute Registration Document',
              true,
              formData.registrationDocFile,
              formData.registrationDocPreview
            )}
          </div>
        </div>

        {/* Optional Information */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Optional Information
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Providing additional verification details helps build trust and credibility
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="Enter PAN number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accreditation
                </label>
                <input
                  type="text"
                  name="accreditation"
                  value={formData.accreditation}
                  onChange={handleChange}
                  placeholder="E.g., NAAC, NBA, ISO"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affiliation
                </label>
                <input
                  type="text"
                  name="affiliation"
                  value={formData.affiliation}
                  onChange={handleChange}
                  placeholder="E.g., University/Board affiliation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification Authority
                </label>
                <input
                  type="text"
                  name="certificationAuthority"
                  value={formData.certificationAuthority}
                  onChange={handleChange}
                  placeholder="Certifying body name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Government Recognition
                </label>
                <input
                  type="text"
                  name="governmentRecognition"
                  value={formData.governmentRecognition}
                  onChange={handleChange}
                  placeholder="E.g., State/Central govt recognition"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Business/Trade license number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {renderFileUpload(
              'addressProof',
              'Address Verification Document',
              false,
              formData.addressProofFile,
              formData.addressProofPreview
            )}
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Important Notice</h4>
              <p className="text-sm text-yellow-800">
                Please ensure all information and documents provided are accurate and authentic.
                False information or fake documents may result in permanent account suspension and legal action.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
