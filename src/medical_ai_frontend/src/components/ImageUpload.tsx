import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useICPAgent, PatientMetadata, MedicalDiagnosisResult } from '../hooks/useICPAgent';
import { 
  validateMedicalImage, 
  fileToUint8Array, 
  generateAnonymizedId,
  validatePatientMetadata 
} from '../utils/medicalUtils';

interface ImageUploadProps {
  onDiagnosisComplete: (diagnosis: MedicalDiagnosisResult) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onDiagnosisComplete }) => {
  const { analyzeMedicalImage, isAuthenticated } = useICPAgent();
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Patient metadata form
  const [patientMetadata, setPatientMetadata] = useState<PatientMetadata>({
    anonymized_id: generateAnonymizedId(),
    age_range: '',
    study_type: 'Chest X-ray',
    acquisition_date: new Date().toISOString().split('T')[0]
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const validation = validateMedicalImage(file);
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    
    setUploadedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff']
    },
    maxFiles: 1,
    multiple: false
  });

  const removeFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError('Please select an image file');
      return;
    }

    const metadataValidation = validatePatientMetadata(patientMetadata);
    if (!metadataValidation.isValid) {
      setError(metadataValidation.errors.join(', '));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Convert file to Uint8Array
      const imageData = await fileToUint8Array(uploadedFile);
      
      // Analyze with backend
      const diagnosis = await analyzeMedicalImage(imageData, patientMetadata);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Complete analysis
      setTimeout(() => {
        onDiagnosisComplete(diagnosis);
        
        // Reset form
        removeFile();
        setPatientMetadata({
          anonymized_id: generateAnonymizedId(),
          age_range: '',
          study_type: 'Chest X-ray',
          acquisition_date: new Date().toISOString().split('T')[0]
        });
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analysis failed');
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-medical-primary bg-blue-50'
            : uploadedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-medical-primary hover:bg-blue-50'
        }`}
      >
        <input {...getInputProps()} />
        
        {!uploadedFile ? (
          <div>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-medical-dark mb-2">
              Upload Medical Image
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop a chest X-ray image, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports JPEG, PNG, BMP, TIFF • Max 50MB • Min 1KB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <Check className="h-6 w-6" />
              <span className="font-medium">File Ready for Analysis</span>
            </div>
            
            {previewUrl && (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Medical image preview"
                  className="max-h-32 rounded-lg shadow-md"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p className="font-medium">{uploadedFile.name}</p>
              <p>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Metadata Form */}
      <div className="medical-card">
        <h3 className="text-lg font-semibold text-medical-dark mb-4">
          Patient Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anonymized Patient ID
            </label>
            <input
              type="text"
              value={patientMetadata.anonymized_id}
              onChange={(e) => setPatientMetadata(prev => ({
                ...prev,
                anonymized_id: e.target.value
              }))}
              className="medical-input"
              placeholder="PAT_123ABC..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Range
            </label>
            <select
              value={patientMetadata.age_range}
              onChange={(e) => setPatientMetadata(prev => ({
                ...prev,
                age_range: e.target.value
              }))}
              className="medical-input"
            >
              <option value="">Select age range</option>
              <option value="0-18">0-18 years</option>
              <option value="19-30">19-30 years</option>
              <option value="31-50">31-50 years</option>
              <option value="51-70">51-70 years</option>
              <option value="71+">71+ years</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Type
            </label>
            <select
              value={patientMetadata.study_type}
              onChange={(e) => setPatientMetadata(prev => ({
                ...prev,
                study_type: e.target.value
              }))}
              className="medical-input"
            >
              <option value="Chest X-ray">Chest X-ray</option>
              <option value="Chest CT">Chest CT</option>
              <option value="Chest MRI">Chest MRI</option>
              <option value="Mammography">Mammography</option>
              <option value="Bone X-ray">Bone X-ray</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acquisition Date
            </label>
            <input
              type="date"
              value={patientMetadata.acquisition_date}
              onChange={(e) => setPatientMetadata(prev => ({
                ...prev,
                acquisition_date: e.target.value
              }))}
              className="medical-input"
            />
          </div>
        </div>
      </div>

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Demo Mode</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Analysis will work in demo mode, but for full compliance features and permanent storage, 
                please log in with Internet Identity.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="medical-card">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 text-medical-primary animate-spin" />
              <span className="text-lg font-medium text-medical-dark">
                Analyzing Medical Image...
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-medical-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>Processing medical image with AI model</p>
              <p>Generating cryptographic signature</p>
              <p>Validating compliance requirements</p>
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!uploadedFile || isAnalyzing}
        className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
          !uploadedFile || isAnalyzing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-medical-primary hover:bg-blue-700'
        }`}
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analyzing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Analyze Medical Image</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ImageUpload;
