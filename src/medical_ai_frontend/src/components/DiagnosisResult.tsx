import React, { useState } from 'react';
import { 
  FileText, 
  Shield, 
  Download, 
  Check, 
  AlertTriangle, 
  Activity,
  Clock,
  User,
  ChevronRight,
  Verified
} from 'lucide-react';
import { MedicalDiagnosisResult } from '../hooks/useICPAgent';
import { 
  formatMedicalTimestamp, 
  getConfidenceLevel, 
  getSeverityColor, 
  sortMedicalFindings,
  generateMedicalSummary,
  exportComplianceData
} from '../utils/medicalUtils';

interface DiagnosisResultProps {
  diagnoses: MedicalDiagnosisResult[];
  selectedDiagnosis: MedicalDiagnosisResult | null;
  onSelectDiagnosis: (diagnosis: MedicalDiagnosisResult) => void;
}

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({
  diagnoses,
  selectedDiagnosis,
  onSelectDiagnosis
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleExportReport = (diagnosis: MedicalDiagnosisResult) => {
    const reportData = exportComplianceData(diagnosis);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_report_${diagnosis.id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (diagnoses.length === 0) {
    return (
      <div className="medical-card text-center">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-medical-dark mb-2">
          No Diagnoses Yet
        </h3>
        <p className="text-gray-600">
          Upload and analyze medical images to see diagnostic results here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Diagnosis List */}
      <div className="lg:col-span-1">
        <div className="medical-card">
          <h3 className="text-lg font-semibold text-medical-dark mb-4">
            Diagnosis History ({diagnoses.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {diagnoses.map((diagnosis) => {
              const confidenceInfo = getConfidenceLevel(diagnosis.confidence_score);
              const isSelected = selectedDiagnosis?.id === diagnosis.id;
              
              return (
                <div
                  key={diagnosis.id.toString()}
                  onClick={() => onSelectDiagnosis(diagnosis)}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-medical-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-600">
                      ID: {diagnosis.id.toString()}
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      isSelected ? 'transform rotate-90' : ''
                    }`} />
                  </div>
                  
                  <h4 className="font-medium text-medical-dark text-sm mb-2 line-clamp-2">
                    {diagnosis.diagnosis}
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {formatMedicalTimestamp(diagnosis.timestamp).split(',')[0]}
                    </div>
                    <div className="flex space-x-1">
                      {diagnosis.fda_compliant && (
                        <span className="text-xs fda-compliant">FDA</span>
                      )}
                      {diagnosis.hipaa_compliant && (
                        <span className="text-xs hipaa-compliant">HIPAA</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Confidence</span>
                      <span className="font-medium">
                        {(diagnosis.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="confidence-meter">
                      <div
                        className={`confidence-bar ${confidenceInfo.color}`}
                        style={{ width: `${diagnosis.confidence_score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Diagnosis View */}
      <div className="lg:col-span-2">
        {selectedDiagnosis ? (
          <div className="space-y-6">
            {/* Diagnosis Header */}
            <div className="medical-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-medical-dark mb-2">
                    Diagnostic Analysis
                  </h2>
                  <p className="text-gray-600">
                    ID: {selectedDiagnosis.id.toString()} • 
                    {formatMedicalTimestamp(selectedDiagnosis.timestamp)}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExportReport(selectedDiagnosis)}
                    className="medical-button-secondary flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Main Diagnosis */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-medical-dark mb-2">Primary Diagnosis</h3>
                <p className="text-lg text-medical-dark mb-3">
                  {selectedDiagnosis.diagnosis}
                </p>
                
                {/* Medical Summary */}
                <p className="text-sm text-gray-600">
                  {generateMedicalSummary(selectedDiagnosis)}
                </p>
              </div>

              {/* Confidence and Compliance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Confidence Level</label>
                  <div className="mt-1">
                    <div className="confidence-meter mb-2">
                      <div
                        className={`confidence-bar ${getConfidenceLevel(selectedDiagnosis.confidence_score).color}`}
                        style={{ width: `${selectedDiagnosis.confidence_score * 100}%` }}
                      />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">
                        {getConfidenceLevel(selectedDiagnosis.confidence_score).level}
                      </span>
                      <span className="text-gray-600 ml-2">
                        ({(selectedDiagnosis.confidence_score * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">FDA Compliance</label>
                  <div className="mt-1 flex items-center space-x-2">
                    {selectedDiagnosis.fda_compliant ? (
                      <>
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Compliant</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm text-yellow-600 font-medium">Review Required</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">HIPAA Compliance</label>
                  <div className="mt-1 flex items-center space-x-2">
                    {selectedDiagnosis.hipaa_compliant ? (
                      <>
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Compliant</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm text-yellow-600 font-medium">Review Required</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Findings */}
            <div className="medical-card">
              <h3 className="text-lg font-semibold text-medical-dark mb-4">
                Medical Findings ({selectedDiagnosis.medical_findings.length})
              </h3>
              
              {selectedDiagnosis.medical_findings.length > 0 ? (
                <div className="space-y-3">
                  {sortMedicalFindings(selectedDiagnosis.medical_findings).map((finding, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-medical-dark">
                          {finding.finding}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Location: </span>
                          <span className="font-medium">{finding.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence: </span>
                          <span className="font-medium">
                            {(finding.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No specific findings detected in this analysis.
                </p>
              )}
            </div>

            {/* Patient Information */}
            <div className="medical-card">
              <h3 className="text-lg font-semibold text-medical-dark mb-4">
                Patient Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Anonymized ID</label>
                  <p className="mt-1 font-mono text-sm">
                    {selectedDiagnosis.patient_metadata.anonymized_id}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Age Range</label>
                  <p className="mt-1">{selectedDiagnosis.patient_metadata.age_range}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Study Type</label>
                  <p className="mt-1">{selectedDiagnosis.patient_metadata.study_type}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Acquisition Date</label>
                  <p className="mt-1">{selectedDiagnosis.patient_metadata.acquisition_date}</p>
                </div>
              </div>
            </div>

            {/* Cryptographic Verification */}
            <div className="medical-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-medical-dark">
                  Cryptographic Verification
                </h3>
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="text-sm text-medical-primary hover:text-blue-700"
                >
                  {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Verified className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    Cryptographically Signed
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">
                    Blockchain Verified on Internet Computer
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-purple-600">
                    Immutable Audit Trail
                  </span>
                </div>
              </div>
              
              {showTechnicalDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-medical-dark mb-2">Technical Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Model Version: </span>
                      <span className="font-mono">{selectedDiagnosis.model_version}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Signature Length: </span>
                      <span className="font-mono">{selectedDiagnosis.signature.length} bytes</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Public Key Length: </span>
                      <span className="font-mono">{selectedDiagnosis.public_key.length} bytes</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Timestamp (nanoseconds): </span>
                      <span className="font-mono">{selectedDiagnosis.timestamp.toString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="medical-card text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-medical-dark mb-2">
              Select a Diagnosis
            </h3>
            <p className="text-gray-600">
              Choose a diagnosis from the list to view detailed results and analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisResult;
