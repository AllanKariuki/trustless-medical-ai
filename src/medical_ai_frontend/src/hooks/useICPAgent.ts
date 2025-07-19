import { useState, useEffect } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Type definitions from the backend
export interface PatientMetadata {
  anonymized_id: string;
  age_range: string;
  study_type: string;
  acquisition_date: string;
}

export interface MedicalFinding {
  finding: string;
  location: string;
  severity: string;
  confidence: number;
}

export interface MedicalDiagnosisResult {
  id: bigint;
  diagnosis: string;
  confidence_score: number;
  medical_findings: MedicalFinding[];
  timestamp: bigint;
  signature: Uint8Array;
  public_key: Uint8Array;
  fda_compliant: boolean;
  hipaa_compliant: boolean;
  model_version: string;
  patient_metadata: PatientMetadata;
}

export interface MedicalAuditEntry {
  id: bigint;
  diagnosis_id: bigint;
  action: string;
  timestamp: bigint;
  principal_id: Principal;
  details: string;
  compliance_flags: string[];
}

export interface ComplianceReport {
  diagnosis_id: bigint;
  fda_status: string;
  hipaa_status: string;
  audit_trail_complete: boolean;
  signature_verified: boolean;
  regulatory_notes: string[];
  certification_level: string;
  generated_timestamp: bigint;
}

// Candid interface for the medical AI backend
const idlFactory = ({ IDL }: any) => {
  const PatientMetadata = IDL.Record({
    'anonymized_id': IDL.Text,
    'age_range': IDL.Text,
    'study_type': IDL.Text,
    'acquisition_date': IDL.Text,
  });
  
  const MedicalFinding = IDL.Record({
    'finding': IDL.Text,
    'location': IDL.Text,
    'severity': IDL.Text,
    'confidence': IDL.Float32,
  });
  
  const MedicalDiagnosisResult = IDL.Record({
    'id': IDL.Nat64,
    'diagnosis': IDL.Text,
    'confidence_score': IDL.Float32,
    'medical_findings': IDL.Vec(MedicalFinding),
    'timestamp': IDL.Nat64,
    'signature': IDL.Vec(IDL.Nat8),
    'public_key': IDL.Vec(IDL.Nat8),
    'fda_compliant': IDL.Bool,
    'hipaa_compliant': IDL.Bool,
    'model_version': IDL.Text,
    'patient_metadata': PatientMetadata,
  });
  
  const MedicalAuditEntry = IDL.Record({
    'id': IDL.Nat64,
    'diagnosis_id': IDL.Nat64,
    'action': IDL.Text,
    'timestamp': IDL.Nat64,
    'principal_id': IDL.Principal,
    'details': IDL.Text,
    'compliance_flags': IDL.Vec(IDL.Text),
  });
  
  const ComplianceReport = IDL.Record({
    'diagnosis_id': IDL.Nat64,
    'fda_status': IDL.Text,
    'hipaa_status': IDL.Text,
    'audit_trail_complete': IDL.Bool,
    'signature_verified': IDL.Bool,
    'regulatory_notes': IDL.Vec(IDL.Text),
    'certification_level': IDL.Text,
    'generated_timestamp': IDL.Nat64,
  });
  
  const Result = IDL.Variant({ 'Ok': MedicalDiagnosisResult, 'Err': IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok': IDL.Bool, 'Err': IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok': ComplianceReport, 'Err': IDL.Text });
  
  return IDL.Service({
    'analyze_medical_image': IDL.Func([IDL.Vec(IDL.Nat8), PatientMetadata], [Result], []),
    'get_diagnosis': IDL.Func([IDL.Nat64], [IDL.Opt(MedicalDiagnosisResult)], ['query']),
    'get_all_diagnoses': IDL.Func([], [IDL.Vec(MedicalDiagnosisResult)], ['query']),
    'get_medical_audit_trail': IDL.Func([], [IDL.Vec(MedicalAuditEntry)], ['query']),
    'get_audit_trail_for_diagnosis': IDL.Func([IDL.Nat64], [IDL.Vec(MedicalAuditEntry)], ['query']),
    'verify_diagnosis_signature': IDL.Func([IDL.Nat64], [Result_1], ['query']),
    'get_fda_compliance_report': IDL.Func([IDL.Nat64], [Result_2], []),
    'get_system_health': IDL.Func([], [IDL.Text], ['query']),
  });
};

