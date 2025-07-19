import React, { useState, useEffect } from 'react';
import { Shield, Activity, FileCheck, Users, Settings, LogOut, LogIn } from 'lucide-react';
import { useICPAgent, MedicalDiagnosisResult, MedicalAuditEntry, ComplianceReport } from './hooks/useICPAgent';
import ImageUpload from './components/ImageUpload';
import DiagnosisResult from './components/DiagnosisResult';
import ComplianceReportComponent from './components/ComplianceReportComponent';
import AuditTrail from './components/AuditTrail';

type ActiveTab = 'upload' | 'results' | 'compliance' | 'audit';

function App() {
  const {
    isAuthenticated,
    principal,
    isLoading,
    login,
    logout,
    getAllDiagnoses,
    getMedicalAuditTrail,
    getSystemHealth
  } = useICPAgent();

  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  const [diagnoses, setDiagnoses] = useState<MedicalDiagnosisResult[]>([]);
  const [auditTrail, setAuditTrail] = useState<MedicalAuditEntry[]>([]);
  const [systemHealth, setSystemHealth] = useState<string>('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<MedicalDiagnosisResult | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      loadData();
    }
  }, [isLoading, isAuthenticated]);

  const loadData = async () => {
    try {
      const [diagnosesData, auditData, healthData] = await Promise.all([
        getAllDiagnoses(),
        getMedicalAuditTrail(),
        getSystemHealth()
      ]);
      
      setDiagnoses(diagnosesData || []);
      setAuditTrail(auditData || []);
      setSystemHealth(healthData || '');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleNewDiagnosis = (diagnosis: MedicalDiagnosisResult) => {
    setDiagnoses(prev => [diagnosis, ...prev]);
    setSelectedDiagnosis(diagnosis);
    setActiveTab('results');
    loadData(); // Refresh audit trail
  };

  const tabs = [
    { id: 'upload' as ActiveTab, label: 'Image Analysis', icon: Activity },
    { id: 'results' as ActiveTab, label: 'Diagnosis Results', icon: FileCheck },
    { id: 'compliance' as ActiveTab, label: 'Compliance', icon: Shield },
    { id: 'audit' as ActiveTab, label: 'Audit Trail', icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medical-gradient flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="medical-loading">
            <Activity className="h-12 w-12 text-medical-primary mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-medical-dark mb-2">
            Initializing Trustless Medical AI
          </h2>
          <p className="text-gray-600">Connecting to Internet Computer Protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-medical-primary mr-3" />
              <div>
                <h1 className="text-xl font-bold text-medical-dark">
                  Trustless Medical AI
                </h1>
                <p className="text-sm text-gray-600">
                  Decentralized Healthcare on Internet Computer
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {systemHealth && (
                <div className="hidden md:block">
                  <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    {systemHealth.split('|')[0]}
                  </span>
                </div>
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="text-medical-dark font-medium">Authenticated</p>
                    <p className="text-gray-600 truncate max-w-32">
                      {principal?.toText().substring(0, 12)}...
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="medical-button-secondary flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="medical-button-primary flex items-center space-x-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login with Internet Identity</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-medical-primary text-medical-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Authentication Required Notice */}
        {!isAuthenticated && activeTab !== 'upload' && (
          <div className="medical-card mb-6 text-center">
            <Shield className="h-12 w-12 text-medical-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-medical-dark mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-600 mb-4">
              Please log in with Internet Identity to access medical records and compliance features.
            </p>
            <button
              onClick={login}
              className="medical-button-primary"
            >
              Login with Internet Identity
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="medical-card">
              <h2 className="text-2xl font-bold text-medical-dark mb-2">
                Medical Image Analysis
              </h2>
              <p className="text-gray-600 mb-6">
                Upload chest X-ray images for AI-powered diagnostic analysis with cryptographic verification.
              </p>
              <ImageUpload onDiagnosisComplete={handleNewDiagnosis} />
            </div>

            {/* Recent Diagnoses Preview */}
            {diagnoses.length > 0 && (
              <div className="medical-card">
                <h3 className="text-lg font-semibold text-medical-dark mb-4">
                  Recent Diagnoses
                </h3>
                <div className="space-y-3">
                  {diagnoses.slice(0, 3).map((diagnosis) => (
                    <div
                      key={diagnosis.id.toString()}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedDiagnosis(diagnosis);
                        setActiveTab('results');
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-medical-dark">
                            {diagnosis.diagnosis}
                          </p>
                          <p className="text-sm text-gray-600">
                            Confidence: {(diagnosis.confidence_score * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {diagnosis.fda_compliant && (
                            <span className="fda-compliant">FDA</span>
                          )}
                          {diagnosis.hipaa_compliant && (
                            <span className="hipaa-compliant">HIPAA</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && isAuthenticated && (
          <DiagnosisResult
            diagnoses={diagnoses}
            selectedDiagnosis={selectedDiagnosis}
            onSelectDiagnosis={setSelectedDiagnosis}
          />
        )}

        {activeTab === 'compliance' && isAuthenticated && (
          <ComplianceReportComponent
            diagnoses={diagnoses}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'audit' && isAuthenticated && (
          <AuditTrail
            auditTrail={auditTrail}
            diagnoses={diagnoses}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>&copy; 2024 Trustless Medical AI. Powered by Internet Computer Protocol.</p>
              <p className="mt-1">
                Compliant with FDA 21 CFR Part 820 and HIPAA Privacy Rule
              </p>
            </div>
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>Model: MedicalAI-v2.1.0</span>
              <span>•</span>
              <span>Blockchain Verified</span>
              <span>•</span>
              <span>Cryptographically Signed</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
