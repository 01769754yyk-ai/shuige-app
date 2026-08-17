'use client';
import { useEffect, useMemo, useState } from 'react';
const STORE = 'money_v1';
function NavBar() {
  const items = [['home', '首页', '/'], ['money', '记账', '/money'], ['ai', 'AI助手', '/ai'], ['profile', '我的', '/profile']];
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: 'rgba(255,255,255,.97)', borderTop: '1px solid #E5ECDE', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
      {items.map(([k, label, href]) => { const on = k === 'money'; return <a key={k} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 12, textDecoration: 'none', color: on ? '#5B8C5A' : '#9B8A80', fontWeight: on ? 700 : 500 }}><span style={{ fontSize: 22 }}>{k === 'home' ? '🏠' : k === 'money' ? '💰' : k === 'ai' ? '🤖' : '👤'}</span>{label}</a>; })}
    </nav>
  );
}
const EXP_CATS = ['餐饮', '交通', '购物', '学习', '娱乐', '其他'];
const INC_CATS = ['主业收入', '副业收入'];
export default function Money() {
  const [records, setRecords] = useState<any[]>([]);
  const [trash, setTrash] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [type, setType] = useState<any>('支出');
  const [amount, setAmount] = useState('');
  const [cats, setCats] = useState(EXP_CATS);
  const [cat, setCat] = useState(EXP_CATS[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => { const n = new Date(); return n.getHours().toString().padStart(2, '0') + ':' + n.getMinutes().toString().padStart(2, '0'); });
  const [note, setNote] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [view, setView] = useState<any>('月');
  const [filter, setFilter] = useState('全部');
  const [savings, setSavings] = useState({ saved: 0, shortTarget: 5000, longTarget: 50000, budget: 3000 });

  useEffect(() => { try { const raw = localStorage.getItem(STORE); if (raw) { const d = JSON.parse(raw); if (d.records && d.records.length) setRecords(d.records); if (d.trash && d.trash.length) setTrash(d.trash); if (d.savings) setSavings({ saved: 0, shortTarget: 5000, longTarget: 50000, budget: 3000, ...d.savings }); } } catch (e) { } setLoaded(true); }, []);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem(STORE, JSON.stringify({ records, trash, savings })); } catch (e) { } }, [records, trash, savings, loaded]);

  const income = records.filter(r => r.type === '收入').reduce((a, r) => a + Number(r.amount), 0);
  const expense = records.filter(r => r.type === '支出').reduce((a, r) => a + Number(r.amount), 0);
  const balance = income - expense;
  const incMain = records.filter(r => r.type === '收入' && r.cat === '主业收入').reduce((a, r) => a + Number(r.amount), 0);
  const incSide = records.filter(r => r.type === '收入' && r.cat === '副业收入').reduce((a, r) => a + Number(r.amount), 0);

  const expByCat = useMemo(() => { const m: any = {}; records.filter(r => r.type === '支出').forEach(r => { m[r.cat] = (m[r.cat] || 0) + Number(r.amount); }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [records]);
  const checkinDays = useMemo(() => { const bd: any = {}; records.forEach(r => { if (!bd[r.date]) bd[r.date] = []; bd[r.date].push(r); }); return Object.keys(bd).length; }, [records]);
  const monthEdit = useMemo(() => { const m: any = {}; records.forEach(r => { const k = r.date.slice(0, 7); if (!m[k]) m[k] = { income: 0, expense: 0 }; if (r.type === '收入') m[k].income += Number(r.amount); else m[k].expense += Number(r.amount); }); return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0])); }, [records]);
  const nowMonth = new Date().toISOString().slice(0, 7);
  const monthExpense = records.filter(r => r.type === '支出' && r.date.startsWith(nowMonth)).reduce((a, r) => a + Number(r.amount), 0);
  const budgetPct = Math.min(100, Math.round(monthExpense / Math.max(savings.budget, 1) * 100));
  const overBudget = monthExpense > savings.budget;
  const visible = filter === '全部' ? records : records.filter(r => r.cat === filter);
  const nowTime = () => { const n = new Date(); return n.getHours().toString().padStart(2, '0') + ':' + n.getMinutes().toString().padStart(2, '0'); };
  const add = () => { const amt = parseFloat(amount); if (!amt || amt <= 0) { alert('请输入有效金额'); return; } const rec = { id: Date.now() + '', type, amount: amt, cat, date, time, note }; setRecords([rec, ...records]); setAmount(''); setNote(''); setShowAdd(false); };
  const del = (id: any) => setRecords(records.filter(x => x.id !== id));
  const clearAll = () => { if (confirm('清空全部记账？')) setRecords([]); };
  const exportData = () => { const blob = new Blob([JSON.stringify({ money: records, savings }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '我的记账备份.json'; a.click(); };
  const setType2 = (t: any) => { setType(t); setCats(t === '收入' ? INC_CATS : EXP_CATS); setCat((t === '收入' ? INC_CATS : EXP_CATS)[0]); };
  const shortPct = Math.min(100, Math.round(savings.saved / Math.max(savings.shortTarget, 1) * 100));
  const longPct = Math.min(100, Math.round(savings.saved / Math.max(savings.longTarget, 1) * 100));

  return (
    <div style={{ minHeight: '100vh', padding: '16px 14px 80px', background: '#F4F7F0', color: '#3A4437', fontSize: 15 }}>
      <h1 style={{ fontSize: 21, fontWeight: 800 }}>记账</h1>
      <div style={{ marginTop: 8, fontSize: 13, color: '#5B8C5A', fontStyle: 'italic' }}>钱的本质是买自由</div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <div style={{ flex: 1, background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 10, textAlign: 'center' }}><div style={{ fontSize: 10, color: '#8A9785' }}>收入</div><div style={{ fontSize: 15, fontWeight: 800, color: '#5B8C5A' }}>+{income}</div></div>
        <div style={{ flex: 1, background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 10, textAlign: 'center' }}><div style={{ fontSize: 10, color: '#8A9785' }}>支出</div><div style={{ fontSize: 15, fontWeight: 800, color: '#E07A5F' }}>-{expense}</div></div>
        <div style={{ flex: 1, background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 10, textAlign: 'center' }}><div style={{ fontSize: 10, color: '#8A9785' }}>结余</div><div style={{ fontSize: 15, fontWeight: 800 }}>{balance}</div></div>
        <div style={{ flex: 1, background: '#fff', border: '1px solid #5B8C5A', borderRadius: 14, padding: 10, textAlign: 'center', cursor: 'pointer' }} onPointerUp={() => setShowCheckin(true)}><div style={{ fontSize: 10, color: '#8A9785' }}>打卡</div><div style={{ fontSize: 15, fontWeight: 800 }}>🔥{checkinDays}</div></div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: '#8A9785' }}>🏦存款余额</span><button onPointerUp={() => { const v = prompt('输入存款余额', String(savings.saved)); const n = parseFloat(v || ''); if (n >= 0) setSavings(s => ({ ...s, saved: n })); }} style={{ background: '#5B8C5A', border: 'none', borderRadius: 10, padding: '6px 12px', color: '#fff', fontSize: 13 }}>¥{savings.saved}改</button></div>
        <div style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 4px' }}>¥{savings.saved}</div>
        <div style={{ fontSize: 12, color: '#8A9785' }}>短目标 ¥{savings.shortTarget}</div>
        <div style={{ height: 8, borderRadius: 4, background: '#EDF2E8', overflow: 'hidden', marginTop: 6 }}><div style={{ height: '100%', width: shortPct + '%', background: '#5B8C5A' }} /></div>
        <div style={{ fontSize: 12, color: '#8A9785', marginTop: 10 }}>长目标 ¥{savings.longTarget}</div>
        <div style={{ height: 8, borderRadius: 4, background: '#EDF2E8', overflow: 'hidden', marginTop: 6 }}><div style={{ height: '100%', width: longPct + '%', background: '#3F8F82' }} /></div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button onPointerUp={() => { const v = prompt('设置短目标', String(savings.shortTarget)); const n = parseFloat(v || ''); if (n > 0) setSavings(s => ({ ...s, shortTarget: n })); }} style={{ flex: 1, padding: 8, border: '1px solid #E5ECDE', borderRadius: 10, background: '#F4F7F0', fontSize: 12 }}>改短目标</button>
          <button onPointerUp={() => { const v = prompt('设置长目标', String(savings.longTarget)); const n = parseFloat(v || ''); if (n > 0) setSavings(s => ({ ...s, longTarget: n })); }} style={{ flex: 1, padding: 8, border: '1px solid #E5ECDE', borderRadius: 10, background: '#F4F7F0', fontSize: 12 }}>改长目标</button>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid ' + (overBudget ? '#E07A5F' : '#E5ECDE'), borderRadius: 14, padding: 12, marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: '#8A9785' }}>本月预算</span><button onPointerUp={() => { const v = prompt('设置月预算', String(savings.budget)); const n = parseFloat(v || ''); if (n > 0) setSavings(s => ({ ...s, budget: n })); }} style={{ background: 'none', border: 'none', color: '#5B8C5A', fontSize: 12 }}>¥{savings.budget}改</button></div>
        <div style={{ fontSize: 18, fontWeight: 800, color: overBudget ? '#E07A5F' : (budgetPct > 70 ? '#F2A65A' : '#3A4437') }}>¥{monthExpense}<span style={{ fontSize: 12, color: '#8A9785' }}>/¥{savings.budget}</span></div>
        <div style={{ height: 8, borderRadius: 4, background: '#EDF2E8', overflow: 'hidden', marginTop: 6 }}><div style={{ height: '100%', width: budgetPct + '%', background: overBudget ? '#E07A5F' : (budgetPct > 70 ? '#F2A65A' : '#5B8C5A') }} /></div>
        {overBudget ? <div style={{ fontSize: 12, color: '#E07A5F', marginTop: 6 }}>⚠️已超预算</div> : <div style={{ fontSize: 12, color: '#8A9785', marginTop: 6 }}>已用{budgetPct}%</div>}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, marginTop: 12 }}>
        <div style={{ fontSize: 13, color: '#8A9785', marginBottom: 8 }}>支出分类</div>
        {expByCat.length ? expByCat.slice(0, 5).map(([c, v]: any) => (
          <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <span style={{ width: 70, fontSize: 13 }}>{c}</span>
            <div style={{ flex: 1, height: 10, borderRadius: 5, background: '#EDF2E8', overflow: 'hidden' }}><div style={{ height: '100%', width: expense ? Math.round(Number(v) / expense * 100) + '%' : '0%', background: '#E07A5F', borderRadius: 5 }} /></div>
            <span style={{ fontSize: 13, fontWeight: 700, width: 50, textAlign: 'right' }}>{v}</span>
          </div>
        )) : <div style={{ fontSize: 12, color: '#A8B2A5', textAlign: 'center', padding: 8 }}>暂无支出</div>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button onPointerUp={() => setView('月')} style={{ padding: '6px 12px', borderRadius: 12, border: view === '月' ? '2px solid #5B8C5A' : '1px solid #E5ECDE', background: view === '月' ? '#EDF6EB' : '#fff', color: view === '月' ? '#5B8C5A' : '#3A4437', fontSize: 12 }}>月</button>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 12, border: '1px solid #E5ECDE', fontSize: 12, background: '#fff' }}><option value="全部">全部</option>{[...EXP_CATS, ...INC_CATS].map(c => (<option key={c} value={c}>{c}</option>))}</select>
      </div>
      {monthEdit.map(([k, d]: any) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 10, padding: 8, marginTop: 6, fontSize: 12 }}><span>{k}</span><span style={{ color: '#5B8C5A' }}>收+{d.income}</span><span style={{ color: '#E07A5F' }}>支-{d.expense}</span><span>余{d.income - d.expense}</span></div>
      ))}

      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 13, color: '#8A9785' }}>{filter === '全部' ? '全部记录' : filter}</span>{records.length > 0 && <button onPointerUp={clearAll} style={{ border: 'none', color: '#E07A5F', fontSize: 12 }}>清空</button>}</div>
        {visible.length ? visible.map(r => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #E5ECDE', borderRadius: 12, padding: 10, marginTop: 6, display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{r.cat} {r.time ? ('·' + r.time) : ''}</div><div style={{ fontSize: 11, color: '#8A9785' }}>{r.date}{r.note ? '·' + r.note : ''}</div></div>
            <div style={{ fontSize: 15, fontWeight: 800, color: r.type === '收入' ? '#5B8C5A' : '#E07A5F', marginRight: 8 }}>{r.type === '收入' ? '+' : '-'}{r.amount}</div>
            <button onPointerUp={() => del(r.id)} style={{ background: 'none', border: 'none', color: '#E07A5F', fontSize: 13 }}>✕</button>
          </div>
        )) : <div style={{ fontSize: 12, color: '#A8B2A5', textAlign: 'center', marginTop: 16 }}>没有记录</div>}
      </div>

      <button onPointerUp={() => setShowAdd(true)} style={{ marginTop: 14, width: '100%', height: 48, borderRadius: 14, border: 'none', background: '#5B8C5A', color: '#fff', fontSize: 15, fontWeight: 700 }}>＋记一笔</button>
      <button onPointerUp={exportData} style={{ marginTop: 8, width: '100%', height: 42, borderRadius: 14, border: '1.5px solid #5B8C5A', background: '#fff', color: '#5B8C5A', fontSize: 14, fontWeight: 700 }}>📤导出备份</button>

      {showCheckin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 20, display: 'flex', alignItems: 'flex-end' }} onPointerUp={() => setShowCheckin(false)}>
          <div style={{ background: '#FFFDF9', width: '100%', borderRadius: '24px 24px 0 0', padding: 22, paddingBottom: 40, maxHeight: '70vh', overflowY: 'auto' }} onPointerUp={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>打卡明细</div>
            <div style={{ fontSize: 12, color: '#8A9785', marginBottom: 12 }}>共{checkinDays}天有记账打卡</div>
            {Array.from(new Set(records.map(r => r.date))).sort().reverse().map(day => (
              <div key={day} style={{ background: '#F7FAF4', borderRadius: 12, padding: 10, marginTop: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>📅{day}</div>
                {records.filter(r => r.date === day).map(r => (<div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}><span>{r.time || '--'}·{r.cat}</span><span style={{ color: r.type === '收入' ? '#5B8C5A' : '#E07A5F' }}>{r.type === '收入' ? '+' : '-'}{r.amount}</span></div>))}
              </div>
            ))}
            {!checkinDays && <div style={{ fontSize: 13, color: '#A8B2A5', textAlign: 'center', marginTop: 20 }}>还没有打卡记录</div>}
          </div>
        </div>
      )}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 20, display: 'flex', alignItems: 'flex-end' }} onPointerUp={() => setShowAdd(false)}>
          <div style={{ background: '#FFFDF9', width: '100%', borderRadius: '24px 24px 0 0', padding: 22, paddingBottom: 40 }} onPointerUp={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>记一笔</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>{['支出', '收入'].map(t => (<button key={t} onPointerUp={() => setType2(t)} style={{ padding: '8px 16px', borderRadius: 20, border: type === t ? '2px solid #5B8C5A' : '1px solid #E5ECDE', background: type === t ? '#EDF6EB' : '#fff', color: type === t ? '#5B8C5A' : '#3A4437', fontSize: 14 }}>{t}</button>))}</div>
            <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder="金额" style={{ width: '100%', padding: 13, borderRadius: 14, border: '1.5px solid #E5ECDE', fontSize: 16, background: '#fff', outline: 'none', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>{cats.map(c => (<button key={c} onPointerUp={() => setCat(c)} style={{ padding: '6px 12px', borderRadius: 14, border: cat === c ? '2px solid #5B8C5A' : '1px solid #E5ECDE', background: cat === c ? '#EDF6EB' : '#fff', color: cat === c ? '#5B8C5A' : '#3A4437', fontSize: 13 }}>{c}</button>))}</div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: 13, borderRadius: 14, border: '1.5px solid #E5ECDE', fontSize: 14, background: '#fff', outline: 'none', marginBottom: 12 }} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: '100%', padding: 13, borderRadius: 14, border: '1.5px solid #E5ECDE', fontSize: 14, background: '#fff', outline: 'none', marginBottom: 12 }} />
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="备注（可选）" style={{ width: '100%', padding: 13, borderRadius: 14, border: '1.5px solid #E5ECDE', fontSize: 14, background: '#fff', outline: 'none', marginBottom: 16 }} />
            <button onPointerUp={add} style={{ width: '100%', height: 48, borderRadius: 24, border: 'none', background: '#5B8C5A', color: '#fff', fontSize: 16, fontWeight: 700 }}>保存</button>
          </div>
        </div>
      )}
      <NavBar />
    </div>
  );
}