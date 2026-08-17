'use client';
import { useState } from 'react';
function NavBar() {
  const items = [['home', '首页', '/'], ['money', '记账', '/money'], ['ai', 'AI助手', '/ai'], ['profile', '我的', '/profile']];
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: 'rgba(255,255,255,.97)', borderTop: '1px solid #E5ECDE', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
      {items.map(([k, label, href]) => { const on = k === 'ai'; return <a key={k} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 12, textDecoration: 'none', color: on ? '#5B8C5A' : '#9B8A80', fontWeight: on ? 700 : 500 }}><span style={{ fontSize: 22 }}>{k === 'home' ? '🏠' : k === 'money' ? '💰' : k === 'ai' ? '🤖' : '👤'}</span>{label}</a>; })}
    </nav>
  );
}
export default function AI() {
  const [msgs, setMsgs] = useState<any[]>([{ role: 'assistant', content: '你好！我是你的 AI 助手，有什么可以帮你？' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    const nowMsgs = [...msgs, { role: 'user', content: userMsg }];
    setMsgs(nowMsgs); setInput(''); setLoading(true);
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nowMsgs }) });
      const data = await res.json();
      // 优先用真实内容
      const reply = data?.data?.choices?.[0]?.message?.content
        || (data?.__error ? '⚠️ ' + data.__error : '（AI 暂无回复）');
      setMsgs([...nowMsgs, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMsgs([...nowMsgs, { role: 'assistant', content: '⚠️ 请求异常：' + (e?.message || '未知') }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '16px 14px 80px', background: '#F4F7F0', color: '#3A4437', fontSize: 15, display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: 21, fontWeight: 800 }}>🤖 AI 助手</h1>
      <div style={{ fontSize: 12, color: '#8A9785', marginTop: 4 }}>问它任何问题，陪你一起搞定</div>
      <div style={{ flex: 1, overflowY: 'auto', marginTop: 14, display: 'flex', flexDirection: 'column' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            <div style={{ maxWidth: '82%', padding: '10px 14px', borderRadius: 16, background: m.role === 'user' ? '#5B8C5A' : '#fff', color: m.role === 'user' ? '#fff' : '#3A4437', fontSize: 14, lineHeight: 1.6, border: m.role === 'assistant' ? '1px solid #E5ECDE' : 'none', whiteSpace: 'pre-wrap' }}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{ color: '#8A9785', fontSize: 13, padding: 10 }}>AI 思考中…</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, position: 'sticky', bottom: 70, background: '#F4F7F0', padding: '8px 0' }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="输入问题…" onKeyDown={e => { if (e.key === 'Enter') send(); }} style={{ flex: 1, padding: 12, borderRadius: 20, border: '1.5px solid #E5ECDE', fontSize: 14, background: '#fff', outline: 'none' }} />
        <button onPointerUp={send} disabled={loading} style={{ padding: '12px 18px', borderRadius: 20, border: 'none', background: loading ? '#A8B2A5' : '#5B8C5A', color: '#fff', fontSize: 14, fontWeight: 700 }}>发送</button>
      </div>
      <NavBar />
    </div>
  );
}