
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Gauge from './components/Gauge';
import UDSTools from './components/UDSTools';
import DTCPanel from './components/DTCPanel';
import EngineeringTools from './components/EngineeringTools';
import { DiagnosticData, UDSSession, ECUStatus, UDSMessage, DTC } from './types';
import { analyzeDiagnosticData, fastAssistant } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ESP_IP = "http://192.168.4.1";

const App: React.FC = () => {
  const [data, setData] = useState<DiagnosticData[]>([]);
  const [currentData, setCurrentData] = useState<DiagnosticData>({
    rpm: 0, speed: 0, coolantTemp: 0, throttlePos: 0, voltage: 0, timestamp: Date.now()
  });
  const [ecu, setEcu] = useState<ECUStatus>({
    id: '0x7E0', name: 'ECM', connected: false, activeSession: UDSSession.DEFAULT, securityAccess: 'Locked'
  });
  const [messages, setMessages] = useState<UDSMessage[]>([]);
  const [dtcs, setDtcs] = useState<DTC[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReadingDTCs, setIsReadingDTCs] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'engineering'>('standard');
  const [isHardwareMode, setIsHardwareMode] = useState(true); // Default to TRUE for real work
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // PRODUCTION POLLING ENGINE
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isHardwareMode) return;
      try {
        const response = await fetch(`${ESP_IP}/api/data`, { 
          mode: 'cors',
          headers: { 'Accept': 'application/json' }
        });
        const hardwareData = await response.json();
        const newData = { ...hardwareData, timestamp: Date.now() };
        setCurrentData(newData);
        setData(d => [...d.slice(-30), newData]);
        if (!ecu.connected) setEcu(prev => ({ ...prev, connected: true }));
      } catch (err) {
        if (ecu.connected) setEcu(prev => ({ ...prev, connected: false }));
      }
    }, 800);
    return () => clearInterval(interval);
  }, [isHardwareMode, ecu.connected]);

  const handleSendMessage = useCallback(async (service: string, sub: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    const tx: UDSMessage = { direction: 'OUT', id: '0x7E0', service: `SID ${service}`, data: sub, timestamp };
    setMessages(prev => [...prev, tx].slice(-50));

    try {
      const res = await fetch(`${ESP_IP}/api/uds?sid=${service}&sub=${encodeURIComponent(sub)}`, { mode: 'cors' });
      const json = await res.json();
      
      const rx: UDSMessage = {
        direction: 'IN',
        id: '0x7E8',
        service: `RES ${(parseInt(service, 16) + 0x40).toString(16).toUpperCase()}`,
        data: json.data || "ACK",
        timestamp: new Date().toLocaleTimeString([], { hour12: false })
      };
      setMessages(prev => [...prev, rx].slice(-50));

      // Handle specific UI states based on SID
      if (service === '10') {
        if (sub === '03') setEcu(prev => ({ ...prev, activeSession: UDSSession.EXTENDED }));
        if (sub === '02') setEcu(prev => ({ ...prev, activeSession: UDSSession.PROGRAMMING }));
      }
      if (service === '27' && sub === '02') setEcu(prev => ({ ...prev, securityAccess: 'Level 1' }));
      
    } catch (e) {
      console.error("Link Error");
    }
  }, []);

  const runAIAnalysis = async () => {
    if (messages.length === 0) return;
    setIsAnalyzing(true);
    const log = messages.slice(-20).map(m => `[${m.timestamp}] ${m.direction}: ${m.service} ${m.data}`).join('\n');
    const result = await analyzeDiagnosticData(log);
    setAiAnalysis(result || 'No logic path generated.');
    setIsAnalyzing(false);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);
    const response = await fastAssistant(userMsg);
    setChatHistory(prev => [...prev, { role: 'ai', text: response || 'Offline assistant.' }]);
    setIsChatting(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 gap-6 max-w-[1600px] mx-auto overflow-hidden bg-[#0a0a0c]">
      
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50">
         <button 
          onClick={() => setIsHardwareMode(!isHardwareMode)}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border ${isHardwareMode ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-slate-900 text-slate-500 border-slate-700'}`}
         >
          {isHardwareMode ? <><i className="fa-solid fa-link mr-2"></i>HW Production Live</> : <><i className="fa-solid fa-flask mr-2"></i>Simulation Mode</>}
         </button>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass p-4 rounded-2xl border-l-4 border-l-emerald-500">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500 text-black shadow-lg shadow-emerald-500/20">
            <i className="fa-solid fa-microchip text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase leading-none">GY OBD-II PRO</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase mt-1">
              <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${ecu.connected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              {ecu.connected ? 'STABLE HARDWARE LINK' : 'LINK LOST - CHECK ESP8266'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
            <button onClick={() => setViewMode('standard')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${viewMode === 'standard' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Standard</button>
            <button onClick={() => setViewMode('engineering')} className={`px-3 py-1.5 rounded text-[10px] font-black uppercase ${viewMode === 'engineering' ? 'bg-blue-500 text-white' : 'text-slate-500'}`}>Engineering</button>
          </div>
          <div className={`px-3 py-1.5 rounded border text-[10px] font-black uppercase flex items-center gap-2 ${ecu.securityAccess === 'Locked' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'}`}>
            <i className={`fa-solid ${ecu.securityAccess === 'Locked' ? 'fa-lock' : 'fa-lock-open'}`}></i>
            {ecu.securityAccess}
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Gauge label="Engine RPM" value={currentData.rpm} min={0} max={8000} unit="RPM" />
            <Gauge label="Vehicle Speed" value={currentData.speed} min={0} max={260} unit="KM/H" color="text-blue-400" />
            <Gauge label="Coolant" value={currentData.coolantTemp} min={0} max={120} unit="°C" color="text-rose-400" />
            <Gauge label="Throttle" value={currentData.throttlePos} min={0} max={100} unit="%" color="text-amber-400" />
            <Gauge label="Battery" value={currentData.voltage} min={0} max={16} unit="V" color="text-indigo-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
            <div className="glass rounded-2xl p-6 flex flex-col border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-6">Real-Time Data Stream</h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis stroke="#10b981" fontSize={10} axisLine={false} tickLine={false} />
                    <Line type="monotone" dataKey="rpm" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <DTCPanel dtcs={dtcs} onReadDTCs={() => handleSendMessage('19', '02 08')} onClearDTCs={() => handleSendMessage('14', 'FFFFFF')} isReading={isReadingDTCs} />
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1">
            {viewMode === 'standard' ? <UDSTools activeSession={ecu.activeSession} onSendMessage={handleSendMessage} messages={messages} /> : <EngineeringTools session={ecu.activeSession} onCommand={handleSendMessage} securityLevel={ecu.securityAccess} />}
          </div>

          <div className="glass rounded-2xl flex flex-col overflow-hidden h-[300px] border border-slate-800 shadow-2xl">
            <div className="bg-slate-900 border-b border-slate-800 flex">
              <div className="flex-1 p-3 text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 border-r border-slate-800"><i className="fa-solid fa-brain text-purple-400"></i>Gemini 3 Pro</div>
              <div className="flex-1 p-3 text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><i className="fa-solid fa-comments text-blue-400"></i>Expert Chat</div>
            </div>
            <div className="flex-1 grid grid-cols-2 overflow-hidden">
              <div className="flex flex-col border-r border-slate-800">
                <div className="flex-1 overflow-y-auto p-3 text-[10px] text-slate-300 custom-scrollbar whitespace-pre-wrap">{aiAnalysis || "Awaiting Data..."}</div>
                <div className="p-2">
                  <button onClick={runAIAnalysis} disabled={isAnalyzing || messages.length === 0} className="w-full bg-purple-600 text-white text-[10px] font-bold py-2 rounded uppercase shadow-lg shadow-purple-900/20 transition-all active:scale-95">
                    {isAnalyzing ? 'Thinking Deeply...' : 'Analyze Hardware Log'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col bg-black/20">
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <span className={`text-[9px] px-2 py-1 rounded-lg max-w-[95%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>{msg.text}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleChat} className="p-2 border-t border-slate-800 flex gap-1">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Query AI..." className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] outline-none" />
                  <button type="submit" className="bg-blue-600 p-1.5 rounded text-white"><i className="fa-solid fa-paper-plane text-[10px]"></i></button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="glass p-3 rounded-xl flex justify-between items-center text-[10px] font-black text-slate-500 uppercase">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><i className="fa-solid fa-wifi text-emerald-500"></i> HARDWARE: {ecu.connected ? 'ONLINE' : 'DISCONNECTED'}</span>
          <span className="flex items-center gap-2"><i className="fa-solid fa-code text-blue-500"></i> UDS STACK V3.0</span>
        </div>
        <div>GEMINI 3 PRO REASONING ENGINE ACTIVE</div>
      </footer>
    </div>
  );
};

export default App;
