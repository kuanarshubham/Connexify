// import { useState, useEffect, useRef } from 'react';
// import { Terminal, Video, Wifi, Github, BookOpen, Play } from 'lucide-react';
// import { ConnexifyRTCClient } from '@connexify/core-sdk';

// export default function App() {
//   const [activeTab,FBTab] = useState<'docs' | 'demo'>('docs');

//   return (
//     <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
//       {/* Header */}
//       <header className="border-b border-slate-800 p-6 bg-slate-900/50 backdrop-blur">
//         <div className="max-w-6xl mx-auto flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <Wifi className="text-blue-500" size={32} />
//             <h1 className="text-2xl font-bold tracking-tight">Connexify</h1>
//           </div>
//           <div className="flex gap-4">
//              <a href="https://github.com/kuanarshubham/Connexify.git" target="_blank" className="flex items-center gap-2 hover:text-blue-400 transition">
//               <Github size={20} /> <span className="hidden sm:inline">GitHub</span>
//             </a>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="flex-1 max-w-6xl mx-auto w-full p-6 mt-8">
//         {/* Tabs */}
//         <div className="flex gap-4 mb-8 border-b border-slate-700">
//           <button 
//             onClick={() => FBTab('docs')}
//             className={`pb-4 px-2 flex items-center gap-2 font-medium transition ${activeTab === 'docs' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400 hover:text-white'}`}
//           >
//             <BookOpen size={18} /> Documentation & Setup
//           </button>
//           <button 
//             onClick={() => FBTab('demo')}
//             className={`pb-4 px-2 flex items-center gap-2 font-mediumQl transition ${activeTab === 'demo' ? 'border-b-2 border-green-500 text-green-400' : 'text-slate-400 hover:text-white'}`}
//           >
//             <Play size={18} /> Live Interactive Demo
//           </button>
//         </div>

//         {activeTab === 'docs' ? <DocsSection /> : <DemoSection />}
//       </main>

//       {/* Footer */}
//       <footer className="p-6 text-center text-slate-500 text-sm border-t border-slate-800">
//         <p>Built with ❤️ using TypeScript Monorepo & WebRTC</p>
//       </footer>
//     </div>
//   );
// }

// function DocsSection() {
//   return (
//     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
//       <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
//         <h2 className="text-3xl font-bold mb-4">How to Run Connexify Locally</h2>
//         <p className="text-slate-300 mb-6">
//           Since the Signaling Server requires a persistent WebSocket connection, you need to run the backend on your machine to use the Live Demo feature properly.
//         </p>
        
//         <div className="space-y-6">
//           <Step 
//             num="1" 
//             title="Clone the Repository" 
//             code="git clone https://github.com/your-username/connexify.git" 
//           />
//           <Step 
//             num="2" 
//             title="Install Dependencies" 
//             code="pnpm install" 
//           />
//           <Step 
//             num="3" 
//             title="Start the Signaling Server" 
//             code="pnpm --filter signaling-server start" 
//           />
//         </div>

//         <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200">
//           <strong>💡 Tip:</strong> Once the server is running on localhost:3000, verify it by visiting <code className="bg-blue-900/50 px-1 rounded">http://localhost:3000/socket.io/socket.io.js</code> in your browser.
//         </div>
//       </div>
//     </div>
//   )
// }

// function Step({ num, title, code }: { num: string, title: string, code: string }) {
//   return (
//     <div className="flex gap-4">
//       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
//         {num}
//       </div>
//       <div className="w-full">
//         <h3 className="text-xl font-semibold mb-2">{title}</h3>
//         <div className="bg-black/50 p-4 rounded-lg font-mono text-sm border border-slate-700 flex items-center gap-2">
//           <Terminal size={16} className="text-slate-500" />
//           <span className="text-green-400">$</span> {code}
//         </div>
//       </div>
//     </div>
//   )
// }

