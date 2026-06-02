'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  MessageSquare, Sun, Monitor, Search, Code, TestTube,
  Share2, FileText, Crown, Users, Play, Square, RefreshCw,
  Terminal, Zap, Network, PlusCircle, X,
  CheckCircle, Activity, Settings, Star, Bot, Mail, Calendar, Rocket, BarChart2,
  ImageIcon, Video, Upload,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'setup_required';
interface LogEntry { time: string; message: string; type: 'info' | 'success' | 'error' | 'agent' }
interface ChatMessage { role: 'user' | 'assistant'; content: string }
interface SocialPost { platform: 'instagram' | 'facebook' | 'linkedin'; content: string }

// ─── Agent definitions ────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: 'strategy-advisor', name: 'Strategy Advisor', category: 'business',
    description: 'Chat about your platform, create business plans, analyze metrics and get strategic guidance.',
    gradient: 'from-violet-600 to-purple-600', Icon: MessageSquare,
    conversational: true, needsInput: true,
    capabilities: ['Business plans', 'Pricing strategy', 'Growth tactics', 'Product roadmap', 'Persistent conversation'],
    suggestions: [
      { label: 'Pricing analysis', prompt: 'Analyze the most common pricing models for AI SaaS tools targeting content creators and suggest a competitive strategy.' },
      { label: 'Launch strategy', prompt: 'Create a strategy to move from beta to public release. What are the key steps and risks?' },
      { label: 'Next features', prompt: 'For an AI content creation platform, what are the top 3 features to prioritize and why?' },
    ],
  },
  {
    id: 'daily-planner', name: 'Daily Planner', category: 'business',
    description: 'Orchestrates a structured daily action plan with priorities, market pulse, and key tasks.',
    gradient: 'from-amber-500 to-orange-500', Icon: Sun,
    conversational: false, needsInput: true,
    capabilities: ['Daily priorities', 'Business insights', 'Action items', 'Market pulse', 'Structured planning'],
    suggestions: [
      { label: "Today's briefing", prompt: "Create my daily briefing as an AI SaaS founder: 3 business priorities, 2 market insights, and today's top action item." },
      { label: 'Weekly review', prompt: 'Write a complete weekly review: what went well, key metrics to check, and a plan for next week.' },
    ],
  },
  {
    id: 'app-monitor', name: 'App Monitor', category: 'business',
    description: 'Analyzes platform metrics, detects anomalies, and generates health reports in real time.',
    gradient: 'from-green-500 to-emerald-500', Icon: Monitor,
    conversational: false, needsInput: true,
    capabilities: ['Active users', 'Error tracking', 'Feature usage', 'Anomaly detection', 'Health reports'],
    suggestions: [
      { label: 'App health report', prompt: 'Generate an app health report for a beta AI SaaS with ~50 users. Include the top 10 KPIs, alert thresholds, and recommended monitoring setup.' },
      { label: 'Beta metrics template', prompt: 'Create a metrics dashboard template for a beta-stage AI product. What should I track daily vs weekly?' },
    ],
  },
  {
    id: 'web-researcher', name: 'Web Researcher', category: 'personal',
    description: 'Research any topic and compile a structured report with insights, competitive analysis, and opportunities.',
    gradient: 'from-sky-500 to-blue-500', Icon: Search,
    conversational: false, needsInput: true,
    capabilities: ['Research reports', 'Competitive analysis', 'Market trends', 'Structured insights', 'Opportunity mapping'],
    suggestions: [
      { label: 'AI content tools landscape', prompt: 'Research the competitive landscape for AI content creation tools in 2025 — key players, pricing, gaps in the market.' },
      { label: 'Virtual influencer market', prompt: 'Analyze the market opportunity for AI virtual influencers and avatars. Main players and monetization models.' },
      { label: 'Generative AI trends', prompt: 'What are the top 5 trends in generative AI for content creators in 2025? Focus on practical implications for a SaaS product.' },
    ],
  },
  {
    id: 'code-reviewer', name: 'Code Reviewer', category: 'development',
    description: 'Analyzes code, spots bugs, suggests improvements, and checks security best practices.',
    gradient: 'from-indigo-500 to-violet-500', Icon: Code,
    conversational: false, needsInput: true,
    capabilities: ['Bug detection', 'Security (OWASP)', 'Performance', 'Clean code', 'Corrected examples'],
    suggestions: [
      { label: 'Review API route', prompt: 'Review this Next.js API route for bugs, security issues, and improvements:\n\n// Paste your code here' },
      { label: 'Security audit', prompt: 'Audit this code for vulnerabilities (injection, XSS, auth bypass, data exposure):\n\n// Paste your code here' },
      { label: 'Performance review', prompt: 'Suggest performance improvements for this function or component:\n\n// Paste your code here' },
    ],
  },
  {
    id: 'test-writer', name: 'Test Writer', category: 'development',
    description: 'Analyzes your code and generates unit and integration tests automatically.',
    gradient: 'from-pink-500 to-rose-500', Icon: TestTube,
    conversational: false, needsInput: true,
    capabilities: ['Unit tests', 'Integration tests', 'Mocks & fixtures', 'Edge cases', 'Jest / Vitest'],
    suggestions: [
      { label: 'Tests for function', prompt: 'Generate comprehensive Jest tests for this function, including edge cases:\n\n// Paste your function here' },
      { label: 'API route tests', prompt: 'Generate integration tests for this Next.js API route including error cases:\n\n// Paste your route here' },
    ],
  },
  {
    id: 'social-content', name: 'Social Content', category: 'creative',
    description: 'Generates posts, captions, and hashtags for Instagram, Facebook, and LinkedIn.',
    gradient: 'from-fuchsia-500 to-pink-500', Icon: Share2,
    conversational: true, needsInput: true,
    capabilities: ['Instagram posts', 'Facebook posts', 'LinkedIn posts', 'Optimized hashtags', 'Brand tone'],
    suggestions: [
      { label: 'Promote AI feature', prompt: 'Create posts for Instagram, Facebook, and LinkedIn promoting an AI avatar creator. Tone: exciting, visual, curiosity-driven.' },
      { label: 'Recruit beta testers', prompt: 'Create posts recruiting beta testers for an AI content platform. Offer free access in exchange for feedback.' },
      { label: 'Behind the scenes', prompt: 'Create behind-the-scenes posts showing the process of building an AI SaaS as a solo founder. Tone: authentic, human, transparent.' },
    ],
  },
  {
    id: 'blog-writer', name: 'Blog Writer', category: 'creative',
    description: 'Writes SEO-optimized articles ready to publish, with structured headings and CTAs.',
    gradient: 'from-lime-500 to-green-500', Icon: FileText,
    conversational: false, needsInput: true,
    capabilities: ['SEO optimized', 'Meta description', 'Structured headings', 'CTAs', 'Multi-language'],
    suggestions: [
      { label: 'AI image generation guide', prompt: 'Write an SEO article: "How to create AI images — complete guide 2025". Practical tips and model comparisons.' },
      { label: 'Virtual influencer guide', prompt: 'Write: "How to create a virtual influencer with AI in 2025". Cover tools, process, and monetization.' },
      { label: 'AI agents for business', prompt: 'Write: "How AI agents can automate your business in 2025". Target: solo founders and small teams.' },
    ],
  },
  {
    id: 'orchestrator', name: 'Chief Orchestrator', category: 'multi',
    description: 'Analyzes complex tasks, delegates to specialist agents, and combines results.',
    gradient: 'from-amber-500 to-yellow-500', Icon: Crown,
    conversational: false, needsInput: true,
    capabilities: ['Task decomposition', 'Agent delegation', 'Result synthesis', 'Multi-step plans'],
    suggestions: [
      { label: 'Product launch plan', prompt: 'Plan the launch of a new AI video feature: social strategy, blog outline, email sequence, and success metrics.' },
      { label: 'Weekly review', prompt: 'Complete weekly review: metrics analysis, content performance, product decisions, and plan for next week.' },
    ],
  },
  {
    id: 'parallel-workers', name: 'Parallel Workers', category: 'multi',
    description: 'Launches multiple specialized agents simultaneously and combines the results.',
    gradient: 'from-cyan-500 to-blue-500', Icon: Users,
    conversational: false, needsInput: true,
    capabilities: ['Parallel execution', 'Multi-task', 'Combined output', 'Faster results'],
    suggestions: [
      { label: 'Research + content', prompt: 'In parallel: research the latest AI trends for creators, AND write a social post about those trends for Instagram and LinkedIn.' },
      { label: 'Code + tests', prompt: 'In parallel: review this function for bugs AND generate unit tests:\n\n// Paste your code here' },
    ],
  },
  // ── Requires setup (shown as disabled, matching admin UI) ──────────────────
  {
    id: 'user-reports', name: 'User Reports', category: 'business',
    description: 'Generates detailed reports on usage, engagement, retention and revenue.',
    gradient: 'from-violet-500 to-purple-500', Icon: BarChart2,
    conversational: false, needsInput: true,
    requiresSetup: false,
    capabilities: ['New signups', 'Retention & churn', 'MRR revenue', 'Segmentation', 'Top users'],
    suggestions: [
      { label: 'Monthly report', prompt: 'Generate a user report for this month: new signups, retention, MRR, and comparison with last month.' },
      { label: 'Churn risk', prompt: 'Identify users at risk of churning this week and suggest retention actions.' },
    ],
  },
  {
    id: 'customer-support', name: 'Customer Support', category: 'business',
    description: 'Reads support emails and auto-generates replies based on conversation history.',
    gradient: 'from-blue-500 to-cyan-500', Icon: Mail,
    conversational: false, needsInput: false,
    requiresSetup: true, setupLabel: 'Connect Gmail',
    capabilities: ['Reads support emails', 'Auto-replies', 'Priority ranking', 'Escalation'],
    suggestions: [],
  },
  {
    id: 'email-summary', name: 'Email Summary', category: 'personal',
    description: 'Reads your inbox and summarises important emails, highlighting what needs action.',
    gradient: 'from-orange-500 to-amber-500', Icon: Mail,
    conversational: false, needsInput: false,
    requiresSetup: true, setupLabel: 'Connect Email',
    capabilities: ['Email summary', 'Action detection', 'Spam filter', 'Priority ranking'],
    suggestions: [],
  },
  {
    id: 'calendar-manager', name: 'Calendar Manager', category: 'personal',
    description: 'Organises your calendar, suggests time slots, creates events and sends reminders.',
    gradient: 'from-teal-500 to-green-500', Icon: Calendar,
    conversational: false, needsInput: false,
    requiresSetup: true, setupLabel: 'Connect Google Calendar',
    capabilities: ['View events', 'Suggest free slots', 'Create events', 'Send reminders'],
    suggestions: [],
  },
  {
    id: 'deploy-agent', name: 'Deploy Agent', category: 'development',
    description: 'Monitors tests and auto-deploys when code passes all checks.',
    gradient: 'from-red-500 to-orange-500', Icon: Rocket,
    conversational: false, needsInput: false,
    requiresSetup: true, setupLabel: 'Connect CI/CD',
    capabilities: ['Monitor tests', 'Auto-deploy', 'Rollback on error', 'Deploy notifications'],
    suggestions: [],
  },
] as const;

