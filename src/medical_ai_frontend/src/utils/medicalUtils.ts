import { MedicalFinding, MedicalDiagnosisResult } from '../hooks/useICPAgent';

// Medical image validation
export const validateMedicalImage = (file: File): { isValid: boolean; error?: string } => {
  // File size validation (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image file too large. Maximum size is 50MB.' };
  }

  // File size validation (min 1KB)
  const minSize = 1024;
  if (file.size < minSize) {
    return { isValid: false, error: 'Image file too small. Minimum size is 1KB.' };
  }

  // File type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please upload JPEG, PNG, BMP, or TIFF images.' };
  }

  return { isValid: true };
};

// Convert file to Uint8Array for canister upload
export const fileToUint8Array = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Generate anonymized patient ID
export const generateAnonymizedId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `PAT_${timestamp}_${randomStr}`.toUpperCase();
};

// Format timestamp for medical records
export const formatMedicalTimestamp = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) / 1000000); // Convert from nanoseconds
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
};

// Get confidence level description
export const getConfidenceLevel = (confidence: number): { level: string; color: string; description: string } => {
  if (confidence >= 0.9) {
    return {
      level: 'Very High',
      color: 'bg-green-500',
      description: 'High diagnostic confidence - findings well-supported by image data'
    };
  } else if (confidence >= 0.8) {
    return {
      level: 'High',
      color: 'bg-green-400',
      description: 'Good diagnostic confidence - findings supported by image data'
    };
  } else if (confidence >= 0.7) {
    return {
      level: 'Moderate',
      color: 'bg-yellow-500',
      description: 'Moderate confidence - recommend clinical correlation'
    };
  } else if (confidence >= 0.6) {
    return {
      level: 'Low',
      color: 'bg-orange-500',
      description: 'Low confidence - further imaging or clinical evaluation recommended'
    };
  } else {
    return {
      level: 'Very Low',
      color: 'bg-red-500',
      description: 'Very low confidence - additional studies strongly recommended'
    };
  }
};

// Get severity color coding
export const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'normal':
      return 'text-green-600 bg-green-100';
    case 'mild':
      return 'text-yellow-600 bg-yellow-100';
    case 'moderate':
      return 'text-orange-600 bg-orange-100';
    case 'severe':
      return 'text-red-600 bg-red-100';
    case 'critical':
      return 'text-red-800 bg-red-200';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Sort findings by severity and confidence
export const sortMedicalFindings = (findings: MedicalFinding[]): MedicalFinding[] => {
  const severityOrder = { 'critical': 5, 'severe': 4, 'moderate': 3, 'mild': 2, 'normal': 1 };
  
  return findings.sort((a, b) => {
    const severityA = severityOrder[a.severity.toLowerCase() as keyof typeof severityOrder] || 0;
    const severityB = severityOrder[b.severity.toLowerCase() as keyof typeof severityOrder] || 0;
    
    // Sort by severity first, then by confidence
    if (severityA !== severityB) {
      return severityB - severityA;
    }
    return b.confidence - a.confidence;
  });
};

// Generate medical summary
export const generateMedicalSummary = (diagnosis: MedicalDiagnosisResult): string => {
  const { confidence_score, medical_findings } = diagnosis;
  const confidenceInfo = getConfidenceLevel(confidence_score);
  
  const severeFindings = medical_findings.filter(f => 
    f.severity.toLowerCase() === 'severe' || f.severity.toLowerCase() === 'critical'
  );
  
  let summary = `Diagnostic confidence: ${confidenceInfo.level} (${(confidence_score * 100).toFixed(1)}%). `;
  
  if (severeFindings.length > 0) {
    summary += `${severeFindings.length} severe finding(s) detected requiring immediate attention. `;
  }
  
  if (medical_findings.length > 0) {
    summary += `Total ${medical_findings.length} finding(s) identified. `;
  }
  
  return summary + confidenceInfo.description;
};

// Validate patient metadata
export const validatePatientMetadata = (metadata: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!metadata.anonymized_id || metadata.anonymized_id.trim() === '') {
    errors.push('Anonymized patient ID is required');
  }
  
  if (!metadata.age_range || metadata.age_range.trim() === '') {
    errors.push('Patient age range is required');
  }
  
  if (!metadata.study_type || metadata.study_type.trim() === '') {
    errors.push('Study type is required');
  }
  
  if (!metadata.acquisition_date || metadata.acquisition_date.trim() === '') {
    errors.push('Acquisition date is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export medical data for regulatory compliance
export const exportComplianceData = (diagnosis: MedicalDiagnosisResult): string => {
  const data = {
    medical_report: {
      diagnosis_id: diagnosis.id.toString(),
      timestamp: formatMedicalTimestamp(diagnosis.timestamp),
      diagnosis: diagnosis.diagnosis,
      confidence_score: diagnosis.confidence_score,
      model_version: diagnosis.model_version,
      findings: diagnosis.medical_findings,
      compliance: {
        fda_compliant: diagnosis.fda_compliant,
        hipaa_compliant: diagnosis.hipaa_compliant,
      },
      cryptographic_verification: {
        signature_present: diagnosis.signature.length > 0,
        public_key_present: diagnosis.public_key.length > 0,
      },
      patient_metadata: diagnosis.patient_metadata,
    }
  };
  
  return JSON.stringify(data, null, 2);
};

// Medical terminology standardization
export const standardizeMedicalTerms = (text: string): string => {
  const replacements: { [key: string]: string } = {
    'xray': 'X-ray',
    'x-ray': 'X-ray',
    'ct scan': 'CT scan',
    'mri': 'MRI',
    'pneumonia': 'pneumonia',
    'effusion': 'effusion',
    'cardiomegaly': 'cardiomegaly',
    'pneumothorax': 'pneumothorax',
  };
  
  let standardized = text;
  Object.entries(replacements).forEach(([term, replacement]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    standardized = standardized.replace(regex, replacement);
  });
  
  return standardized;
};

// Calculate processing metrics
export const calculateProcessingMetrics = (startTime: number, endTime: number, imageSize: number) => {
  const processingTime = endTime - startTime;
  const throughput = imageSize / (processingTime / 1000); // bytes per second
  
  return {
    processingTimeMs: processingTime,
    throughputBps: throughput,
    throughputMBps: throughput / (1024 * 1024),
  };
};
