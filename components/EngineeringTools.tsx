
import React, { useState, useEffect } from 'react';
import { UDSSession, ProcedureState, PID } from '../types';

interface EngineeringToolsProps {
  session: UDSSession;
  onCommand: (sid: string, data: string) => void;
  securityLevel: string;
}

const EngineeringTools: React.FC<EngineeringToolsProps> = ({ session, onCommand, securityLevel }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'routines' | 'coding' | 'flash'>('security');
  const [dpfProcedure, setDpfProcedure] = useState<ProcedureState>({
    name: 'DPF Regeneration', progress: 0, status: 'Idle', message: 'System Ready'
  });
  const [flashProgress, setFlashProgress] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);

  // Security Logic Simulation
  const handleSecurityAccess = () => {
    onCommand('27', '01'); // Request Seed
    setTimeout(() => onCommand('27', '02 AA BB CC DD'), 1000); // Send Calculated Key
  };

  // DPF Regen Simulation
  useEffect(() => {
    let timer: any;
    if (dpfProcedure.status === 'Running') {
      timer = setInterval(() => {
        setDpfProcedure(prev => {
          if (prev.progress >= 100) {
            clearInterval(timer);
            return { ...prev, status: 'Completed', message: 'Regeneration Successful' };
          }
          return { ...prev, progress: prev.progress + 2, message: `Increasing Temp: ${450 + (prev.progress * 2)}°C` };
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [dpfProcedure.status]);

  // Flash Simulation
  useEffect(() => {
    let timer: any;
    if (isFlashing) {
      timer = setInterval(() => {
        setFlashProgress(prev => {
          if (prev >= 100) {
            setIsFlashing(false);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isFlashing]);

  return (
    <div className="glass rounded-xl flex flex-col h-full border border-slate-800 overflow-hidden">
      <div className="flex bg-slate-900/80 border-b border-slate-800">
        {(['security', 'routines', 'coding', 'flash'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'text-emerald-400 bg-emerald-500/5 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase">Algorithm Visualizer (SAE J2186)</h4>
              <div className="grid grid-cols-3 gap-2 mono text-[10px] text-center">
                <div className="bg-slate-800 p-2 rounded">SEED: <span className="text-blue-400">0x8F22</span></div>
                <div className="flex items-center justify-center text-slate-600"><i className="fa-solid fa-arrow-right"></i></div>
                <div className="bg-slate-800 p-2 rounded">KEY: <span className="text-emerald-400">0x44B1</span></div>
              </div>
              <button 
                onClick={handleSecurityAccess}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase transition-all shadow-lg shadow-emerald-900/20"
              >
                Unlock Level 1 (Diagnostic)
              </button>
            </div>
            <div className="p-3 border-l-2 border-amber-500 bg-amber-500/5 text-[9px] text-amber-200 uppercase font-bold tracking-tight">
              Level 3 required for Write/Coding functions
            </div>
          </div>
        )}

        {activeTab === 'routines' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">DPF Static Regeneration</h4>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                  dpfProcedure.status === 'Running' ? 'bg-amber-500 text-black animate-pulse' : 'bg-slate-800 text-slate-400'
                }`}>
                  {dpfProcedure.status}
                </span>
              </div>
              
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${dpfProcedure.progress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] mono text-slate-400">
                <span>{dpfProcedure.message}</span>
                <span className="text-emerald-400">{dpfProcedure.progress}%</span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setDpfProcedure({ ...dpfProcedure, status: 'Running', progress: 0 })}
                  className="flex-1 py-2 bg-slate-800 hover:bg-emerald-600 text-white rounded text-[10px] font-bold uppercase transition-all"
                >
                  Start Routine
                </button>
                <button 
                  onClick={() => setDpfProcedure({ ...dpfProcedure, status: 'Idle', progress: 0, message: 'Procedure Terminated' })}
                  className="flex-1 py-2 bg-slate-800 hover:bg-rose-600 text-white rounded text-[10px] font-bold uppercase transition-all"
                >
                  Abort
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coding' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Injector 1 IMA Code</label>
              <div className="flex gap-2">
                <input type="text" placeholder="78B2A1C" className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs mono text-emerald-400 uppercase" />
                <button 
                  onClick={() => onCommand('2E', 'F1 10 78 B2 A1 C')}
                  className="px-4 bg-emerald-600 rounded text-[10px] font-bold uppercase"
                >
                  Write
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Write VIN (Service 2E)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="WBAXXXXXXXXXXXXXXXX" className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs mono text-blue-400 uppercase" />
                <button 
                  onClick={() => onCommand('2E', 'F1 90 57 42 41')}
                  className="px-4 bg-blue-600 rounded text-[10px] font-bold uppercase"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flash' && (
          <div className="space-y-4">
            {session !== UDSSession.PROGRAMMING ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <i className="fa-solid fa-triangle-exclamation text-3xl text-amber-500"></i>
                <p className="text-[11px] text-slate-400 max-w-[200px]">ECU must be in Programming Session for flashing functions.</p>
                <button 
                  onClick={() => onCommand('10', '02')}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-black uppercase tracking-widest animate-pulse"
                >
                  Enter Programming Mode
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg space-y-4">
                    <div className="flex justify-between items-center text-rose-400">
                      <span className="text-[10px] font-black uppercase">Flash Bootloader v4.2</span>
                      <span className="mono text-xs">{flashProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500" 
                        style={{ width: `${flashProgress}%` }}
                      />
                    </div>
                    <button 
                      onClick={() => setIsFlashing(true)}
                      className="w-full py-3 bg-rose-600 text-white rounded text-[10px] font-black uppercase"
                    >
                      Begin Flash Cycle
                    </button>
                 </div>
                 <div className="mono text-[9px] text-slate-500 leading-tight">
                    [INFO] Erasing block 0x004000...<br/>
                    [INFO] Transferring segment 0x00...<br/>
                    [INFO] Verifying checksum...
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-2 bg-black/40 text-[9px] text-slate-600 flex justify-between items-center font-mono">
        <span>SECURITY: {securityLevel}</span>
        <span>ACCESS GRANTED</span>
      </div>
    </div>
  );
};

export default EngineeringTools;