export const useICPAgent = () => {
  const [agent, setAgent] = useState<HttpAgent | null>(null);
  const [actor, setActor] = useState<any>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get canister ID from environment or use local development ID
  const canisterId = process.env.REACT_APP_MEDICAL_AI_BACKEND_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai';
  
  // Use local replica for development
  const host = process.env.NODE_ENV === 'production' 
    ? 'https://icp0.io' 
    : 'http://localhost:4943';

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const authClient = await AuthClient.create();
      setAuthClient(authClient);

      const isAuthenticated = await authClient.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();
        setPrincipal(principal);
        await initializeAgent(identity);
      } else {
        // Create anonymous agent for public queries
        await initializeAgent();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAgent = async (identity?: any) => {
    try {
      const agent = new HttpAgent({
        host,
        identity,
      });

      // Fetch root key for local development
      if (process.env.NODE_ENV === 'development') {
        await agent.fetchRootKey();
      }

      setAgent(agent);

      // Create actor
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId,
      });

      setActor(actor);
    } catch (error) {
      console.error('Error initializing agent:', error);
    }
  };

  const login = async () => {
    if (!authClient) return;

    try {
      setIsLoading(true);
      
      const identityProvider = process.env.NODE_ENV === 'production'
        ? 'https://identity.ic0.app'
        : `http://localhost:4943?canisterId=uxrrr-q7777-77774-qaaaq-cai`;

      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();
          setPrincipal(principal);
          setIsAuthenticated(true);
          await initializeAgent(identity);
        },
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!authClient) return;

    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
      await initializeAgent(); // Reinitialize with anonymous identity
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Medical AI API functions
  const analyzeMedicalImage = async (imageData: Uint8Array, patientMetadata: PatientMetadata) => {
    if (!actor) throw new Error('Actor not initialized');
    
    try {
      const result = await actor.analyze_medical_image(Array.from(imageData), patientMetadata);
      if ('Err' in result) {
        throw new Error(result.Err);
      }
      return result.Ok;
    } catch (error) {
      console.error('Error analyzing medical image:', error);
      throw error;
    }
  };

  const getDiagnosis = async (diagnosisId: bigint) => {
    if (!actor) throw new Error('Actor not initialized');
    
    try {
      const result = await actor.get_diagnosis(diagnosisId);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting diagnosis:', error);
      throw error;
    }
  };

  const getAllDiagnoses = async () => {
    if (!actor) throw new Error('Actor not initialized');
    
    try {
      return await actor.get_all_diagnoses();
    } catch (error) {
      console.error('Error getting all diagnoses:', error);
      throw error;
    }
  };

  const getMedicalAuditTrail = async () => {
    if (!actor) throw new Error('Actor not initialized');
    
    try {
      return await actor.get_medical_audit_trail();
    } catch (error) {
      console.error('Error getting medical audit trail:', error);
      throw error;
    }
  };

  const verifyDiagnosisSignature = async (diagnosisId: bigint) => {
    if (!actor) throw new Error('Actor not initialized');
    
    try {
      const result = await actor.verify_diagnosis_signature(diagnosisId);
      if ('Err' in result) {
        throw new Error(result.Err);
      }
      return result.Ok;
    } catch (error) {
      console.error('Error verifying diagnosis signature:', error);
      throw error;
    }
  };

  const getFDAComplianceReport = async (diagnosisId: bigint) => {
    if (!actor) throw new Error('Actor not initialized');
    
    try {
      const result = await actor.get_fda_compliance_report(diagnosisId);
      if ('Err' in result) {
        throw new Error(result.Err);
      }
      return result.Ok;
    } catch (error) {
      console.error('Error getting FDA compliance report:', error);
      throw error;
    }
  };

  const getSystemHealth = async () => {
    if (!actor) throw new Error('Actor not initialized');
    
    try {
      return await actor.get_system_health();
    } catch (error) {
      console.error('Error getting system health:', error);
      throw error;
    }
  };

  return {
    // Authentication state
    isAuthenticated,
    principal,
    isLoading,
    
    // Authentication functions
    login,
    logout,
    
    // Medical AI functions
    analyzeMedicalImage,
    getDiagnosis,
    getAllDiagnoses,
    getMedicalAuditTrail,
    verifyDiagnosisSignature,
    getFDAComplianceReport,
    getSystemHealth,
    
    // Raw agent and actor for advanced usage
    agent,
    actor,
  };
};
