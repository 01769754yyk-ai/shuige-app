'use client';
import { useEffect, useState } from 'react';
const KEY = 'shuige:v1';
const TASK_KEY = 'tasks_v1';
const AMAP_KEY = 'f36c4c37cbae8828b32953cb7de7481d';
function load() { if (typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null } }
function loadTasks() { if (typeof window === 'undefined') return null; try { const r = localStorage.getItem(TASK_KEY); return r ? JSON.parse(r) : null } catch { return null } }
const DEF = [
  { id: 't1', title: '学习 一节课', done: false, cat: '学习' },
  { id: 't2', title: '学习英语口语', done: false, cat: '学习' },
  { id: 't3', title: '复盘', done: false, cat: '复盘' },
  { id: 't4', title: '记账', done: false, cat: '记账' },
];
function NavBar({ active }: { active: string }) {
  const items = [['home', '首页', '/'], ['money', '记账', '/money'], ['ai', 'AI助手', '/ai'], ['profile', '我的', '/profile']];
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: 'rgba(255,255,255,.97)', borderTop: '1px solid #E5ECDE', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
      {items.map(([k, label, href]) => { const on = active === k; return <a key={k} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 12, textDecoration: 'none', color: on ? '#5B8C5A' : '#9B8A80', fontWeight: on ? 700 : 500 }}><span style={{ fontSize: 22 }}>{k === 'home' ? '🏠' : k === 'money' ? '💰' : k === 'ai' ? '🤖' : '👤'}</span>{label}</a>; })}
    </nav>
  );
}
export default function Home() {
  const [name, setName] = useState('小鑫');
  const [tasks, setTasks] = useState(DEF);
  const [quote, setQuote] = useState('努力的人，运气总不会太差');
  const [dateStr, setDateStr] = useState('');
  const [greet, setGreet] = useState('晚上好');
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState({ temp: '--', desc: '--', icon: '🌤️' });
  const [cityInput, setCityInput] = useState('');

  useEffect(() => {
    const t = loadTasks(); if (t && t.length) setTasks(t);
    const s = load(); if (s) { setName(s.name || '小鑫'); if (typeof s.city === 'string' && s.city) setCity(s.city); }
  }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ name, city })); } catch (e) { } }, [name, city]);
  useEffect(() => { fetch('https://v1.hitokoto.cn/').then(r => r.json()).then(d => { if (d.hitokoto) setQuote(d.hitokoto); }).catch(() => { }); }, []);
  useEffect(() => { const now = new Date(); setDateStr(now.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })); const h = now.getHours(); let g = '晚上好'; if (h >= 5 && h < 11) g = '早上好'; else if (h >= 11 && h < 14) g = '中午好'; else if (h >= 14 && h < 18) g = '下午好'; setGreet(g); }, []);
  useEffect(() => { if (typeof city === 'string' && city.trim()) amapWeather(city.trim()); }, [city]);
  useEffect(() => { fetch(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`).then(r => r.json()).then(d => { const c = (d?.city && d.city !== '[]' && d.city !== '') ? (d.city as string) : ((d?.province as string) || '成都'); setCity(typeof c === 'string' ? c : '成都'); }).catch(() => setCity('成都')); }, []);
  function amapWeather(c) { fetch(`https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(c)}&key=${AMAP_KEY}`).then(r => r.json()).then(g => { const adcode = g?.geocodes?.[0]?.adcode; if (adcode) amapWeatherBy(adcode); }).catch(() => { }); }
  function amapWeatherBy(adcode) { fetch(`https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${AMAP_KEY}`).then(r => r.json()).then(w => { const l = w?.lives?.[0]; if (l) { const t = l.temperature ? l.temperature + '°C' : '--'; const ds = l.weather || ''; const ic = ds.includes('雨') ? '🌧️' : ds.includes('云') ? '☁️' : ds.includes('雪') ? '❄️' : ds.includes('晴') ? '☀️' : '🌤️'; setWeather({ temp: t, desc: ds, icon: ic }); if (l.city) setCity(l.city); } }).catch(() => { }); }
  const done = tasks.filter((t: any) => t.done).length;

  // 勾选时立即写入 localStorage（最稳）
  const toggle = (id: any) => {
    const next = tasks.map((t: any) => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(next);
    try { localStorage.setItem(TASK_KEY, JSON.stringify(next)); } catch (e) { }
  };
  const card: any = { background: '#fff', border: '1px solid #E5ECDE', borderRadius: 16, padding: 14 };

  return (
    <div style={{ minHeight: '100vh', padding: '16px 14px 80px', background: '#F4F7F0', color: '#3A4437', fontSize: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div><div style={{ fontSize: 12, color: '#8A9785' }}>{dateStr} · {greet}</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{name}</div></div>
        <div style={{ textAlign: 'center', background: '#EAF4EA', borderRadius: 16, padding: '8px 12px', minWidth: 100 }}><div style={{ fontSize: 20 }}>{weather.icon}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{city || '定位中'}</div><div style={{ fontSize: 11, color: '#5B8C5A' }}>{weather.desc} {weather.temp}</div></div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="输城市查天气" style={{ flex: 1, padding: '8px 12px', borderRadius: 12, border: '1px solid #E5ECDE', fontSize: 13, background: '#fff', outline: 'none' }} />
        <button onPointerUp={() => { if (cityInput.trim()) setCity(cityInput.trim()); }} style={{ padding: '8px 14px', borderRadius: 12, border: 'none', background: '#5B8C5A', color: '#fff', fontSize: 13 }}>查询</button>
      </div>
      <div style={{ marginTop: 10, fontSize: 14, color: '#5B8C5A', fontStyle: 'italic' }}>「{quote}」</div>
      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ fontSize: 13, color: '#8A9785', marginBottom: 6 }}>今日任务</div>
        {tasks.map((t: any) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid #EDF2E8' }}>
            <button onPointerUp={() => toggle(t.id)} style={{ width: 26, height: 26, borderRadius: 8, border: t.done ? 'none' : '2px solid #5B8C5A', background: t.done ? '#5B8C5A' : '#fff', color: '#fff', fontSize: 14 }}>{t.done ? '✓' : ''}</button>
            <div style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#A8B2A5' : '#3A4437', fontSize: 15 }}>{t.title}</div>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#EDF2E8', color: '#5B8C5A' }}>{t.cat}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <a href="/money" style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, textDecoration: 'none', color: '#3A4437' }}><div style={{ fontSize: 22 }}>💰</div><div style={{ fontSize: 12 }}>记账</div></a>
        <a href="/ai" style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, textDecoration: 'none', color: '#3A4437' }}><div style={{ fontSize: 22 }}>🤖</div><div style={{ fontSize: 12 }}>AI</div></a>
        <a href="/countdown" style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, textDecoration: 'none', color: '#3A4437' }}><div style={{ fontSize: 22 }}>⏳</div><div style={{ fontSize: 12 }}>倒数日</div></a>
        <a href="/diary" style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, textDecoration: 'none', color: '#3A4437' }}><div style={{ fontSize: 22 }}>📔</div><div style={{ fontSize: 12 }}>日记</div></a>
      </div>
      <NavBar active="home" />
    </div>
  );
}