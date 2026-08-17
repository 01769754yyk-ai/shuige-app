'use client';
import { useEffect, useState } from 'react';
const STORE = 'diary_v1';
function NavBar() {
  const items = [['home', '首页', '/'], ['money', '记账', '/money'], ['ai', 'AI助手', '/ai'], ['profile', '我的', '/profile']];
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: 'rgba(255,255,255,.97)', borderTop: '1px solid #E5ECDE', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
      {items.map(([k, label, href]) => { const on = k === 'diary'; return <a key={k} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 12, textDecoration: 'none', color: on ? '#5B8C5A' : '#9B8A80', fontWeight: on ? 700 : 500 }}><span style={{ fontSize: 22 }}>{k === 'home' ? '🏠' : k === 'money' ? '💰' : k === 'ai' ? '🤖' : '👤'}</span>{label}</a>; })}
    </nav>
  );
}
export default function Diary() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('🙂');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => { try { const raw = localStorage.getItem(STORE); if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr) && arr.length) setEntries(arr); } } catch (e) { } setLoaded(true); }, []);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem(STORE, JSON.stringify(entries)); } catch (e) { } }, [entries, loaded]);

  const moods = ['😊', '🙂', '😐', '😢', '😡', '🤩'];
  const saveEntry = () => {
    if (!content.trim()) { alert('写点内容吧～'); return; }
    const now = new Date();
    const dateStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    if (editId) { setEntries(entries.map(e => e.id === editId ? { ...e, title, content, mood } : e)); }
    else setEntries([{ id: Date.now() + '', title, content, mood, date: dateStr, time: timeStr }, ...entries]);
    setTitle(''); setContent(''); setMood('🙂'); setEditId(null); setShowAdd(false);
  };
  const del = (id: any) => { if (confirm('删除这篇日记？')) setEntries(entries.filter(e => e.id !== id)); };
  const openEdit = (e: any) => { setEditId(e.id); setTitle(e.title); setContent(e.content); setMood(e.mood); setShowAdd(true); };
  const exportData = () => { const blob = new Blob([JSON.stringify({ diary: entries, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '我的日记备份.json'; a.click(); };

  return (
    <div style={{ minHeight: '100vh', padding: '16px 14px 80px', background: '#F4F7F0', color: '#3A4437', fontSize: 15 }}>
      <h1 style={{ fontSize: 21, fontWeight: 800 }}>日记</h1>
      <div style={{ fontSize: 12, color: '#8A9785', marginTop: 4 }}>把今天写下来，留给未来的自己</div>
      <button onPointerUp={() => { setEditId(null); setShowAdd(true); }} style={{ marginTop: 14, width: '100%', height: 48, borderRadius: 14, border: 'none', background: '#5B8C5A', color: '#fff', fontSize: 15, fontWeight: 700 }}>＋ 写日记</button>
      <button onPointerUp={exportData} style={{ marginTop: 8, width: '100%', height: 42, borderRadius: 14, border: '1.5px solid #5B8C5A', background: '#fff', color: '#5B8C5A', fontSize: 14, fontWeight: 700 }}>📤 导出备份</button>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, color: '#8A9785', marginBottom: 6 }}>我的日记（{entries.length}篇）</div>
        {entries.length ? entries.map(e => (
          <div key={e.id} style={{ background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 12, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 16, marginRight: 8 }}>{e.mood}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{e.title || '无标题'}</span>
              <button onPointerUp={() => setOpenId(openId === e.id ? null : e.id)} style={{ background: 'none', border: 'none', color: '#8A9785', fontSize: 12 }}>{openId === e.id ? '收起' : '展开'}</button>
            </div>
            <div style={{ fontSize: 11, color: '#8A9785', marginTop: 4 }}>{e.date} {e.time}</div>
            <div style={{ fontSize: 13, color: '#3A4437', marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{openId === e.id ? e.content : (e.content.length > 50 ? e.content.slice(0, 50) + '…' : e.content)}</div>
            {openId === e.id && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onPointerUp={() => openEdit(e)} style={{ flex: 1, padding: '7px', borderRadius: 10, border: '1px solid #5B8C5A', background: '#fff', color: '#5B8C5A', fontSize: 13 }}>编辑</button>
                <button onPointerUp={() => del(e.id)} style={{ flex: 1, padding: '7px', borderRadius: 10, border: '1px solid #E07A5F', background: '#fff', color: '#E07A5F', fontSize: 13 }}>删除</button>
              </div>
            )}
          </div>
        )) : <div style={{ fontSize: 13, color: '#A8B2A5', textAlign: 'center', marginTop: 30 }}>还没有日记，写第一篇吧～</div>}
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 20, display: 'flex', alignItems: 'flex-end' }} onPointerUp={() => setShowAdd(false)}>
          <div style={{ background: '#FFFDF9', width: '100%', borderRadius: '24px 24px 0 0', padding: 22, paddingBottom: 40, maxHeight: '85vh', overflowY: 'auto' }} onPointerUp={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{editId ? '编辑日记' : '写日记'}</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>{moods.map(m => (<button key={m} onPointerUp={() => setMood(m)} style={{ fontSize: 24, opacity: mood === m ? 1 : .3, background: 'none', border: 'none' }}>{m}</button>))}</div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="标题（可选）" style={{ width: '100%', padding: 12, borderRadius: 14, border: '1.5px solid #E5ECDE', fontSize: 15, background: '#fff', outline: 'none', marginBottom: 12 }} />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="今天发生了什么…" rows={6} style={{ width: '100%', padding: 12, borderRadius: 14, border: '1.5px solid #E5ECDE', fontSize: 14, background: '#fff', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
            <button onPointerUp={saveEntry} style={{ marginTop: 14, width: '100%', height: 48, borderRadius: 24, border: 'none', background: '#5B8C5A', color: '#fff', fontSize: 16, fontWeight: 700 }}>{editId ? '保存修改' : '保存日记'}</button>
          </div>
        </div>
      )}
      <NavBar />
    </div>
  );
}