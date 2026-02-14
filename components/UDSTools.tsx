
import React, { useState } from 'react';
import { UDSSession, UDSMessage } from '../types';

interface UDSToolsProps {
  onSendMessage: (service: string, sub: string) => void;
  messages: UDSMessage[];
  activeSession: UDSSession;
}

const UDSTools: React.FC<UDSToolsProps> = ({ onSendMessage, messages, activeSession }) => {
  const [customService, setCustomService] = useState('10');
  const [customSub, setCustomSub] = useState('03');

  const services = [
    { name: 'Extended Session', id: '10', sub: '03', icon: 'fa-terminal' },
    { name: 'Security Access', id: '27', sub: '01', icon: 'fa-lock' },
    { name: 'Read DTCs', id: '19', sub: '02 08', icon: 'fa-magnifying-glass-chart' },
    { name: 'Clear DTCs', id: '14', sub: 'FFFFFF', icon: 'fa-trash-can' },
    { name: 'Read Data (VIN)', id: '22', sub: 'F190', icon: 'fa-barcode' },
    { name: 'ECU Reset', id: '11', sub: '01', icon: 'fa-power-off' },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="glass p-4 rounded-xl">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <i className="fa-solid fa-screwdriver-wrench text-emerald-400"></i>
          Service Execution
        </h2>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {services.map(s => (
            <button
              key={s.name}
              onClick={() => onSendMessage(s.id, s.sub)}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/40 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all text-left text-xs font-semibold group"
            >
              <i className={`fa-solid ${s.icon} text-slate-500 group-hover:text-emerald-400 w-4 text-center`}></i>
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            value={customService} 
            onChange={e => setCustomService(e.target.value)}
            className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs mono text-center focus:border-emerald-500 outline-none"
            placeholder="SID"
          />
          <input 
            type="text" 
            value={customSub} 
            onChange={e => setCustomSub(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs mono focus:border-emerald-500 outline-none"
            placeholder="Sub-Function / Identifier"
          />
          <button 
            onClick={() => onSendMessage(customService, customSub)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1 rounded text-xs font-bold transition-colors shadow-lg shadow-emerald-900/20"
          >
            SEND
          </button>
        </div>
      </div>

      <div className="glass flex-1 rounded-xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <span className="text-xs font-bold text-slate-400 uppercase">ISO-TP Console</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 mono">
            CAN ID: 0x7E0
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 mono text-[11px] space-y-1">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-600 italic">
              Awaiting bus activity...
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 px-2 py-1 rounded transition-all duration-300 ${m.direction === 'IN' ? 'bg-emerald-500/5' : 'bg-blue-500/5'}`}>
              <span className="text-slate-500">{m.timestamp}</span>
              <span className={m.direction === 'IN' ? 'text-emerald-400' : 'text-blue-400'}>
                {m.direction === 'IN' ? '← RX' : '→ TX'}
              </span>
              <span className="text-slate-300 font-bold min-w-[60px]">{m.service}</span>
              <span className="text-slate-400 break-all">{m.data}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UDSTools;