type AgentId = typeof AGENTS[number]['id'];

const STATUS: Record<AgentStatus, { label: string; color: string; dot: string }> = {
  idle: { label: 'Ready', color: 'text-gray-400', dot: 'bg-gray-400' },
  running: { label: 'Running…', color: 'text-blue-400', dot: 'bg-blue-400 animate-pulse' },
  completed: { label: 'Completed', color: 'text-green-400', dot: 'bg-green-400' },
  error: { label: 'Error', color: 'text-red-400', dot: 'bg-red-400' },
  setup_required: { label: 'Setup required', color: 'text-orange-400', dot: 'bg-orange-400' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSocialPosts(text: string): SocialPost[] {
  const posts: SocialPost[] = [];
  const platforms: Array<{ key: SocialPost['platform']; label: string }> = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'linkedin', label: 'LinkedIn' },
  ];
  for (const { key, label } of platforms) {
    const re = new RegExp(`##\\s*${label}\\s*\\n([\\s\\S]*?)(?=\\n##\\s*(?:Instagram|Facebook|LinkedIn)|$)`, 'i');
    const m = text.match(re);
    if (m && m[1].trim().length > 10) {
      posts.push({ platform: key, content: m[1].trim() });
    }
  }
  return posts;
}

function renderInline(str: string, base: string): React.ReactNode[] {
  const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    const k = `${base}-${i}`;
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={k} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={k} className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-violet-300">{p.slice(1, -1)}</code>;
    if (p.startsWith('*') && p.endsWith('*'))
      return <em key={k} className="italic text-gray-200">{p.slice(1, -1)}</em>;
    return <span key={k}>{p}</span>;
  });
}

