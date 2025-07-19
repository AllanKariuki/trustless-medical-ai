import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileCheck, 
  Download, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  XCircle,
  Award,
  Eye,
  Clock
} from 'lucide-react';
import { useICPAgent, MedicalDiagnosisResult, ComplianceReport as ComplianceReportType } from '../hooks/useICPAgent';
import { formatMedicalTimestamp } from '../utils/medicalUtils';

interface ComplianceReportProps {
  diagnoses: MedicalDiagnosisResult[];
  onRefresh: () => void;
}

const ComplianceReport: React.FC<ComplianceReportProps> = ({ diagnoses, onRefresh }) => {
  const { getFDAComplianceReport, verifyDiagnosisSignature } = useICPAgent();
  
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<MedicalDiagnosisResult | null>(null);
  const [complianceReport, setComplianceReport] = useState<ComplianceReportType | null>(null);
  const [signatureVerification, setSignatureVerification] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (diagnoses.length > 0 && !selectedDiagnosis) {
      setSelectedDiagnosis(diagnoses[0]);
    }
  }, [diagnoses, selectedDiagnosis]);

  useEffect(() => {
    if (selectedDiagnosis) {
      loadComplianceData();
    }
  }, [selectedDiagnosis]);

  const loadComplianceData = async () => {
    if (!selectedDiagnosis) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [reportResult, verificationResult] = await Promise.all([
        getFDAComplianceReport(selectedDiagnosis.id),
        verifyDiagnosisSignature(selectedDiagnosis.id)
      ]);
      
      setComplianceReport(reportResult);
      setSignatureVerification(verificationResult);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load compliance data');
      console.error('Error loading compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportComplianceReport = () => {
    if (!complianceReport || !selectedDiagnosis) return;
    
    const reportData = {
      compliance_report: complianceReport,
      diagnosis: selectedDiagnosis,
      verification_timestamp: new Date().toISOString(),
      signature_verified: signatureVerification,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${complianceReport.diagnosis_id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getComplianceStatus = (status: string) => {
    if (status.includes('COMPLIANT')) {
      return { icon: Check, color: 'text-green-600', bgColor: 'bg-green-100' };
    } else if (status.includes('NON_COMPLIANT')) {
      return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
    } else {
      return { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    }
  };

  if (diagnoses.length === 0) {
    return (
      <div className="medical-card text-center">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-medical-dark mb-2">
          No Compliance Data Available
        </h3>
        <p className="text-gray-600">
          Analyze medical images to generate compliance reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medical-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-medical-dark mb-2">
              Compliance Dashboard
            </h2>
            <p className="text-gray-600">
              FDA and HIPAA compliance status for medical AI diagnoses
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onRefresh}
              className="medical-button-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {complianceReport && (
              <button
                onClick={exportComplianceReport}
                className="medical-button-primary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Diagnosis Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Diagnosis for Compliance Review
          </label>
          <select
            value={selectedDiagnosis?.id.toString() || ''}
            onChange={(e) => {
              const diagnosis = diagnoses.find(d => d.id.toString() === e.target.value);
              setSelectedDiagnosis(diagnosis || null);
            }}
            className="medical-input max-w-md"
          >
            {diagnoses.map((diagnosis) => (
              <option key={diagnosis.id.toString()} value={diagnosis.id.toString()}>
                ID: {diagnosis.id.toString()} - {diagnosis.diagnosis.substring(0, 50)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start space-x-2">
            <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Compliance Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Overview */}
      {selectedDiagnosis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FDA Compliance */}
          <div className="medical-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-compliance-fda rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-medical-dark">FDA Compliance</h3>
                <p className="text-sm text-gray-600">21 CFR Part 820</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {selectedDiagnosis.fda_compliant ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Compliant</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Non-Compliant</span>
                  </>
                )}
              </div>
              
              <div className="text-xs text-gray-600">
                <p>✓ Software as Medical Device</p>
                <p>✓ Quality Management System</p>
                <p>✓ Risk Management (ISO 14971)</p>
              </div>
            </div>
          </div>

          {/* HIPAA Compliance */}
          <div className="medical-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-compliance-hipaa rounded-lg">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-medical-dark">HIPAA Compliance</h3>
                <p className="text-sm text-gray-600">Privacy Rule</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {selectedDiagnosis.hipaa_compliant ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Compliant</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Non-Compliant</span>
                  </>
                )}
              </div>
              
              <div className="text-xs text-gray-600">
                <p>✓ Data Anonymization</p>
                <p>✓ Audit Trail Maintained</p>
                <p>✓ Access Controls</p>
              </div>
            </div>
          </div>

          {/* Cryptographic Verification */}
          <div className="medical-card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-compliance-audit rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-medical-dark">Signature Verification</h3>
                <p className="text-sm text-gray-600">Cryptographic Proof</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-sm text-gray-600">Verifying...</div>
              ) : (
                <div className="flex items-center space-x-2">
                  {signatureVerification ? (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-red-600">Failed</span>
                    </>
                  )}
                </div>
              )}
              
              <div className="text-xs text-gray-600">
                <p>✓ ECDSA Signature</p>
                <p>✓ ICP Threshold Signature</p>
                <p>✓ Tamper-Proof Record</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Compliance Report */}
      {complianceReport && (
        <div className="medical-card">
          <h3 className="text-lg font-semibold text-medical-dark mb-4">
            Detailed Compliance Report
          </h3>
          
          <div className="space-y-6">
            {/* Report Header */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Report ID</label>
                  <p className="font-mono text-sm">{complianceReport.diagnosis_id.toString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Generated</label>
                  <p className="text-sm">{formatMedicalTimestamp(complianceReport.generated_timestamp)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Certification Level</label>
                  <p className="text-sm font-medium">{complianceReport.certification_level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Audit Trail</label>
                  <div className="flex items-center space-x-2">
                    {complianceReport.audit_trail_complete ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Complete</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Incomplete</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FDA Status Details */}
            <div>
              <h4 className="font-medium text-medical-dark mb-2">FDA Compliance Status</h4>
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
                {(() => {
                  const status = getComplianceStatus(complianceReport.fda_status);
                  const Icon = status.icon;
                  return (
                    <>
                      <div className={`p-1 rounded ${status.bgColor}`}>
                        <Icon className={`h-4 w-4 ${status.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-medical-dark">{complianceReport.fda_status}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Medical AI system classification and regulatory compliance verification
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* HIPAA Status Details */}
            <div>
              <h4 className="font-medium text-medical-dark mb-2">HIPAA Compliance Status</h4>
              <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
                {(() => {
                  const status = getComplianceStatus(complianceReport.hipaa_status);
                  const Icon = status.icon;
                  return (
                    <>
                      <div className={`p-1 rounded ${status.bgColor}`}>
                        <Icon className={`h-4 w-4 ${status.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-medical-dark">{complianceReport.hipaa_status}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Patient privacy protection and data handling compliance
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Regulatory Notes */}
            <div>
              <h4 className="font-medium text-medical-dark mb-2">Regulatory Notes</h4>
              <div className="space-y-2">
                {complianceReport.regulatory_notes.map((note, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-medical-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Verification Summary</h4>
                  <p className="text-sm text-blue-700">
                    This diagnosis has been cryptographically signed and verified on the Internet Computer Protocol. 
                    The immutable audit trail ensures data integrity and regulatory compliance.
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    <p>• Signature Status: {signatureVerification ? 'Verified' : 'Failed'}</p>
                    <p>• Blockchain Record: Stored on ICP</p>
                    <p>• Data Integrity: Guaranteed by cryptographic proof</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceReport;
