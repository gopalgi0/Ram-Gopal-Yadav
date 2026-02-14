
export interface DiagnosticData {
  rpm: number;
  speed: number;
  coolantTemp: number;
  throttlePos: number;
  voltage: number;
  timestamp: number;
}

export enum UDSSession {
  DEFAULT = 'Default Session',
  EXTENDED = 'Extended Session',
  PROGRAMMING = 'Programming Session',
  SAFETY = 'Safety System Session'
}

export interface ECUStatus {
  id: string;
  name: string;
  connected: boolean;
  activeSession: UDSSession;
  securityAccess: 'Locked' | 'Level 1' | 'Level 2' | 'Full';
}

export interface UDSMessage {
  direction: 'IN' | 'OUT';
  id: string;
  data: string;
  timestamp: string;
  service: string;
}

export interface DTC {
  code: string;
  description: string;
  status: 'Active' | 'Pending' | 'Stored';
  severity: 'Low' | 'Medium' | 'High';
}

export interface ProcedureState {
  name: string;
  progress: number;
  status: 'Idle' | 'Running' | 'Completed' | 'Failed';
  message: string;
}

export interface PID {
  id: string;
  name: string;
  value: string;
  unit: string;
  isStreaming: boolean;
}
