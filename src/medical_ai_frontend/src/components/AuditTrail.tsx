import { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Shield,
  Activity,
  FileText,
  User,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { MedicalAuditEntry, MedicalDiagnosisResult } from '../hooks/useICPAgent';
import { formatMedicalTimestamp } from '../utils/medicalUtils';

interface AuditTrailProps {
  auditTrail: MedicalAuditEntry[];
  diagnoses: MedicalDiagnosisResult[];
  onRefresh: () => void;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ auditTrail, diagnoses, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string>('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique actions for filter dropdown
  const uniqueActions = useMemo(() => {
    const actions = auditTrail.map(entry => entry.action);
    return Array.from(new Set(actions)).sort();
  }, [auditTrail]);

  // Get unique diagnosis IDs for filter dropdown
  const uniqueDiagnosisIds = useMemo(() => {
    const ids = auditTrail.map(entry => entry.diagnosis_id.toString());
    return Array.from(new Set(ids)).sort();
  }, [auditTrail]);

  // Filter and sort audit entries
  const filteredEntries = useMemo(() => {
    let filtered = auditTrail.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.principal_id.toString().includes(searchTerm);
      
      const matchesAction = selectedAction === '' || entry.action === selectedAction;
      const matchesDiagnosis = selectedDiagnosisId === '' || 
        entry.diagnosis_id.toString() === selectedDiagnosisId;
      
      return matchesSearch && matchesAction && matchesDiagnosis;
    });

    // Sort by timestamp
    filtered.sort((a, b) => {
      const aTime = Number(a.timestamp);
      const bTime = Number(b.timestamp);
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    });

    return filtered;
  }, [auditTrail, searchTerm, selectedAction, selectedDiagnosisId, sortOrder]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'DIAGNOSIS_CREATED':
        return Activity;
      case 'COMPLIANCE_REPORT_GENERATED':
        return Shield;
      case 'SIGNATURE_VERIFIED':
        return Eye;
      default:
        return FileText;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'DIAGNOSIS_CREATED':
        return 'text-green-600 bg-green-100';
      case 'COMPLIANCE_REPORT_GENERATED':
        return 'text-blue-600 bg-blue-100';
      case 'SIGNATURE_VERIFIED':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const exportAuditTrail = () => {
    const exportData = {
      audit_trail: filteredEntries,
      export_timestamp: new Date().toISOString(),
      total_entries: filteredEntries.length,
      filters: {
        search_term: searchTerm,
        selected_action: selectedAction,
        selected_diagnosis_id: selectedDiagnosisId,
        sort_order: sortOrder
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAction('');
    setSelectedDiagnosisId('');
  };

  if (auditTrail.length === 0) {
    return (
      <div className="medical-card text-center">
        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-medical-dark mb-2">
          No Audit Trail Available
        </h3>
        <p className="text-gray-600">
          Audit entries will appear here as you perform actions in the system.
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
              Medical Audit Trail
            </h2>
            <p className="text-gray-600">
              Immutable record of all system activities and compliance events
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onRefresh}
              className="medical-button-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={exportAuditTrail}
              className="medical-button-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search audit entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 medical-input"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="medical-input"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* Diagnosis Filter */}
          <div>
            <select
              value={selectedDiagnosisId}
              onChange={(e) => setSelectedDiagnosisId(e.target.value)}
              className="medical-input"
            >
              <option value="">All Diagnoses</option>
              {uniqueDiagnosisIds.map(id => (
                <option key={id} value={id}>Diagnosis {id}</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="medical-input"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredEntries.length} of {auditTrail.length} entries
          </div>
          
          {(searchTerm || selectedAction || selectedDiagnosisId) && (
            <button
              onClick={clearFilters}
              className="text-medical-primary hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Entries */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => {
          const ActionIcon = getActionIcon(entry.action);
          const isExpanded = expandedEntries.has(entry.id.toString());
          const diagnosis = diagnoses.find(d => d.id === entry.diagnosis_id);

          return (
            <div key={entry.id.toString()} className="medical-card">
              <div 
                className="flex items-start space-x-4 cursor-pointer"
                onClick={() => toggleExpanded(entry.id.toString())}
              >
                {/* Action Icon */}
                <div className={`p-2 rounded-lg ${getActionColor(entry.action)}`}>
                  <ActionIcon className="h-5 w-5" />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-medical-dark">
                        {entry.action.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {entry.details}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="text-right text-sm text-gray-500 min-w-0">
                        <p className="truncate">ID: {entry.id.toString()}</p>
                        <p className="whitespace-nowrap">
                          {formatMedicalTimestamp(entry.timestamp).split(',')[0]}
                        </p>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>Diagnosis {entry.diagnosis_id.toString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="truncate max-w-24">
                        {entry.principal_id.toString().substring(0, 12)}...
                      </span>
                    </div>
                    
                    {entry.compliance_flags.length > 0 && (
                      <div className="flex space-x-1">
                        {entry.compliance_flags.map((flag, index) => (
                          <span
                            key={index}
                            className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-xs"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-medical-dark mb-2">Audit Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Entry ID: </span>
                          <span className="font-mono">{entry.id.toString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Action: </span>
                          <span className="font-medium">{entry.action}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Timestamp: </span>
                          <span className="font-mono">
                            {formatMedicalTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Principal: </span>
                          <span className="font-mono text-xs break-all">
                            {entry.principal_id.toString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-medical-dark mb-2">Related Diagnosis</h4>
                      {diagnosis ? (
                        <div className="p-3 bg-gray-50 rounded-md text-sm">
                          <p className="font-medium text-medical-dark mb-1">
                            {diagnosis.diagnosis}
                          </p>
                          <div className="text-gray-600 space-y-1">
                            <p>Confidence: {(diagnosis.confidence_score * 100).toFixed(1)}%</p>
                            <p>Patient: {diagnosis.patient_metadata.anonymized_id}</p>
                            <p>Study: {diagnosis.patient_metadata.study_type}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Diagnosis {entry.diagnosis_id.toString()} not found
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Full Details */}
                  <div className="mt-4">
                    <h4 className="font-medium text-medical-dark mb-2">Event Description</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {entry.details}
                    </p>
                  </div>

                  {/* Compliance Flags */}
                  {entry.compliance_flags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-medical-dark mb-2">Compliance Flags</h4>
                      <div className="flex flex-wrap gap-2">
                        {entry.compliance_flags.map((flag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredEntries.length === 0 && auditTrail.length > 0 && (
        <div className="medical-card text-center">
          <Filter className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="font-medium text-medical-dark mb-1">No Matching Entries</h3>
          <p className="text-sm text-gray-600">
            Try adjusting your search criteria or clearing filters.
          </p>
        </div>
      )}

      {/* Audit Trail Summary */}
      <div className="medical-card">
        <h3 className="text-lg font-semibold text-medical-dark mb-4">
          Audit Trail Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-medical-primary">
              {auditTrail.length}
            </div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {auditTrail.filter(e => e.action === 'DIAGNOSIS_CREATED').length}
            </div>
            <div className="text-sm text-gray-600">Diagnoses Created</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {auditTrail.filter(e => e.action === 'COMPLIANCE_REPORT_GENERATED').length}
            </div>
            <div className="text-sm text-gray-600">Compliance Reports</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {auditTrail.filter(e => e.compliance_flags.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Compliance Events</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