// function DemoSection() {
//   const [url, setUrl] = useState("http://localhost:3000");
//   const [isConnected, setIsConnected] = useState(false);
//   const [logs, setLogs] = useState<string[]>([]);
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteContainerRef = useRef<HTMLDivElement>(null);

//   const addLog = (msg: string) => setLogs(prev => [...prev, `[${newjhDate().toLocaleTimeString()}] ${msg}`]);

//   const handleConnect = async () => {
//     try {
//       addLog(`Initializing Client connecting to ${url}...`);
      
//       const client = new ConnexifyRTCClient({
//         signalingURL: new URL(url),
//         constraints: { audio: true, video: true }
//       });

//       // Handle Remote Streams
//       client.onRemoteStream = (stream, peerId) => {
//         addLog(`🎥 Remote Stream Received: ${peerId}`);
//         const vid = document.createElement('video');
//         vid.srcObject = stream;
//         vid.autoplay = true;
//         vid.playsInline = true;
//         vid.className = "w-full rounded-lg border-2 border-green-500 bg-black aspect-video";
//         remoteContainerRef.current?.appendChild(vid);
//       };

//       // Handle Socket Events
//       client.socketHandler();
      
//       client.socket.on("connect_error", (err) => {
//         addLog(`❌ Connection Error: ${err.message}`);
//         alert("Could not connect to server. Make sure it's running locally!");
//       });

//       client.socket.on("connect", async () => {
//         addLog("✅ Connected to Signaling Server!");
//         setIsConnected(true);
//         await client.start();
        
//         if (client.localMediaStream && localVideoRef.current) {
//            localVideoRef.current.srcObject = client.localMediaStream;
//            addLog("🎤 Local Media Started");
//         }
//       });

//     } catch (e) {
//       console.error(e);
//       addLog(`❌ Error: ${e}`);
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
//       {/* Sidebar Controls */}
//       <div className="lg:col-span-1 space-y-6">
//         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
//           <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
//             <Wifi size={20} /> Connection Setup
//           </h3>
          
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm text-slate-400 mb-1">Signaling Server URL</label>
//               <input 
//                 type="text" 
//                 value={url}
//                 onChange={e => setUrl(e.target.value)}
//                 disabled={isConnected}
//                 className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:ring-2 ring-blue-500 outline-none"
//                 placeholder="http://localhost:3000"
//               />
//               <p className="text-xs text-slate-500 mt-1">
//                 Use <code className="text-slate-300">https://your-tunnel.url</code> if testing across networks.
//               </p>
//             </div>
            
//             {!isConnected ? (
//               <button 
//                 onClick={handleConnect}
//                 className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-900/20"
//               >
//                 Connect to Server
//               </button>
//             ) : (
//               <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded text-center font-bold">
//                 System Active
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Logs */}
//         <div className="bg-black/80 p-4 rounded-xl border border-slate-800 h-64 overflow-y-auto font-mono text-xs">
//           <div className="text-slate-500 mb-2 uppercase tracking-wider font-bold">System Logs</div>
//           {logs.length === 0 && <span className="text-slate-600 italic">Waiting for connection...</span>}
//           {logs.map((log, i) => (
//             <div key={i} className="mb-1 border-b border-slate-800/50 pb-1">{log}</div>
//           ))}
//         </div>
//       </div>

//       {/* Video Area */}
//       <div className="lg:col-span-2 space-y-6">
//          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Local Video */}
//             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
//                <div className="flex justify-between items-center mb-2">
//                  <h4 className="font-semibold text-slate-300 flex items-center gap-2">
//                     <Video size={16} /> Local Stream
//                  </h4>
//                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
//                </div>
//                <video 
//                  ref={localVideoRef} 
//                  autoPlay 
//                  muted 
//                  playsInline 
//                  className="w-full bg-black rounded-lg aspect-video transform -scale-x-100" // Mirror effect
//                />
//             </div>