function MarkdownOutput({ text, light }: { text: string; light?: boolean }) {
  const textCls = light ? 'text-gray-700 dark:text-gray-200' : 'text-gray-300';
  const h1Cls = light ? 'text-gray-900 dark:text-white' : 'text-white';
  const lines = text.split('\n');
  const els: React.ReactNode[] = [];
  let k = 0;
  let inCode = false;
  let codeLines: string[] = [];
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const key = String(k++);

    if (line.startsWith('```')) {
      if (!inCode) { inCode = true; codeLang = line.slice(3).trim(); codeLines = []; continue; }
      else {
        inCode = false;
        els.push(
          <div key={key} className="rounded-xl overflow-hidden my-3 border border-white/10">
            {codeLang && <div className="bg-white/5 px-3 py-1.5 text-xs text-gray-500 font-mono border-b border-white/10">{codeLang}</div>}
            <pre className="bg-gray-900 p-4 overflow-x-auto text-sm font-mono text-gray-200 leading-relaxed">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        continue;
      }
    }
    if (inCode) { codeLines.push(line); continue; }

    if (line.startsWith('# ')) els.push(<h1 key={key} className={`text-xl font-bold ${h1Cls} mt-5 mb-2 first:mt-0`}>{renderInline(line.slice(2), key)}</h1>);
    else if (line.startsWith('## ')) els.push(<h2 key={key} className={`text-base font-bold ${h1Cls} mt-4 mb-1.5 pb-1.5 border-b border-white/10`}>{renderInline(line.slice(3), key)}</h2>);
    else if (line.startsWith('### ')) els.push(<h3 key={key} className={`text-sm font-semibold ${h1Cls} mt-3 mb-1`}>{renderInline(line.slice(4), key)}</h3>);
    else if (line.startsWith('- ') || line.startsWith('* ')) els.push(<div key={key} className={`flex gap-2 ${textCls} py-0.5 text-sm`}><span className="text-violet-400 mt-1 shrink-0 select-none">•</span><span>{renderInline(line.slice(2), key)}</span></div>);
    else if (/^\d+\.\s/.test(line)) { const n = line.match(/^(\d+)\./)?.[1]; els.push(<div key={key} className={`flex gap-2 ${textCls} py-0.5 text-sm`}><span className="text-violet-400 shrink-0 font-mono w-5 text-right">{n}.</span><span>{renderInline(line.replace(/^\d+\.\s/, ''), key)}</span></div>); }
    else if (line.match(/^---+$/)) els.push(<hr key={key} className="border-white/10 my-3" />);
    else if (line.trim() === '') els.push(<div key={key} className="h-2" />);
    else els.push(<p key={key} className={`${textCls} leading-relaxed text-sm`}>{renderInline(line, key)}</p>);
  }
  return <>{els}</>;
}

