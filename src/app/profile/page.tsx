'use client';
import { useEffect, useRef, useState } from 'react';
const NAME_KEY = 'shuige:name';
const COUNT_KEY = 'countdown_v1';
const ALL_KEYS = ['tasks_v1', 'money_v1', 'diary_v1', 'countdown_v1', 'branches_v1', 'shuige:name', 'shuige:city'];
function get(k: string) { if (typeof window === 'undefined') return null; try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
function NavBar({ active }: { active: string }) {
  const items = [['home', '首页', '/'], ['money', '记账', '/money'], ['ai', 'AI助手', '/ai'], ['profile', '我的', '/profile']];
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: 'rgba(255,255,255,.97)', borderTop: '1px solid #E5ECDE', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
      {items.map(([k, label, href]) => { const on = active === k; return <a key={k} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 12, textDecoration: 'none', color: on ? '#5B8C5A' : '#9B8A80', fontWeight: on ? 700 : 500 }}><span style={{ fontSize: 22 }}>{k === 'home' ? '🏠' : k === 'money' ? '💰' : k === 'ai' ? '🤖' : '👤'}</span>{label}</a>; })}
    </nav>
  );
}
export default function Profile() {
  const [name, setName] = useState('小鑫');
  const [counts, setCounts] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const n = localStorage.getItem(NAME_KEY); if (n) setName(n);
    const c = get(COUNT_KEY); if (c && c.length) setCounts(c);
  }, []);

  const upcoming = counts.map((c: any) => ({ ...c, left: Math.ceil((new Date(c.date).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000) })).filter(c => c.left >= 0).sort((a, b) => a.left - b.left)[0];

  const exportAll = () => {
    const data: any = {};
    ALL_KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v) data[k] = JSON.parse(v); } catch { } });
    data.__exportedAt = new Date().toISOString();
    data.__version = 1;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '水哥清单-完整备份.json'; a.click();
    setMsg('✅ 已导出完整备份'); setTimeout(() => setMsg(''), 2000);
  };
  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data || typeof data !== 'object') { alert('文件格式不对，导入失败'); return; }
        ALL_KEYS.forEach(k => { if (data[k] !== undefined) { try { localStorage.setItem(k, typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k])); } catch { } } });
        setMsg('✅ 已恢复数据，请刷新页面查看'); setTimeout(() => { window.location.reload(); }, 1200);
      } catch (e) { alert('导入失败：文件不是有效的备份'); }
    };
    reader.readAsText(file);
  };

  const entries = [['💰', '记账', '/money'], ['📔', '日记', '/diary'], ['⏳', '倒数日', '/countdown'], ['📊', '洞察', '/insights']];

  return (
    <div style={{ minHeight: '100vh', padding: '16px 14px 80px', background: '#F4F7F0', color: '#3A4437', fontSize: 15 }}>
      <h1 style={{ fontSize: 21, fontWeight: 800 }}>我的</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #E5ECDE', borderRadius: 20, padding: 16, marginTop: 12 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(140deg,#EAF4EA,#F0FBF0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🦦</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#5B8C5A', background: '#EAF4EA', padding: '3px 10px', borderRadius: 13, display: 'inline-block', marginTop: 5 }}>🌱 探索与备考</div>
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

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 13, color: '#A99585', marginBottom: 8 }}>☁️ 云备份</div>
        <div style={{ background: '#EAF4EA', border: '1px solid #CBE3CC', borderRadius: 14, padding: 14, fontSize: 13, color: '#3A4437' }}>你的任务、记账等数据会<strong>自动保存到云端</strong>，换设备/清缓存后可在云端找回。</div>
        <div style={{ fontSize: 11, color: '#A99585', marginTop: 8 }}>每次修改后自动备份 · 无需手动操作</div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 13, color: '#A99585', marginBottom: 8 }}>数据备份</div>
        <button onPointerUp={exportAll} style={{ width: '100%', height: 48, borderRadius: 14, border: 'none', background: '#5B8C5A', color: '#fff', fontSize: 15, fontWeight: 700 }}>📤 导出全部备份</button>
        <button onPointerUp={() => fileRef.current?.click()} style={{ marginTop: 8, width: '100%', height: 48, borderRadius: 14, border: '1.5px solid #5B8C5A', background: '#fff', color: '#5B8C5A', fontSize: 15, fontWeight: 700 }}>📥 导入恢复数据</button>
        <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={e => { if (e.target.files && e.target.files[0]) importFile(e.target.files[0]); e.target.value = ''; }} />
        {msg && <div style={{ textAlign: 'center', color: '#5B8C5A', fontSize: 13, marginTop: 10 }}>{msg}</div>}
        <div style={{ fontSize: 11, color: '#A99585', marginTop: 8 }}>导出备份防丢失 · 换手机后导入恢复</div>
      </div>

      <div style={{ textAlign: 'center', color: '#A99585', fontSize: 11, marginTop: 18 }}>水哥清单 v1.3.1</div>
      <NavBar active="profile" />
    </div>
  );
}