//             {/* Remote Container Placeholder */}
//             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 min-h-[300px]">
//                <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
//                   <Wifi size={16} /> Remote Peers
//                </h4>
//                <div ref={remoteContainerRef} className="grid grid-cols-1 gap-4">
//                   {/* Remote videos will be injected here */}
//                </div>
//                {isConnected && remoteContainerRef.current?.childElementCount === 0 && (
//                  <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
//                     <div className="loader mb-2"></div> 
//                     <p>Waiting for peers to join...</p>
//                  </div>
//                )}
//             </div>
//          </div>
//       </div>

//     </div>
//   )
// }

// function newjhDate() { return new Date(); }


import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Wifi, Github, 
  Copy, Check, ArrowRight, Server, Activity 
} from 'lucide-react';
import { ConnexifyRTCClient } from '@connexify/core-sdk';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import connexifyLogo from './assets/Logo.png';

// --- Utility for Tailwind merging ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'docs' | 'demo'>('docs');

  return (
    <div className="min-h-screen font-sans selection:bg-white selection:text-black">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full border-b border-white/10 bg-black/50 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center overflow-hidden p-0.5">
              <span className="mb-0.5">
                <img 
                  src={connexifyLogo}
                ></img>
              </span>
            </div>
            Connexify
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/kuanarshubham/Connexify" target="_blank" className="text-zinc-400 hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">
              Deploy
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent pb-4"
          >
            WebRTC for the <br /> Modern Web.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-400 max-w-2xl mx-auto"
          >
            A modular, monorepo-based WebRTC ecosystem. 
            Designed for scalability, built with TypeScript, ready for production.
          </motion.p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-zinc-900/50 p-1 rounded-full border border-white/10 flex relative">
            {['docs', 'demo'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "relative px-8 py-2 text-sm font-medium rounded-full transition-all duration-300 z-10 capitalize",
                  activeTab === tab ? "text-black" : "text-zinc-400 hover:text-white"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'docs' ? <DocsView /> : <DemoView />}
          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
}

// --- Documentation View ---
function DocsView() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Terminal className="text-blue-500" /> Installation
          </h2>
          <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
            Connexify requires a local signaling server. Clone the monorepo and start the backend service.
          </p>
        </div>
        
        <Step 
          num="01" 
          title="Clone Repository" 
          code="git clone https://github.com/kuanarshubham/Connexify" 
        />
        <Step 
          num="02" 
          title="Install Dependencies" 
          code="pnpm install" 
        />
        <Step 
          num="03" 
          title="Start Signaling Server" 
          code="pnpm --filter signaling-server start" 
          note="Server runs on localhost:3000"
        />
      </div>

      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h3 className="text-xl font-bold mb-2">Architecture</h3>
        <p className="text-zinc-400 text-sm mb-6">
          Connexify uses a Mesh Topology for low-latency P2P communication.
        </p>
        
        {/* Simple Diagram */}
        <div className="relative h-48 w-full border border-dashed border-white/10 rounded-lg flex items-center justify-center">
           <div className="absolute inset-0 flex items-center justify-center opacity-20 text-[10px] font-mono text-zinc-500">
             MESH TOPOLOGY VISUALIZATION
           </div>
           
           <div className="relative w-24 h-24">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-zinc-600 rounded-full" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-zinc-600 rounded-full" />
              
              <svg className="absolute inset-0 w-full h-full text-zinc-700 pointer-events-none" stroke="currentColor" strokeWidth="1">
                <line x1="50%" y1="5%" x2="5%" y2="95%" />
                <line x1="50%" y1="5%" x2="95%" y2="95%" />
                <line x1="5%" y1="95%" x2="95%" y2="95%" />
              </svg>
           </div>
        </div>
      </div>
    </div>
  )
}