function SocialPostCard({ post }: { post: SocialPost }) {
  const [copied, setCopied] = useState(false);
  const cfg = {
    instagram: { label: 'Instagram', icon: '📸', gradient: 'from-pink-500 to-fuchsia-600' },
    facebook: { label: 'Facebook', icon: '📘', gradient: 'from-blue-500 to-blue-700' },
    linkedin: { label: 'LinkedIn', icon: '💼', gradient: 'from-sky-600 to-blue-700' },
  }[post.platform];

  const copy = () => { navigator.clipboard.writeText(post.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden mb-4 shadow-sm">
      <div className={`bg-gradient-to-r ${cfg.gradient} px-4 py-2.5 flex items-center justify-between`}>
        <span className="text-white text-sm font-semibold flex items-center gap-2">{cfg.icon} {cfg.label}</span>
        <button onClick={copy} className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap bg-white dark:bg-gray-900 leading-relaxed">
        {post.content}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [openPanel, setOpenPanel] = useState<null | 'inbox' | 'calendar' | 'metrics' | 'comments'>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
  const [selectedId, setSelectedId] = useState<AgentId>('strategy-advisor');
  const [mobileShowSidebar, setMobileShowSidebar] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [resultTab, setResultTab] = useState<'result' | 'log'>('result');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [strategyModel, setStrategyModel] = useState('claude-sonnet-4-6');
  const [strategyHistory, setStrategyHistory] = useState<ChatMessage[]>([]);
  const [strategyMemory, setStrategyMemory] = useState('');
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [socialHistory, setSocialHistory] = useState<ChatMessage[]>([]);
  const [socialInstructions, setSocialInstructions] = useState('');
  const [showSocialInstructions, setShowSocialInstructions] = useState(false);
  const [attachedImages, setAttachedImages] = useState<{ dataUrl: string; base64: string; mimeType: string }[]>([]);
  const [requestsLeft, setRequestsLeft] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const accRef = useRef('');
  const strategyResponseRef = useRef('');
  const socialResponseRef = useRef('');

  useEffect(() => {
    setMounted(true);
    try {
      const h = localStorage.getItem('demo_strategy_history');
      if (h) setStrategyHistory(JSON.parse(h).slice(-8));
      const m = localStorage.getItem('demo_strategy_memory');
      if (m) setStrategyMemory(m);
      const sh = localStorage.getItem('demo_social_history');
      if (sh) setSocialHistory(JSON.parse(sh).slice(-8));
      const si = localStorage.getItem('demo_social_instructions');
      if (si) setSocialInstructions(si);
    } catch {}
  }, []);

  useEffect(() => { if (mounted) localStorage.setItem('demo_strategy_history', JSON.stringify(strategyHistory)); }, [strategyHistory, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem('demo_strategy_memory', strategyMemory); }, [strategyMemory, mounted]);
  useEffect(() => { if (mounted) { try { localStorage.setItem('demo_social_history', JSON.stringify(socialHistory)); } catch {} } }, [socialHistory, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem('demo_social_instructions', socialInstructions); }, [socialInstructions, mounted]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') =>
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString('en-GB'), message, type }]);

  const compressImage = (file: File): Promise<{ dataUrl: string; base64: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.onload = (ev) => {
        const raw = ev.target?.result as string;
        if (!raw) { reject(new Error('No data')); return; }
        const img = new window.Image();
        img.onerror = () => resolve({ dataUrl: raw, base64: raw.split(',')[1], mimeType: file.type || 'image/jpeg' });
        img.onload = () => {
          const MAX = 1200;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve({ dataUrl: raw, base64: raw.split(',')[1], mimeType: file.type }); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({ dataUrl, base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
        };
        img.src = raw;
      };
      reader.readAsDataURL(file);
    });

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.slice(0, 4).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      compressImage(file).then(img => setAttachedImages(prev => [...prev, img])).catch(() => {});
    });
    e.target.value = '';
  };

  const runAgent = useCallback(async (overridePrompt?: string) => {
    const agent = AGENTS.find(a => a.id === selectedId)!;
    const finalPrompt = overridePrompt ?? prompt.trim();
    if (!finalPrompt || isStreaming) return;

    setIsStreaming(true);
    setAgentStatuses(p => ({ ...p, [selectedId]: 'running' }));
    setAiOutput('');
    setError('');
    accRef.current = '';
    if (selectedId === 'strategy-advisor') strategyResponseRef.current = '';
    if (selectedId === 'social-content') socialResponseRef.current = '';
    addLog(`▶ Starting agent: ${agent.name}…`, 'agent');
    setResultTab('result');

    const finalInput = selectedId === 'social-content' && socialInstructions.trim()
      ? `PERMANENT INSTRUCTIONS (apply always):\n${socialInstructions.trim()}\n\n---\n\n${finalPrompt}`
      : finalPrompt;

    const history = selectedId === 'strategy-advisor'
      ? strategyHistory.slice(-6).map(m => ({ role: m.role, content: m.content.slice(0, 3000) }))
      : selectedId === 'social-content'
        ? socialHistory.slice(-6).map(m => ({ role: m.role, content: m.content.slice(0, 3000) }))
        : [];

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedId,
          prompt: finalInput,
          model: selectedId === 'strategy-advisor' ? strategyModel : undefined,
          history,
          imagesBase64: attachedImages.map(i => ({ base64: i.base64, mimeType: i.mimeType })),
        }),
      });

      setAttachedImages([]);

      const remaining = res.headers.get('X-RateLimit-Remaining');
      if (remaining !== null) setRequestsLeft(parseInt(remaining));

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        setError(data.error ?? 'Something went wrong');
        setAgentStatuses(p => ({ ...p, [selectedId]: 'error' }));
        addLog(`✗ Error: ${data.error}`, 'error');
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accRef.current += decoder.decode(value, { stream: true });
        setAiOutput(accRef.current);
        if (selectedId === 'strategy-advisor') strategyResponseRef.current = accRef.current;
        if (selectedId === 'social-content') socialResponseRef.current = accRef.current;
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }

      setAgentStatuses(p => ({ ...p, [selectedId]: 'completed' }));
      addLog(`✓ ${agent.name} completed.`, 'success');

      if (selectedId === 'strategy-advisor' && strategyResponseRef.current) {
        setStrategyHistory(prev => [...prev, { role: 'user', content: finalPrompt }, { role: 'assistant', content: strategyResponseRef.current }]);
        setAiOutput('');
      }
      if (selectedId === 'social-content' && socialResponseRef.current) {
        setSocialHistory(prev => [...prev, { role: 'user', content: finalPrompt }, { role: 'assistant', content: socialResponseRef.current }]);
      }
    } catch {
      setError('Connection error. Please try again.');
      setAgentStatuses(p => ({ ...p, [selectedId]: 'error' }));
      addLog('✗ Connection error.', 'error');
    } finally {
      setIsStreaming(false);
      setPrompt('');
    }
  }, [selectedId, prompt, isStreaming, strategyModel, strategyHistory, socialHistory, socialInstructions, attachedImages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runAgent();
  };

  const stopAgent = () => {
    setIsStreaming(false);
    setAgentStatuses(p => ({ ...p, [selectedId]: 'idle' }));
    addLog('■ Agent stopped.', 'info');
  };

  const resetAgent = () => {
    setAgentStatuses(p => ({ ...p, [selectedId]: 'idle' }));
    setAiOutput('');
  };

  const selectAgent = (id: AgentId) => {
    setSelectedId(id);
    setMobileShowSidebar(false);
    setAiOutput('');
    setError('');
    setPrompt('');
  };

  if (!mounted) return null;

  const agent = AGENTS.find(a => a.id === selectedId)!;
  const agentRequiresSetup = !!(agent as {requiresSetup?: boolean}).requiresSetup;
  const status: AgentStatus = agentStatuses[selectedId] ?? 'idle';
  const statusCfg = STATUS[status];
  const isRunning = status === 'running';
  const socialPosts = selectedId === 'social-content' ? parseSocialPosts(aiOutput) : [];

  const needsSetupAgents = AGENTS.filter(a => (a as {requiresSetup?: boolean}).requiresSetup);
  const activeAgents = AGENTS.filter(a => !(a as {requiresSetup?: boolean}).requiresSetup);
  const stats = {
    total: AGENTS.length,
    ready: activeAgents.filter(a => (agentStatuses[a.id] ?? 'idle') === 'idle').length,
    running: Object.values(agentStatuses).filter(s => s === 'running').length,
    completed: Object.values(agentStatuses).filter(s => s === 'completed').length,
    setupRequired: needsSetupAgents.length,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">

      {/* ── Demo banner ── */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 px-4 py-1.5 flex items-center justify-center gap-2 shrink-0">
        <span className="text-[10px] font-semibold tracking-widest text-amber-700 dark:text-amber-400 uppercase">Interactive Demo</span>
        <span className="text-amber-400 dark:text-amber-600 text-[10px]">·</span>
        <span className="text-[11px] text-amber-600 dark:text-amber-500">Respostas simuladas — sem chamadas reais à API</span>
      </div>

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">AI Agents</h1>
              <p className="text-violet-200 text-xs mt-0.5">
                by <a href="https://codeaistudio.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Code AI Studio</a>
                <span className="mx-1.5 opacity-40">·</span>
                built by <a href="https://alexandrahockett.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Alexandra Hockett</a>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              System Online
            </div>
            {([
              { label: 'Inbox', key: 'inbox', Icon: Mail },
              { label: 'Calendar', key: 'calendar', Icon: Calendar },
              { label: 'Metrics', key: 'metrics', Icon: BarChart2 },
              { label: 'Comments', key: 'comments', Icon: MessageSquare },
            ] as const).map(({ label, key, Icon }) => (
              <button key={key}
                onClick={() => setOpenPanel(p => p === key ? null : key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${openPanel === key ? 'bg-white text-violet-700 font-semibold' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
            <button
              onClick={() => { setLogs([]); localStorage.removeItem('demo_strategy_history'); localStorage.removeItem('demo_social_history'); }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Clear Logs
            </button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Total', value: stats.total, Icon: Bot, color: 'text-violet-200' },
            { label: 'Ready', value: stats.ready, Icon: CheckCircle, color: 'text-green-300' },
            { label: 'Running', value: stats.running, Icon: Activity, color: 'text-blue-300' },
            { label: 'Completed', value: stats.completed, Icon: Star, color: 'text-yellow-300' },
            { label: 'Need setup', value: stats.setupRequired, Icon: Settings, color: 'text-orange-300' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <s.Icon className={`w-4 h-4 shrink-0 ${s.color}`} />
              <div>
                <div className="text-base font-bold text-white leading-none">{s.value}</div>
                <div className="text-[10px] text-violet-200 mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <div className={`${mobileShowSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-72 shrink-0 border-r border-gray-200 dark:border-gray-800 flex-col overflow-hidden bg-white dark:bg-gray-900`}>

          {/* Boss agent */}
          {(() => {
            const boss = AGENTS.find(a => a.id === 'strategy-advisor')!;
            const bossStatus = agentStatuses['strategy-advisor'] ?? 'idle';
            const bCfg = STATUS[bossStatus];
            const isSelected = selectedId === 'strategy-advisor';
            return (
              <div className="p-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <button
                  onClick={() => selectAgent('strategy-advisor')}
                  className={`w-full text-left rounded-2xl p-3 transition-all ${isSelected
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-200 dark:shadow-violet-900/40'
                    : 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-900/30 dark:hover:to-purple-900/30'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : 'bg-violet-100 dark:bg-violet-800/40'}`}>
                      <MessageSquare className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-violet-600 dark:text-violet-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-violet-800 dark:text-violet-300'}`}>{boss.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-violet-200 dark:bg-violet-700 text-violet-700 dark:text-violet-200'}`}>BOSS</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-violet-100' : 'text-gray-500 dark:text-gray-400'}`}>Strategy & Business Plans</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${bCfg.dot}`} />
                        <span className={`text-[10px] ${isSelected ? 'text-violet-200' : bCfg.color}`}>{bCfg.label}</span>
                        {strategyHistory.length > 0 && <span className={`text-[10px] ml-1 ${isSelected ? 'text-violet-200' : 'text-gray-400'}`}>· {Math.floor(strategyHistory.length / 2)} turns</span>}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })()}

          {/* Other agents */}
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
            {AGENTS.filter(a => a.id !== 'strategy-advisor').map(a => {
              const isSetup = !!(a as {requiresSetup?: boolean}).requiresSetup;
              const s: AgentStatus = isSetup ? 'setup_required' : (agentStatuses[a.id] ?? 'idle');
              const sCfg = STATUS[s];
              const isSelected = selectedId === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => selectAgent(a.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isSelected
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-violet-200 dark:bg-violet-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <a.Icon className={`w-4 h-4 ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-gray-500 dark:text-gray-400'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium truncate">{a.name}</p>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sCfg.dot}`} />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                      {a.capabilities.slice(0, 2).join(' · ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Panel ── */}
        <div className={`${mobileShowSidebar ? 'hidden' : 'flex'} md:flex flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-gray-950`}>

          {/* Agent header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setMobileShowSidebar(true)} className="md:hidden w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0`}>
                  <agent.Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{agent.name}</h2>
                    {selectedId === 'strategy-advisor' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">BOSS</span>
                    )}
                    {agentRequiresSetup && (
                      <span className="flex items-center gap-1 text-xs text-orange-500 cursor-pointer hover:text-orange-600 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Configurar
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      <span className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.description}</p>
                  <div className="hidden md:flex flex-wrap gap-1 mt-1.5">
                    {agent.capabilities.map(cap => (
                      <span key={cap} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{cap}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Connect button — setup required agents */}
                {agentRequiresSetup && (
                  <button className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Settings className="w-4 h-4" />
                    {'setupLabel' in agent ? (agent.setupLabel as string).replace('Connect', 'Ligar') : 'Ligar'}
                  </button>
                )}

                {/* Model selector — strategy-advisor only */}
                {selectedId === 'strategy-advisor' && (
                  <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    {[{ id: 'claude-opus-4-8', label: 'Opus' }, { id: 'claude-sonnet-4-6', label: 'Sonnet' }, { id: 'claude-haiku-4-5-20251001', label: 'Haiku' }].map(m => (
                      <button key={m.id} onClick={() => setStrategyModel(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${strategyModel === m.id ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Permanent instructions — social-content */}
                {selectedId === 'social-content' && (
                  <button onClick={() => setShowSocialInstructions(v => !v)}
                    className={`hidden md:flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-colors ${socialInstructions ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <Network className="w-3.5 h-3.5" />
                    Instructions{socialInstructions ? ' (on)' : ''}
                  </button>
                )}

                {/* Memory — strategy-advisor */}
                {selectedId === 'strategy-advisor' && (
                  <button onClick={() => setShowMemoryPanel(v => !v)}
                    className={`hidden md:flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-colors ${strategyMemory ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <Network className="w-3.5 h-3.5" />
                    Memory{strategyMemory ? ' (on)' : ''}
                  </button>
                )}

                {/* New conversation */}
                {(selectedId === 'strategy-advisor' || selectedId === 'social-content') && (
                  <button
                    onClick={() => {
                      if (selectedId === 'strategy-advisor') { setStrategyHistory([]); setAiOutput(''); localStorage.removeItem('demo_strategy_history'); }
                      else { setSocialHistory([]); setAiOutput(''); localStorage.removeItem('demo_social_history'); }
                    }}
                    className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 px-3 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                    <PlusCircle className="w-3.5 h-3.5" />
                    New chat
                  </button>
                )}

                {/* Action buttons */}
                {isRunning ? (
                  <button onClick={stopAgent} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Square className="w-4 h-4" />Stop
                  </button>
                ) : (status === 'completed' || status === 'error') ? (
                  <button onClick={resetAgent} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-xl text-sm transition-colors">
                    <RefreshCw className="w-4 h-4" />Reset
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Sub-panels */}
          {selectedId === 'social-content' && showSocialInstructions && (
            <div className="px-6 py-3 border-b border-violet-100 dark:border-violet-900/30 bg-violet-50/50 dark:bg-violet-900/10 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Permanent Instructions</span>
                  <span className="text-[10px] text-violet-500">— included in every request</span>
                </div>
                <button onClick={() => { setSocialInstructions(''); localStorage.removeItem('demo_social_instructions'); }} className="text-[10px] text-red-400 hover:text-red-600">Clear</button>
              </div>
              <textarea value={socialInstructions} onChange={e => setSocialInstructions(e.target.value)} rows={3}
                placeholder="e.g. Always alternate between English and Portuguese. Focus: AI avatar feature launch. Tone: inspiring and direct."
                className="w-full text-xs bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-800/40 rounded-xl p-3 text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-violet-400" />
            </div>
          )}

          {selectedId === 'strategy-advisor' && showMemoryPanel && (
            <div className="px-6 py-3 border-b border-violet-100 dark:border-violet-900/30 bg-violet-50/50 dark:bg-violet-900/10 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Conversation Memory</span>
                  <span className="text-[10px] text-violet-500">— persists across sessions</span>
                </div>
                <button onClick={() => { setStrategyMemory(''); localStorage.removeItem('demo_strategy_memory'); }} className="text-[10px] text-red-400 hover:text-red-600">Clear</button>
              </div>
              {strategyMemory ? (
                <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-24 overflow-y-auto bg-white dark:bg-gray-900 rounded-xl p-3 border border-violet-100 dark:border-violet-800/30">{strategyMemory}</div>
              ) : (
                <p className="text-xs text-gray-400 italic">No memory yet. Start a conversation and key context will be saved here.</p>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center justify-between px-6 pt-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <div className="flex">
              {([['result', 'Result'], ['log', 'Log']] as const).map(([tab, label]) => (
                <button key={tab} onClick={() => setResultTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${resultTab === tab ? 'text-violet-600 dark:text-violet-400 border-violet-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'}`}>
                  {tab === 'result' ? <FileText className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
                  {label}
                  {tab === 'log' && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-full">{logs.length}</span>}
                  {tab === 'result' && aiOutput && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
                </button>
              ))}
            </div>
            <button onClick={() => { setLogs([]); setAiOutput(''); setStrategyHistory([]); setSocialHistory([]); }} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              Clear
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">

            {/* Log tab */}
            {resultTab === 'log' && (
              <div className="bg-gray-950 p-5 min-h-full font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-600 text-center mt-16 flex flex-col items-center gap-2">
                    <Terminal className="w-8 h-8 opacity-30" />
                    <p>Run an agent to see the log here</p>
                  </div>
                ) : logs.map((log, i) => (
                  <div key={i} className={`flex gap-2 mb-1 ${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'agent' ? 'text-violet-400' : 'text-gray-400'}`}>
                    <span className="text-gray-600 shrink-0">[{log.time}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}

            {/* Result tab */}
            {resultTab === 'result' && (
              <div className="p-6">
                {/* ── Strategy Advisor chat ── */}
                {selectedId === 'strategy-advisor' && (
                  <>
                    {strategyHistory.length === 0 && !isStreaming ? (
                      <AgentIntroCard agent={agent} onSuggestion={p => { setPrompt(p); }} />
                    ) : (
                      <div className="max-w-3xl mx-auto space-y-1">
                        {strategyHistory.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'gap-3'} mb-4`}>
                            {msg.role === 'assistant' && (
                              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                              ? 'bg-violet-600 text-white rounded-tr-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-sm border border-gray-200 dark:border-gray-700'
                            }`}>
                              {msg.role === 'user' ? msg.content : <MarkdownOutput text={msg.content} light />}
                            </div>
                          </div>
                        ))}
                        {isStreaming && (
                          <div className="flex gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                              <MarkdownOutput text={aiOutput} light />
                              <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse" />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </>
                )}

                {/* ── Social Content ── */}
                {selectedId === 'social-content' && (
                  <>
                    {socialHistory.length === 0 && !aiOutput && !isStreaming ? (
                      <AgentIntroCard agent={agent} onSuggestion={p => setPrompt(p)} />
                    ) : (
                      <div className="max-w-3xl mx-auto">
                        {socialHistory.map((msg, i) => (
                          <div key={i}>
                            {msg.role === 'user' ? (
                              <div className="flex justify-end mb-3">
                                <div className="bg-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%]">{msg.content}</div>
                              </div>
                            ) : (
                              <div className="mb-6">
                                {parseSocialPosts(msg.content).length > 0
                                  ? parseSocialPosts(msg.content).map((post, j) => <SocialPostCard key={j} post={post} />)
                                  : <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"><MarkdownOutput text={msg.content} light /></div>
                                }
                              </div>
                            )}
                          </div>
                        ))}
                        {(aiOutput || isStreaming) && (
                          <div className="mb-4">
                            {socialPosts.length > 0
                              ? socialPosts.map((post, i) => <SocialPostCard key={i} post={post} />)
                              : <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                                  <MarkdownOutput text={aiOutput} light />
                                  {isStreaming && <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse" />}
                                </div>
                            }
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </>
                )}

                {/* ── Other agents ── */}
                {selectedId !== 'strategy-advisor' && selectedId !== 'social-content' && (
                  <div className="max-w-3xl mx-auto">
                    {!aiOutput && !isStreaming ? (
                      <AgentIntroCard agent={agent} onSuggestion={p => setPrompt(p)} />
                    ) : (
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Output</span>
                            {isStreaming && <span className="flex items-center gap-1.5 text-xs text-violet-500"><span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />Generating</span>}
                          </div>
                          {aiOutput && !isStreaming && (
                            <button onClick={() => { navigator.clipboard.writeText(aiOutput); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1 rounded-lg transition-all">
                              {copied ? '✓ Copied' : 'Copy'}
                            </button>
                          )}
                        </div>
                        <MarkdownOutput text={aiOutput} light />
                        {isStreaming && <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse" />}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="max-w-3xl mx-auto mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Input panel ── */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shrink-0">
            {true && (
              <>
                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {agent.suggestions.map((s, i) => (
                    <button key={i} onClick={() => setPrompt(s.prompt)}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                      <Zap className="w-2.5 h-2.5 shrink-0" />
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Attached images */}
                {attachedImages.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {attachedImages.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img.dataUrl} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                        <button onClick={() => setAttachedImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 items-end">
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedId === 'strategy-advisor' ? 'Ask anything about your product, strategy, or growth…' : selectedId === 'social-content' ? 'What content do you want to create? Describe the topic, angle, or product…' : agentRequiresSetup ? 'Ask me what I can do, how I work, or what I would produce…' : 'Enter your request…'}
                    rows={3}
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none transition-colors"
                  />
                  <div className="flex flex-col gap-2 shrink-0">
                    {isRunning ? (
                      <button onClick={stopAgent} className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors">
                        <Square className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => runAgent()} disabled={!prompt.trim() || isStreaming}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Attach buttons row — matches admin */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <label className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Image
                      <input type="file" accept="image/*" multiple onChange={handleImageAttach} className="hidden" />
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors" title="Video attachment not available in demo">
                      <Video className="w-3.5 h-3.5" />
                      Video
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors" title="Document attachment not available in demo">
                      <Upload className="w-3.5 h-3.5" />
                      Document
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">⌘ + Enter to run</span>
                    <span className="text-xs text-gray-400">{prompt.length}/4000</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Side Panels ── */}
      {openPanel && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpenPanel(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-700 overflow-hidden">

            {/* Panel header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {openPanel === 'inbox' && <><Mail className="w-4 h-4 text-violet-500" /><span className="font-semibold text-gray-900 dark:text-white text-sm">Inbox</span></>}
                {openPanel === 'calendar' && <><Calendar className="w-4 h-4 text-violet-500" /><span className="font-semibold text-gray-900 dark:text-white text-sm">Social Calendar</span></>}
                {openPanel === 'metrics' && <><BarChart2 className="w-4 h-4 text-violet-500" /><span className="font-semibold text-gray-900 dark:text-white text-sm">Social Metrics</span></>}
                {openPanel === 'comments' && <><MessageSquare className="w-4 h-4 text-violet-500" /><span className="font-semibold text-gray-900 dark:text-white text-sm">Comments</span></>}
              </div>
              <button onClick={() => setOpenPanel(null)} className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">

              {/* ── INBOX ── */}
              {openPanel === 'inbox' && (
                <>
                  {[
                    { from: 'sarah.m@gmail.com', name: 'Sarah M.', subject: 'Image generation not working', preview: "Hi, I've been trying to generate an image for the last hour and it keeps timing out. Can you help?", time: '2h ago', urgency: 'urgent', avatar: 'S' },
                    { from: 'content@agency.pt', name: 'Digital Agency PT', subject: 'Partnership proposal', preview: 'Hello, we represent several Portuguese content creators and would love to discuss a partnership...', time: '1 day ago', urgency: 'review', avatar: 'D' },
                    { from: 'jpacricket@gmail.com', name: 'João P.', subject: 'Avatar creator feedback', preview: "Tried the avatar feature today — really impressive! A few thoughts: the portrait mode works great but landscape...", time: '2 days ago', urgency: 'review', avatar: 'J' },
                    { from: 'freelancer@outlook.com', name: 'Ana Rodrigues', subject: 'Question about pricing', preview: 'Hi there! I was wondering if you offer any discounts for freelancers or early adopters?', time: '3 days ago', urgency: 'general', avatar: 'A' },
                    { from: 'google@startup.google.com', name: 'Google for Startups', subject: 'Application status update', preview: 'Thank you for applying to the Google for Startups Cloud Program. Your application is under review...', time: '4 days ago', urgency: 'urgent', avatar: 'G' },
                  ].map((email, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 transition-colors cursor-pointer bg-white dark:bg-gray-800">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{email.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{email.name}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-gray-400">{email.time}</span>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${email.urgency === 'urgent' ? 'bg-red-400' : email.urgency === 'review' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                            </div>
                          </div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mt-0.5 truncate">{email.subject}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{email.preview}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-center text-gray-400 pt-2">Example data — in production this reads from a live Gmail inbox</p>
                </>
              )}

              {/* ── CALENDAR ── */}
              {openPanel === 'calendar' && (
                <>
                  {[
                    { date: 'Jun 3', time: '10:00', platform: 'instagram', caption: '✨ What if your brand had a face — exactly how you imagined it? Meet our AI Avatar Creator.', hashtags: '#AIAvatar #ContentCreator', status: 'scheduled', statusColor: 'bg-blue-400' },
                    { date: 'Jun 3', time: '18:10', platform: 'instagram', caption: '💬 First comment: "Drop a 🎨 if you want to try it for free!"', hashtags: '', status: 'scheduled', statusColor: 'bg-blue-400' },
                    { date: 'Jun 4', time: '14:00', platform: 'facebook', caption: 'Most content creators spend hours sourcing images for their brand. We built a tool that generates them in seconds...', hashtags: '#AI #ContentCreation', status: 'approved', statusColor: 'bg-green-400' },
                    { date: 'Jun 5', time: '09:00', platform: 'linkedin', caption: 'AI is changing how solo founders create content at scale. Here\'s what I\'ve built and what I\'ve learned in 6 months...', hashtags: '', status: 'draft', statusColor: 'bg-gray-400' },
                    { date: 'Jun 6', time: '11:00', platform: 'instagram', caption: 'Behind the scenes: building an AI SaaS as a solo founder in Portugal 🇵🇹', hashtags: '#Founder #StartupLife #AI', status: 'draft', statusColor: 'bg-gray-400' },
                  ].map((post, i) => {
                    const platformColor = post.platform === 'instagram' ? 'from-pink-500 to-fuchsia-600' : post.platform === 'facebook' ? 'from-blue-500 to-blue-700' : 'from-sky-600 to-blue-700';
                    const platformLabel = post.platform === 'instagram' ? '📸 Instagram' : post.platform === 'facebook' ? '📘 Facebook' : '💼 LinkedIn';
                    return (
                      <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                        <div className={`bg-gradient-to-r ${platformColor} px-3 py-2 flex items-center justify-between`}>
                          <span className="text-white text-xs font-medium">{platformLabel}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white/80 text-xs">{post.date} · {post.time}</span>
                            <div className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${post.statusColor}`} />
                              <span className="text-white/80 text-[10px] capitalize">{post.status}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 p-3 leading-relaxed line-clamp-3">{post.caption}</p>
                        {post.hashtags && <p className="text-[10px] text-violet-500 dark:text-violet-400 px-3 pb-3">{post.hashtags}</p>}
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-center text-gray-400 pt-2">Example data — in production this reads from the scheduled posts database</p>
                </>
              )}

              {/* ── METRICS ── */}
              {openPanel === 'metrics' && (
                <>
                  {[
                    {
                      platform: 'Instagram', icon: '📸', color: 'from-pink-500 to-fuchsia-600',
                      stats: [
                        { label: 'Followers', value: '1,247', delta: '+23 this week', up: true },
                        { label: 'Avg. Engagement', value: '4.2%', delta: '+0.8% vs last week', up: true },
                        { label: 'Reach (7d)', value: '12,400', delta: '−3% vs last week', up: false },
                        { label: 'Impressions (7d)', value: '31,200', delta: '+12% vs last week', up: true },
                      ],
                      best: 'Avatar creator demo reel: 847 reach, 6.1% engagement',
                    },
                    {
                      platform: 'Facebook', icon: '📘', color: 'from-blue-500 to-blue-700',
                      stats: [
                        { label: 'Followers', value: '892', delta: '+12 this week', up: true },
                        { label: 'Avg. Engagement', value: '2.1%', delta: '−0.2% vs last week', up: false },
                        { label: 'Reach (7d)', value: '4,300', delta: '+7% vs last week', up: true },
                        { label: 'Clicks', value: '142', delta: '+34% vs last week', up: true },
                      ],
                      best: 'Image Studio comparison post: 892 reach, 38 clicks',
                    },
                    {
                      platform: 'LinkedIn', icon: '💼', color: 'from-sky-600 to-blue-700',
                      stats: [
                        { label: 'Connections', value: '456', delta: '+34 this week', up: true },
                        { label: 'Impressions (7d)', value: '3,200', delta: '+18% vs last week', up: true },
                        { label: 'Clicks', value: '87', delta: '+42% vs last week', up: true },
                        { label: 'Engagement', value: '3.8%', delta: 'stable', up: true },
                      ],
                      best: 'Founder story post: 1,400 impressions, 52 reactions',
                    },
                  ].map((platform, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                      <div className={`bg-gradient-to-r ${platform.color} px-4 py-2.5 flex items-center gap-2`}>
                        <span className="text-white text-sm font-semibold">{platform.icon} {platform.platform}</span>
                      </div>
                      <div className="p-3 grid grid-cols-2 gap-2">
                        {platform.stats.map(stat => (
                          <div key={stat.label} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{stat.value}</p>
                            <p className={`text-[10px] mt-0.5 ${stat.up ? 'text-green-500' : 'text-red-400'}`}>{stat.delta}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-3 pb-3">
                        <p className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2.5 py-1.5">🏆 Best post: {platform.best}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-center text-gray-400 pt-2">Example data — in production this reads from the Meta Graph API + LinkedIn API</p>
                </>
              )}

              {/* ── COMMENTS ── */}
              {openPanel === 'comments' && (
                <>
                  {[
                    { platform: 'instagram', post: 'Avatar Creator demo reel', author: '@creator_pt_official', avatar: 'C', text: 'This is amazing! How much does it cost? Asking for my team 👀', time: '3h ago', likes: 4, replied: false },
                    { platform: 'instagram', post: 'Avatar Creator demo reel', author: '@digital_maker_pt', avatar: 'D', text: 'Can I use this for my personal brand too or is it only for companies?', time: '5h ago', likes: 1, replied: false },
                    { platform: 'instagram', post: 'Image Studio comparison', author: '@aitools_fan', avatar: 'A', text: 'Better than Midjourney for portraits honestly 🔥 great find', time: '1 day ago', likes: 12, replied: true },
                    { platform: 'facebook', post: 'Behind the scenes post', author: 'João Santos', avatar: 'J', text: 'Really impressive what you\'ve built alone! How long did this take to build?', time: '1 day ago', likes: 6, replied: false },
                    { platform: 'facebook', post: 'Behind the scenes post', author: 'Maria Costa', avatar: 'M', text: 'Following your journey since day 1. Keep going! 💪', time: '2 days ago', likes: 8, replied: true },
                    { platform: 'linkedin', post: 'Founder story post', author: 'Pedro Ferreira · Designer', avatar: 'P', text: 'The attention to detail in the avatar creator is impressive. Happy to connect and share feedback if useful.', time: '2 days ago', likes: 14, replied: false },
                  ].map((comment, i) => {
                    const platformIcon = comment.platform === 'instagram' ? '📸' : comment.platform === 'facebook' ? '📘' : '💼';
                    return (
                      <div key={i} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{comment.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">{comment.author}</span>
                              <span className="text-[10px] text-gray-400 shrink-0">{comment.time}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">{platformIcon} on "{comment.post}"</p>
                            <p className="text-xs text-gray-700 dark:text-gray-200 mt-1.5 leading-relaxed">{comment.text}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] text-gray-400">❤️ {comment.likes}</span>
                              <button className="text-[10px] text-violet-500 hover:text-violet-700 font-medium">Reply</button>
                              {comment.replied && <span className="text-[10px] text-green-500 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Replied</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-center text-gray-400 pt-2">Example data — in production this reads from the Meta Graph API</p>
                </>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Agent Intro Card ─────────────────────────────────────────────────────────

function AgentIntroCard({ agent, onSuggestion }: { agent: typeof AGENTS[number]; onSuggestion: (p: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-2xl bg-gradient-to-br ${agent.gradient} p-px mb-5`}>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0`}>
              <agent.Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{agent.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {agent.capabilities.map(cap => (
              <span key={cap} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{cap}</span>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Quick starts:</p>
            {agent.suggestions.map((s, i) => (
              <button key={i} onClick={() => onSuggestion(s.prompt)}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all group">
                <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0 group-hover:text-violet-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-violet-700 dark:group-hover:text-violet-300">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-center text-gray-400">Type your message below or click a quick start above · 15 requests/hour</p>
    </div>
  );
}
