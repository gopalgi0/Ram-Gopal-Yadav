
import React, { useState } from 'react';
import { DTC } from '../types';

interface DTCPanelProps {
  dtcs: DTC[];
  onReadDTCs: () => void;
  onClearDTCs: () => void;
  isReading: boolean;
}

const DTCPanel: React.FC<DTCPanelProps> = ({ dtcs, onReadDTCs, onClearDTCs, isReading }) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  const filteredDtcs = dtcs.filter(dtc => {
    const statusMatch = statusFilter === 'All' || dtc.status === statusFilter;
    const severityMatch = severityFilter === 'All' || dtc.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  const FilterButton = ({ label, current, setter, value }: any) => (
    <button
      onClick={() => setter(value)}
      className={`text-[8px] px-1.5 py-0.5 rounded border transition-all font-bold uppercase ${
        current === value 
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
          : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="glass rounded-xl flex flex-col overflow-hidden h-full border border-slate-800">
      <div className="p-3 border-b border-slate-800 flex flex-col gap-2 bg-slate-900/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
              DTC Monitor
            </h3>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${dtcs.length > 0 ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'}`}>
              {dtcs.length} FAULT(S)
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onReadDTCs}
              disabled={isReading}
              className="text-[10px] font-bold px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 transition-all uppercase border border-slate-700 flex items-center gap-2"
            >
              {isReading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-arrows-rotate"></i>}
              Scan
            </button>
            <button 
              onClick={onClearDTCs}
              className="text-[10px] font-bold px-3 py-1.5 rounded bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 transition-all uppercase border border-rose-900/30 flex items-center gap-2"
            >
              <i className="fa-solid fa-trash-can"></i>
              Clear
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-800/50 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Status:</span>
            <div className="flex gap-1">
              {['All', 'Active', 'Pending', 'Stored'].map(f => (
                <FilterButton key={f} label={f} current={statusFilter} setter={setStatusFilter} value={f} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Severity:</span>
            <div className="flex gap-1">
              {['All', 'Low', 'Medium', 'High'].map(f => (
                <FilterButton key={f} label={f} current={severityFilter} setter={setSeverityFilter} value={f} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {isReading && dtcs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase font-bold tracking-widest animate-pulse">Requesting DTC Status...</p>
          </div>
        )}
        
        {!isReading && filteredDtcs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 italic py-8">
            <i className={`fa-solid ${dtcs.length > 0 ? 'fa-filter' : 'fa-shield-halved'} text-3xl mb-3 opacity-20 text-emerald-500`}></i>
            <p className="text-[11px] uppercase font-black tracking-widest text-emerald-500/60">
              {dtcs.length > 0 ? 'No Matching Faults' : 'System Healthy'}
            </p>
            <p className="text-[9px] mt-1 opacity-50">
              {dtcs.length > 0 ? 'Try adjusting your filter criteria' : 'No diagnostic trouble codes currently stored'}
            </p>
          </div>
        ) : (
          filteredDtcs.map((dtc, i) => (
            <div key={i} className={`bg-slate-900/60 border rounded-lg p-3 flex justify-between items-start group hover:scale-[1.01] transition-all duration-200 ${
              dtc.severity === 'High' ? 'border-rose-900/40 hover:border-rose-500/50' : 
              dtc.severity === 'Medium' ? 'border-amber-900/40 hover:border-amber-500/50' : 'border-slate-800 hover:border-blue-500/50'
            }`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className={`mono font-black text-base tracking-tighter ${
                    dtc.severity === 'High' ? 'text-rose-400' : 
                    dtc.severity === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {dtc.code}
                  </span>
                  <div className="flex gap-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-tight ${
                      dtc.severity === 'High' ? 'bg-rose-500/20 text-rose-500' : 
                      dtc.severity === 'Medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {dtc.severity}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold uppercase">
                      {dtc.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-[240px]">{dtc.description}</p>
              </div>
              <div className="bg-slate-800/50 p-2 rounded text-slate-500 group-hover:text-slate-300 transition-colors">
                <i className="fa-solid fa-circle-info text-sm"></i>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 bg-slate-900/80 border-t border-slate-800 text-[9px] font-bold text-slate-600 flex justify-between">
        <span>ISO 14229 Service 0x19 0x02</span>
        <span>Showing {filteredDtcs.length} of {dtcs.length}</span>
      </div>
    </div>
  );
};

export default DTCPanel;