function Step({ num, title, code, note }: { num: string, title: string, code: string, note?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group">
      <div className="text-xs font-mono text-zinc-500 mb-2">STEP {num}</div>
      <h3 className="text-zinc-200 font-medium mb-3">{title}</h3>
      <div className="relative bg-black border border-white/10 rounded-lg p-4 font-mono text-sm text-zinc-300 flex justify-between items-center group-hover:border-white/20 transition-colors">
        <span>$ {code}</span>
        <button onClick={copy} className="text-zinc-500 hover:text-white transition-colors">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      {note && <div className="mt-2 text-xs text-blue-400 flex items-center gap-1"><ArrowRight size={10} /> {note}</div>}
    </div>
  )
}

// --- Demo View ---
function DemoView() {
  const [url, setUrl] = useState("http://localhost:3000");
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => setLogs(p => [`> ${msg}`, ...p].slice(0, 5));

  const connect = async () => {
    if (!url) return;
    setStatus('connecting');
    addLog("Initializing SDK...");

    try {
      const client = new ConnexifyRTCClient({
        signalingURL: new URL(url),
        constraints: { audio: true, video: true }
      });

      client.onRemoteStream = (stream: MediaStream, peerId: string) => {
        addLog(`Stream received: ${peerId.substring(0, 5)}...`);
        const vid = document.createElement('video');
        vid.srcObject = stream;
        vid.autoplay = true;
        vid.className = "w-full h-full object-cover rounded-lg border border-white/10";
        remoteContainerRef.current?.appendChild(vid);
      };

      client.socketHandler();
      
      client.socket.on("connect_error", () => {
        setStatus('error');
        addLog("Connection failed. Is server running?");
      });

      client.socket.on("connect", async () => {
        setStatus('connected');
        addLog("Connected to Signaling Server");
        await client.start();
        if (client.localMediaStream && localVideoRef.current) {
          localVideoRef.current.srcObject = client.localMediaStream;
          addLog("Local media acquired");
        }
      });

    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Bar */}
      <div className="bg-zinc-900 border border-white/10 p-1.5 rounded-full flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex items-center px-4 gap-2 bg-black rounded-full border border-white/5">
          <Server size={14} className="text-zinc-500" />
          <input 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-zinc-300 placeholder:text-zinc-700 font-mono"
            placeholder="Signaling URL (e.g. localhost:3000)"
            disabled={status === 'connected'}
          />
        </div>
        <button 
          onClick={connect}
          disabled={status === 'connected' || status === 'connecting'}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 justify-center",
            status === 'connected' 
              ? "bg-green-500/10 text-green-500 cursor-default" 
              : "bg-white text-black hover:bg-zinc-200"
          )}
        >
          {status === 'connecting' && <Activity size={14} className="animate-spin" />}
          {status === 'connected' ? "Connected" : "Connect"}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-12 gap-6 h-[500px]">
        {/* Sidebar Logs */}
        <div className="md:col-span-4 bg-zinc-950 border border-white/10 rounded-2xl p-6 flex flex-col">
          <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">System Events</h3>
          <div className="flex-1 font-mono text-xs text-zinc-500 space-y-2 overflow-hidden">
            {logs.length === 0 && <span className="opacity-30">Waiting for logs...</span>}
            {logs.map((log, i) => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i}>
                {log}
              </motion.div>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t border-white/5">
             <div className="flex items-center gap-2 text-xs text-zinc-500">
               <div className={cn("w-2 h-2 rounded-full", status === 'connected' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-700")} />
               {status === 'connected' ? 'System Online' : 'System Offline'}
             </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="md:col-span-8 bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 grid grid-cols-2 p-4 gap-4">
            {/* Local */}
            <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group">
              <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] font-medium border border-white/10">YOU</div>
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
            </div>
            
            {/* Remote Container */}
            <div ref={remoteContainerRef} className="contents">
               {/* Remote videos injected here */}
            </div>
          </div>

          {status !== 'connected' && (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
               <div className="text-zinc-500 text-sm flex flex-col items-center gap-3">
                 <Wifi size={32} className="opacity-20" />
                 <span>Establish connection to view streams</span>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}