'use client';
import { useEffect, useState } from 'react';
const NAME_KEY = 'shuige:name';
const TASK_KEY = 'tasks_v1';
const COUNT_KEY = 'countdown_v1';
function get(k: string) { if (typeof window === 'undefined') return null; try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch { return null; } }
function NavBar({ active }: { active: string }) {
  const items = [['home', '首页', '/'], ['money', '记账', '/money'], ['ai', 'AI助手', '/ai'], ['profile', '我的', '/profile']];
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: 'rgba(255,255,255,.97)', borderTop: '1px solid #E5ECDE', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
      {items.map(([k, label, href]) => { const on = active === k; return <a key={k} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 12, textDecoration: 'none', color: on ? '#5B8C5A' : '#9B8A80', fontWeight: on ? 700 : 500 }}><span style={{ fontSize: 22 }}>{k === 'home' ? '🏠' : k === 'money' ? '💰' : k === 'ai' ? '🤖' : '👤'}</span>{label}</a>; })}
    </nav>
  );
}
const DEFAULT_TASKS = [
  { id: 't1', title: '学习剪辑 · 一节课', done: false, cat: '学习' },
  { id: 't2', title: '学习英语口语', done: false, cat: '学习' },
  { id: 't3', title: '复盘', done: false, cat: '复盘' },
  { id: 't4', title: '记账', done: false, cat: '记账' },
];
export default function Profile() {
  const [name, setName] = useState('小鑫');
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [counts, setCounts] = useState<any[]>([]);
  const [quote, setQuote] = useState('把喜欢的事慢慢做完');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  useEffect(() => { const n = localStorage.getItem(NAME_KEY); if (n) setName(n); const t = get(TASK_KEY); if (t && t.length) setTasks(t); const c = get(COUNT_KEY); if (c && c.length) setCounts(c); }, []);
  useEffect(() => { fetch('https://v1.hitokoto.cn/').then(r => r.json()).then(d => { if (d.hitokoto) setQuote(d.hitokoto); }).catch(() => { }); }, []);
  const done = tasks.filter((t: any) => t.done).length;
  const total = tasks.length;
  const upcoming = counts.map((c: any) => ({ ...c, left: Math.ceil((new Date(c.date).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000) })).filter(c => c.left >= 0).sort((a, b) => a.left - b.left)[0];
  const entries = [
    ['💰', '记账', '/money'], ['🤖', 'AI助手', '/ai'], ['📔', '日记', '/diary'], ['⏳', '倒数日', '/countdown'], ['📊', '洞察', '/insights'],
  ];
  const save = () => { if (draft.trim()) { setName(draft.trim()); localStorage.setItem(NAME_KEY, draft.trim()); } setEditing(false); };
  return (
    <div style={{ minHeight: '100vh', padding: '16px 14px 80px', background: '#F4F7F0', color: '#3A4437', fontSize: 15 }}>
      <h1 style={{ fontSize: 21, fontWeight: 800 }}>我的</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #E5ECDE', borderRadius: 20, padding: 16, marginTop: 12 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(140deg,#EAF4EA,#F0FBF0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🦦</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#5B8C5A', background: '#EAF4EA', padding: '3px 10px', borderRadius: 13, display: 'inline-block', marginTop: 5 }}>🌱 探索与备考</div>
        </div>
        <button onPointerUp={() => { setEditing(true); setDraft(name); }} style={{ background: '#F4F7F0', border: '1px solid #E5ECDE', borderRadius: 11, padding: '6px 12px', fontSize: 13, color: '#3A4437' }}>改昵称</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 12, marginTop: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAF4EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 16, fontWeight: 800 }}>{done}/{total}</span></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#A99585' }}>今日任务</div>
          <div style={{ fontSize: 13, color: '#5B8C5A', fontStyle: 'italic', marginTop: 2 }}>「{quote}」</div>
        </div>
      </div>

      {upcoming && (
        <div style={{ background: '#EAF4EA', border: '1px solid #CBE3CC', borderRadius: 14, padding: 14, marginTop: 12, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 24, marginRight: 12 }}>⏳</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{upcoming.name}</div>
            <div style={{ fontSize: 12, color: '#5B8C5A', marginTop: 3 }}>还有 <b style={{ fontSize: 18 }}>{upcoming.left}</b> 天 · {upcoming.date}</div>
          </div>
          <a href="/countdown" style={{ color: '#5B8C5A', fontSize: 12, textDecoration: 'none' }}>查看›</a>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13, color: '#A99585', marginBottom: 8 }}>我的功能</div>
        {entries.map(([icon, label, href]) => (
          <a key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 13, marginTop: 8, fontSize: 14, color: '#3A4437', textDecoration: 'none' }}>
            <span style={{ fontSize: 18 }}>{icon}</span><span style={{ flex: 1 }}>{label}</span><span style={{ color: '#A99585' }}>›</span>
          </a>
        ))}
      </div>

      <div style={{ textAlign: 'center', color: '#A99585', fontSize: 11, marginTop: 18 }}>水哥清单 v1.0.0</div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(60,40,30,.4)', zIndex: 20, display: 'flex', alignItems: 'flex-end' }} onPointerUp={() => setEditing(false)}>
          <div style={{ background: '#FFFDF9', width: '100%', borderRadius: '24px 24px 0 0', padding: 22, paddingBottom: 40 }} onPointerUp={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>修改昵称</div>
            <input value={draft} onChange={e => setDraft(e.target.value)} maxLength={10} placeholder="输入新昵称" style={{ width: '100%', padding: 13, borderRadius: 14, border: '1.5px solid #E5ECDE', fontSize: 14, background: '#FFFDF9' }} />
            <button onPointerUp={save} style={{ marginTop: 16, width: '100%', height: 48, borderRadius: 24, border: 'none', background: '#5B8C5A', color: '#fff', fontSize: 16, fontWeight: 700 }}>保存</button>
          </div>
        </div>
      )}
      <NavBar active="profile" />
    </div>
  );
}