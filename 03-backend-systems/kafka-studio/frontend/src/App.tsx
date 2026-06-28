import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Database, Server, Send, Play, Square, Trash2,
  RefreshCw, Activity, ChevronDown, X, Plus, Minus,
  LayoutGrid, Filter, Hash, Key,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const SOCKET_URL = 'http://localhost:3000';
const API_URL    = 'http://localhost:3000/api';
const MAX_MESSAGES = 200;

// ─── Types ────────────────────────────────────────────────────────────────────
type Partition = { id: number; leader: number; replicas: number };
type Topic = { name: string; partitions: Partition[] };
type ConsumerMeta = { groupId: string; topics: string[]; subscribedAt: string; messageCount: number };
type KafkaMessage = {
  groupId: string; topic: string; partition: number;
  key: string; value: string; offset: string; timestamp: string;
};
type Toast = { id: number; type: 'success' | 'error' | 'info'; message: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PARTITION_COLORS = [
  '#3b82f6', '#8b5cf6', '#f97316', '#10b981',
  '#ec4899', '#14b8a6', '#f59e0b', '#6366f1',
];

function prettyJSON(val: string): string {
  try { return JSON.stringify(JSON.parse(val), null, 2); }
  catch { return val; }
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium border
              ${t.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' :
                t.type === 'error'   ? 'bg-red-950 border-red-800 text-red-300' :
                                       'bg-slate-900 border-slate-700 text-slate-300'}`}
          >
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-1 text-current opacity-60 hover:opacity-100 cursor-pointer"><X className="w-3 h-3" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Partition Rail ───────────────────────────────────────────────────────────
function PartitionRail({ topic, recentPartition }: { topic: Topic; recentPartition: number | null }) {
  return (
    <div className="flex gap-1 mt-1.5 flex-wrap">
      {topic.partitions.map(p => (
        <div
          key={p.id}
          title={`Partition ${p.id}`}
          className="relative h-5 rounded flex items-center justify-center text-[9px] font-bold text-white/90 transition-all duration-300 overflow-hidden"
          style={{
            width: `${Math.max(24, Math.floor(100 / topic.partitions.length) - 2)}%`,
            maxWidth: 48,
            backgroundColor: PARTITION_COLORS[p.id % PARTITION_COLORS.length],
            opacity: recentPartition === p.id ? 1 : 0.45,
            transform: recentPartition === p.id ? 'scale(1.08)' : 'scale(1)',
            boxShadow: recentPartition === p.id
              ? `0 0 10px ${PARTITION_COLORS[p.id % PARTITION_COLORS.length]}88`
              : 'none',
          }}
        >
          P{p.id}
        </div>
      ))}
    </div>
  );
}

// ─── Quick Payload Templates ──────────────────────────────────────────────────
const TEMPLATES = [
  { label: 'User Signup', key: 'user-123', payload: '{\n  "event": "user.signup",\n  "userId": "user-123",\n  "email": "alice@example.com",\n  "plan": "pro"\n}' },
  { label: 'Order Created', key: 'order-456', payload: '{\n  "event": "order.created",\n  "orderId": "order-456",\n  "amount": 99.99,\n  "currency": "USD"\n}' },
  { label: 'Page View', key: '', payload: '{\n  "event": "page.view",\n  "path": "/dashboard",\n  "sessionId": "sess-789"\n}' },
  { label: 'Error Log', key: 'svc-api', payload: '{\n  "level": "ERROR",\n  "service": "svc-api",\n  "message": "DB connection timeout",\n  "code": 504\n}' },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [consumers, setConsumers] = useState<ConsumerMeta[]>([]);
  const [messages, setMessages] = useState<KafkaMessage[]>([]);
  const [stats, setStats] = useState({ topicCount: 0, consumerCount: 0, totalMessagesSent: 0 });

  // Topic form
  const [newTopic, setNewTopic]       = useState('');
  const [newPartitions, setNewPartitions] = useState(3);
  const [topicLoading, setTopicLoading] = useState(false);

  // Producer form
  const [prodTopic, setProdTopic]   = useState('');
  const [prodKey, setProdKey]       = useState('');
  const [prodPayload, setProdPayload] = useState(TEMPLATES[0].payload);
  const [prodLoading, setProdLoading] = useState(false);
  const [lastSent, setLastSent] = useState<{ partition: number; offset: string } | null>(null);

  // Consumer form
  const [consGroup, setConsGroup]   = useState('');
  const [consTopic, setConsTopic]   = useState('');
  const [consLoading, setConsLoading] = useState(false);

  // Stream
  const [filterGroup, setFilterGroup] = useState('');
  const [filterPartition, setFilterPartition] = useState<number | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const streamEndRef = useRef<HTMLDivElement>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // Per-topic recent partition (for animation)
  const [recentPartitions, setRecentPartitions] = useState<Record<string, number>>({});

  // ─ Toast helpers ─
  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const dismissToast = (id: number) => setToasts(p => p.filter(t => t.id !== id));

  // ─ Socket & initial data ─
  useEffect(() => {
    const sock = io(SOCKET_URL);
    setSocket(sock);

    sock.on('connect',    () => { setIsConnected(true); });
    sock.on('disconnect', () => setIsConnected(false));

    sock.on('topic-update', (data: Topic[]) => setTopics(data));
    sock.on('consumer-update', (data: ConsumerMeta[]) => setConsumers(data));

    sock.on('kafka-message', (msg: KafkaMessage) => {
      setMessages(prev => {
        const next = [...prev, msg];
        return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
      });
      setRecentPartitions(p => ({ ...p, [msg.topic]: msg.partition }));
    });

    return () => { sock.disconnect(); };
  }, []);

  // ─ Fetch stats periodically ─
  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/stats`);
      const d = await r.json();
      if (d.success) setStats(d);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchStats();
    const iv = setInterval(fetchStats, 5000);
    return () => clearInterval(iv);
  }, [fetchStats]);

  // ─ Auto-scroll ─
  useEffect(() => {
    if (autoScroll) streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, autoScroll]);

  // ─ Sync prod/cons topic selectors ─
  useEffect(() => {
    if (topics.length > 0) {
      if (!prodTopic) setProdTopic(topics[0].name);
      if (!consTopic) setConsTopic(topics[0].name);
    }
  }, [topics]);

  // ─ Create topic ─
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    setTopicLoading(true);
    try {
      const r = await fetch(`${API_URL}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: newTopic.trim(), partitions: newPartitions }),
      });
      const d = await r.json();
      if (d.success) {
        toast('success', d.message);
        setNewTopic('');
        setNewPartitions(3);
      } else {
        toast('error', d.error || d.message);
      }
    } catch { toast('error', 'Cannot connect to backend'); }
    finally { setTopicLoading(false); }
  };

  // ─ Delete topic ─
  const handleDeleteTopic = async (name: string) => {
    try {
      const r = await fetch(`${API_URL}/topics/${encodeURIComponent(name)}`, { method: 'DELETE' });
      const d = await r.json();
      d.success ? toast('success', d.message) : toast('error', d.error || d.message);
    } catch { toast('error', 'Cannot connect to backend'); }
  };

  // ─ Publish message ─
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTopic || !prodPayload.trim()) return;
    setProdLoading(true);
    setLastSent(null);
    try {
      const r = await fetch(`${API_URL}/produce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: prodTopic, key: prodKey, message: prodPayload }),
      });
      const d = await r.json();
      if (d.success) {
        setLastSent({ partition: d.partition, offset: d.offset });
        toast('success', `Sent → ${prodTopic}[P${d.partition}] @ offset ${d.offset}`);
        fetchStats();
      } else {
        toast('error', d.error || 'Failed to send');
      }
    } catch { toast('error', 'Cannot connect to backend'); }
    finally { setProdLoading(false); }
  };

  // ─ Start consumer ─
  const handleStartConsumer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consGroup.trim() || !consTopic) return;
    setConsLoading(true);
    try {
      const r = await fetch(`${API_URL}/consumers/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: consGroup.trim(), topics: [consTopic] }),
      });
      const d = await r.json();
      if (d.success) {
        toast('success', d.message);
        setConsGroup('');
      } else {
        toast('error', d.error || d.message);
      }
    } catch { toast('error', 'Cannot connect to backend'); }
    finally { setConsLoading(false); }
  };

  // ─ Stop consumer ─
  const handleStopConsumer = async (groupId: string) => {
    try {
      const r = await fetch(`${API_URL}/consumers/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });
      const d = await r.json();
      d.success ? toast('info', d.message) : toast('error', d.error || d.message);
    } catch { toast('error', 'Cannot connect to backend'); }
  };

  // ─ Reset all ─
  const handleReset = async () => {
    try {
      const r = await fetch(`${API_URL}/reset`, { method: 'POST' });
      const d = await r.json();
      if (d.success) {
        setMessages([]);
        setLastSent(null);
        setRecentPartitions({});
        setProdTopic('');
        setConsTopic('');
        toast('info', 'System reset — all topics and consumers cleared');
      }
    } catch { toast('error', 'Cannot connect to backend'); }
  };

  // ─ Filtered messages ─
  const filteredMessages = messages.filter(m => {
    if (filterGroup && m.groupId !== filterGroup) return false;
    if (filterPartition !== null && m.partition !== filterPartition) return false;
    return true;
  });

  // ─ Unique groups for filter ─
  const uniqueGroups = [...new Set(messages.map(m => m.groupId))];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen overflow-hidden flex flex-col gap-3 p-3" style={{ background: '#080b12' }}>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      {/* ── Header ── */}
      <header className="flex-shrink-0 panel px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none tracking-tight">Kafka Studio</h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Real-time Visualization Dashboard</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Topics', val: stats.topicCount, color: 'text-blue-400' },
            { label: 'Consumers', val: stats.consumerCount, color: 'text-emerald-400' },
            { label: 'Sent', val: stats.totalMessagesSent, color: 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: '#0d1117', border: '1px solid #1a2235' }}>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{s.label}</span>
              <span className={`text-sm font-bold tabular-nums ${s.color}`}>{s.val}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="btn btn-ghost text-[11px] gap-1.5" title="Reset all topics and consumers">
            <RefreshCw className="w-3.5 h-3.5" /> Reset All
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#0d1117', border: '1px solid #1a2235' }}>
            <div className="relative w-2 h-2">
              {isConnected && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />}
              <span className={`absolute inset-0 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-500'}`} />
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Grid ── */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-3">

        {/* ── LEFT: Infrastructure ── */}
        <div className="col-span-4 flex flex-col gap-3 min-h-0">

          {/* Topics Panel */}
          <div className="panel p-4 flex flex-col min-h-0 flex-1">
            <div className="flex-shrink-0 flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-blue-400" /> Topics
              </h2>
              <span className="tag tag-blue">{topics.length} active</span>
            </div>

            {/* Create Topic Form */}
            <form onSubmit={handleCreateTopic} className="flex-shrink-0 space-y-2 mb-3">
              <input
                className="input-base"
                placeholder="Topic name (e.g. user-events)"
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
              />
              <div className="flex gap-2">
                {/* Partitions spinner */}
                <div className="flex items-center flex-1 rounded-lg overflow-hidden" style={{ background: '#080b12', border: '1px solid #1a2235' }}>
                  <span className="pl-2.5 text-[10px] font-semibold text-slate-500 whitespace-nowrap select-none">
                    <LayoutGrid className="w-3 h-3 inline mr-1" />Partitions
                  </span>
                  <div className="flex items-center ml-auto border-l border-slate-800">
                    <button type="button" onClick={() => setNewPartitions(Math.max(1, newPartitions - 1))}
                      className="px-2 py-2 text-slate-500 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-200">{newPartitions}</span>
                    <button type="button" onClick={() => setNewPartitions(Math.min(12, newPartitions + 1))}
                      className="px-2 py-2 text-slate-500 hover:text-white hover:bg-slate-800 border-l border-slate-800 cursor-pointer transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={!newTopic.trim() || topicLoading}
                  className="btn btn-primary px-4 shrink-0">
                  {topicLoading ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Create
                </button>
              </div>
            </form>

            {/* Topic List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
              {topics.length === 0
                ? <div className="h-20 flex flex-col items-center justify-center text-slate-700 gap-1 text-xs">
                    <Database className="w-5 h-5 opacity-30" />
                    No topics yet
                  </div>
                : topics.map(topic => (
                  <div key={topic.name} className="rounded-lg p-2.5 transition-colors group" style={{ background: '#0d1117', border: '1px solid #1a2235' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-slate-200 truncate block font-code">{topic.name}</span>
                        <span className="text-[10px] text-slate-600">{topic.partitions.length} partition{topic.partitions.length !== 1 ? 's' : ''}</span>
                      </div>
                      <button onClick={() => handleDeleteTopic(topic.name)}
                        className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 cursor-pointer transition-all p-1 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <PartitionRail
                      topic={topic}
                      recentPartition={recentPartitions[topic.name] ?? null}
                    />
                  </div>
                ))
              }
            </div>
          </div>

          {/* Consumers Panel */}
          <div className="panel p-4 flex flex-col min-h-0 flex-1">
            <div className="flex-shrink-0 flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-emerald-400" /> Consumer Groups
              </h2>
              <span className="tag tag-green">{consumers.length} running</span>
            </div>

            <form onSubmit={handleStartConsumer} className="flex-shrink-0 space-y-2 mb-3">
              <input
                className="input-base"
                placeholder="Group ID (e.g. analytics-service)"
                value={consGroup}
                onChange={e => setConsGroup(e.target.value)}
              />
              <div className="flex gap-2">
                <select className="input-base flex-1" value={consTopic} onChange={e => setConsTopic(e.target.value)}>
                  <option value="" disabled>Select topic...</option>
                  {topics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
                <button type="submit" disabled={!consGroup.trim() || !consTopic || consLoading}
                  className="btn btn-success px-4 shrink-0">
                  {consLoading ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Start
                </button>
              </div>
            </form>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
              {consumers.length === 0
                ? <div className="h-20 flex flex-col items-center justify-center text-slate-700 gap-1 text-xs">
                    <Server className="w-5 h-5 opacity-30" />
                    No active consumers
                  </div>
                : consumers.map(c => (
                  <div key={c.groupId} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: '#0d1117', border: '1px solid #1a2235' }}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-200 truncate font-code">{c.groupId}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 ml-3.5">
                        <span className="tag tag-blue text-[8px]">{c.topics.join(', ')}</span>
                        <span className="text-[10px] text-slate-600">{c.messageCount} msgs</span>
                      </div>
                    </div>
                    <button onClick={() => handleStopConsumer(c.groupId)}
                      className="text-slate-700 hover:text-red-400 cursor-pointer transition-colors p-1 shrink-0">
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* ── MIDDLE: Producer ── */}
        <div className="col-span-4 panel p-4 flex flex-col min-h-0">
          <h2 className="flex-shrink-0 text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Send className="w-3.5 h-3.5 text-orange-400" /> Message Producer
          </h2>

          <form onSubmit={handlePublish} className="flex-1 min-h-0 flex flex-col gap-3">
            {/* Target topic */}
            <div className="flex-shrink-0 space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Target Topic</label>
              <select className="input-base" value={prodTopic} onChange={e => setProdTopic(e.target.value)}>
                <option value="" disabled>Select a topic...</option>
                {topics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>

            {/* Message Key */}
            <div className="flex-shrink-0 space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3 h-3" />
                Message Key
                <span className="font-normal normal-case opacity-50">— optional, deterministic partition routing</span>
              </label>
              <input
                className="input-base font-code"
                placeholder="e.g. user-123  (empty = round-robin)"
                value={prodKey}
                onChange={e => setProdKey(e.target.value)}
              />
            </div>

            {/* Templates */}
            <div className="flex-shrink-0 space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Quick Templates</label>
              <div className="flex flex-wrap gap-1">
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => { setProdPayload(tpl.payload); setProdKey(tpl.key); }}
                    className="text-[10px] px-2 py-1 rounded-md font-medium cursor-pointer transition-colors"
                    style={{ background: '#0d1117', border: '1px solid #1a2235', color: '#94a3b8' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#334155')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a2235')}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payload */}
            <div className="flex-1 min-h-0 flex flex-col space-y-1.5">
              <label className="flex-shrink-0 block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Payload <span className="font-normal normal-case opacity-50">(JSON or plain text)</span>
              </label>
              <textarea
                className="flex-1 min-h-0 input-base font-code resize-none text-[12px] leading-relaxed"
                placeholder={'{\n  "event": "...",\n  "data": {}\n}'}
                value={prodPayload}
                onChange={e => setProdPayload(e.target.value)}
              />
            </div>

            {/* Last-sent result */}
            <AnimatePresence>
              {lastSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg overflow-hidden"
                  style={{ background: '#0d2b1a', border: '1px solid #155724' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Routed to <strong>Partition {lastSent.partition}</strong> — offset <strong>{lastSent.offset}</strong>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={!prodTopic || !prodPayload.trim() || prodLoading}
              className="flex-shrink-0 w-full py-2.5 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
            >
              {prodLoading
                ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <Send className="w-4 h-4" />}
              Publish Message
            </button>
          </form>
        </div>

        {/* ── RIGHT: Live Stream ── */}
        <div className="col-span-4 panel p-4 flex flex-col min-h-0">
          <div className="flex-shrink-0 flex items-center justify-between gap-2 mb-3">
            <h2 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Live Stream
            </h2>
            <div className="flex items-center gap-1.5">
              {filteredMessages.length > 0 && (
                <button onClick={() => setMessages([])}
                  className="text-[10px] text-slate-600 hover:text-red-400 cursor-pointer transition-colors px-2 py-0.5 rounded"
                  style={{ border: '1px solid #1a2235' }}>
                  Clear
                </button>
              )}
              <div className="px-2 py-1 rounded" style={{ background: '#0d1117', border: '1px solid #1a2235' }}>
                <span className="text-[10px] font-bold tabular-nums text-cyan-400">{filteredMessages.length}</span>
                <span className="text-[10px] text-slate-600"> / {MAX_MESSAGES}</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex-shrink-0 flex gap-1.5 mb-2">
            <div className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-lg" style={{ background: '#080b12', border: '1px solid #1a2235' }}>
              <Filter className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <select
                className="bg-transparent text-[11px] text-slate-400 outline-none flex-1 cursor-pointer"
                value={filterGroup}
                onChange={e => setFilterGroup(e.target.value)}
              >
                <option value="">All groups</option>
                {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: '#080b12', border: '1px solid #1a2235' }}>
              <Hash className="w-3 h-3 text-slate-600 flex-shrink-0" />
              <select
                className="bg-transparent text-[11px] text-slate-400 outline-none cursor-pointer"
                value={filterPartition ?? ''}
                onChange={e => setFilterPartition(e.target.value === '' ? null : Number(e.target.value))}
              >
                <option value="">All P</option>
                {[...new Set(messages.map(m => m.partition))].sort((a,b)=>a-b).map(p =>
                  <option key={p} value={p}>P{p}</option>
                )}
              </select>
            </div>
            <button
              onClick={() => setAutoScroll(a => !a)}
              className={`text-[10px] px-2 py-1 rounded-lg font-medium cursor-pointer transition-colors shrink-0 ${autoScroll ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-600 border border-slate-800'}`}
              title="Toggle auto-scroll"
            >
              Auto
            </button>
          </div>

          {/* Message stream */}
          <div className="flex-1 min-h-0 overflow-y-auto relative" style={{ background: '#080b12', borderRadius: 8, border: '1px solid #1a2235', padding: '8px' }}>
            {filteredMessages.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-700">
                <Activity className="w-8 h-8 opacity-20" />
                <p className="text-xs font-medium">
                  {messages.length > 0 ? 'No messages match filter' : 'Awaiting messages...'}
                </p>
              </div>
            ) : null}
            <AnimatePresence initial={false}>
              {filteredMessages.map((msg, i) => {
                const pColor = PARTITION_COLORS[msg.partition % PARTITION_COLORS.length];
                return (
                  <motion.div
                    key={`${msg.groupId}-${msg.topic}-${msg.partition}-${msg.offset}-${i}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mb-2 rounded-lg overflow-hidden"
                    style={{ border: '1px solid #1a2235', borderLeftColor: pColor, borderLeftWidth: 3 }}
                  >
                    <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5" style={{ background: '#0d1117' }}>
                      <div className="flex flex-wrap gap-1">
                        <span className="tag tag-green">{msg.groupId}</span>
                        <span className="tag tag-blue">{msg.topic}</span>
                        <span className="tag" style={{ background: `${pColor}15`, color: pColor, border: `1px solid ${pColor}30` }}>
                          P{msg.partition}
                        </span>
                        {msg.key && <span className="tag tag-amber">⌘ {msg.key}</span>}
                        <span className="tag tag-slate">@{msg.offset}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 tabular-nums whitespace-nowrap">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false })}
                      </span>
                    </div>
                    <pre className="px-2.5 py-2 text-[11px] text-slate-300 font-code leading-relaxed overflow-x-auto whitespace-pre-wrap break-all" style={{ background: '#080b12' }}>
                      {prettyJSON(msg.value)}
                    </pre>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={streamEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}
