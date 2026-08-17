'use client';
import { useEffect, useState } from 'react';
const KEY = 'shuige:v1';
const TASK_KEY = 'tasks_v1';
const AMAP_KEY = 'f36c4c37cbae8828b32953cb7de7481d';
function load() { if (typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null } }
function loadTasks() { if (typeof window === 'undefined') return null; try { const r = localStorage.getItem(TASK_KEY); return r ? JSON.parse(r) : null } catch { return null } }
const DEF = [{ id: 't1', title: '学习剪辑 · 一节课', done: false, cat: '学习' }];
function NavBar({ active }: { active: string }) {
  const items = [['home', '首页', '/'], ['money', '记账', '/money'], ['ai', 'AI助手', '/ai'], ['profile', '我的', '/profile']];
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, background: 'rgba(255,255,255,.97)', borderTop: '1px solid #E5ECDE', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
      {items.map(([k, label, href]) => { const on = active === k; return <a key={k} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 12, textDecoration: 'none', color: on ? '#5B8C5A' : '#9B8A80', fontWeight: on ? 700 : 500 }}><span style={{ fontSize: 22 }}>{k === 'home' ? '🏠' : k === 'money' ? '💰' : k === 'ai' ? '🤖' : '👤'}</span>{label}</a>; })}
    </nav>
  );
}
export default function Home() {
  const [tasks, setTasks] = useState(DEF);
  const [quote, setQuote] = useState('努力的人，运气总不会太差');
  const [dateStr, setDateStr] = useState('');
  const [greet, setGreet] = useState('晚上好');
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState({ temp: '--', desc: '--', icon: '🌤️' });
  const [cityInput, setCityInput] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => { const t = loadTasks(); if (t && t.length) setTasks(t); const s = load(); if (s && typeof s.city === 'string' && s.city) setCity(s.city); }, []);
  useEffect(() => { try { localStorage.setItem(TASK_KEY, JSON.stringify(tasks)); } catch (e) { } }, [tasks]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ city })); } catch (e) { } }, [city]);
  useEffect(() => { fetch('https://v1.hitokoto.cn/').then(r => r.json()).then(d => { if (d.hitokoto) setQuote(d.hitokoto); }).catch(() => { }); }, []);
  useEffect(() => { const now = new Date(); setDateStr(now.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })); const h = now.getHours(); let g = '晚上好'; if (h >= 5 && h < 11) g = '早上好'; else if (h >= 11 && h < 14) g = '中午好'; else if (h >= 14 && h < 18) g = '下午好'; setGreet(g); }, []);
  useEffect(() => { if (typeof city === 'string' && city.trim()) amapWeather(city.trim()); }, [city]);
  useEffect(() => { fetch(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`).then(r => r.json()).then(d => { const c = (d?.city && d.city !== '[]' && d.city !== '') ? (d.city as string) : ((d?.province as string) || '成都'); setCity(typeof c === 'string' ? c : '成都'); }).catch(() => setCity('成都')); }, []);
  function amapWeather(c) { fetch(`https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(c)}&key=${AMAP_KEY}`).then(r => r.json()).then(g => { const adcode = g?.geocodes?.[0]?.adcode; if (adcode) amapWeatherBy(adcode); }).catch(() => { }); }
  function amapWeatherBy(adcode) { fetch(`https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${AMAP_KEY}`).then(r => r.json()).then(w => { const l = w?.lives?.[0]; if (l) { const t = l.temperature ? l.temperature + '°C' : '--'; const ds = l.weather || ''; const ic = ds.includes('雨') ? '🌧️' : ds.includes('云') ? '☁️' : ds.includes('雪') ? '❄️' : ds.includes('晴') ? '☀️' : '🌤️'; setWeather({ temp: t, desc: ds, icon: ic }); if (l.city) setCity(l.city); } }).catch(() => { }); }
  const done = tasks.filter((t: any) => t.done).length;
  const toggle = (id: any) => { const next = tasks.map((t: any) => t.id === id ? { ...t, done: !t.done } : t); setTasks(next); try { localStorage.setItem(TASK_KEY, JSON.stringify(next)); } catch (e) { } };
  const delTask = (id: any) => { const next = tasks.filter((t: any) => t.id !== id); setTasks(next); try { localStorage.setItem(TASK_KEY, JSON.stringify(next)); } catch (e) { } };
  const addTask = () => { if (!newTitle.trim()) return; const next = [{ id: Date.now() + '', title: newTitle.trim(), done: false, cat: '自定义' }, ...tasks]; setTasks(next); setNewTitle(''); setShowAdd(false); try { localStorage.setItem(TASK_KEY, JSON.stringify(next)); } catch (e) { } };
  const card: any = { background: '#fff', border: '1px solid #E5ECDE', borderRadius: 16, padding: 14 };

  return (
    <div style={{ minHeight: '100vh', padding: '16px 14px 80px', background: '#F4F7F0', color: '#3A4437', fontSize: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div><div style={{ fontSize: 12, color: '#8A9785' }}>{dateStr} · {greet}</div><div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>小鑫</div></div>
        <div style={{ textAlign: 'center', background: '#EAF4EA', borderRadius: 16, padding: '8px 12px', minWidth: 100 }}><div style={{ fontSize: 20 }}>{weather.icon}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{city || '定位中'}</div><div style={{ fontSize: 11, color: '#5B8C5A' }}>{weather.desc} {weather.temp}</div></div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="输城市查天气" style={{ flex: 1, padding: '8px 12px', borderRadius: 12, border: '1px solid #E5ECDE', fontSize: 13, background: '#fff', outline: 'none' }} />
        <button onPointerUp={() => { if (cityInput.trim()) setCity(cityInput.trim()); }} style={{ padding: '8px 14px', borderRadius: 12, border: 'none', background: '#5B8C5A', color: '#fff', fontSize: 13 }}>查询</button>
      </div>
      <div style={{ marginTop: 10, fontSize: 14, color: '#5B8C5A', fontStyle: 'italic' }}>「{quote}」</div>
      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#8A9785' }}>今日任务</span>
          <button onPointerUp={() => setShowAdd(true)} style={{ border: 'none', background: 'none', color: '#5B8C5A', fontSize: 14 }}>＋添加</button>
        </div>
        {tasks.map((t: any) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: '1px solid #EDF2E8' }}>
            <button onPointerUp={() => toggle(t.id)} style={{ width: 26, height: 26, borderRadius: 8, border: t.done ? 'none' : '2px solid #5B8C5A', background: t.done ? '#5B8C5A' : '#fff', color: '#fff', fontSize: 14, flexShrink: 0 }}>{t.done ? '✓' : ''}</button>
            <div style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#A8B2A5' : '#3A4437', fontSize: 15 }}>{t.title}</div>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#EDF2E8', color: '#5B8C5A' }}>{t.cat}</span>
            <button onPointerUp={() => delTask(t.id)} style={{ border: 'none', background: 'none', color: '#E07A5F', fontSize: 14 }}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <a href="/money" style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, textDecoration: 'none', color: '#3A4437' }}><div style={{ fontSize: 22 }}>💰</div><div style={{ fontSize: 12 }}>记账</div></a>
        <a href="/ai" style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, textDecoration: 'none', color: '#3A4437' }}><div style={{ fontSize: 22 }}>🤖</div><div style={{ fontSize: 12 }}>AI</div></a>
        <a href="/countdown" style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, textDecoration: 'none', color: '#3A4437' }}><div style={{ fontSize: 22 }}>⏳</div><div style={{ fontSize: 12 }}>倒数日</div></a>
        <a href="/diary" style={{ flex: 1, textAlign: 'center', background: '#fff', border: '1px solid #E5ECDE', borderRadius: 14, padding: 14, textDecoration: 'none', color: '#3A4437' }}><div style={{ fontSize: 22 }}>📔</div><div style={{ fontSize: 12 }}>日记</div></a>
      </div>
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 20, display: 'flex', alignItems: 'flex-end' }} onPointerUp={() => setShowAdd(false)}>
          <div style={{ background: '#FFFDF9', width: '100%', borderRadius: '24px 24px 0 0', padding: 22, paddingBottom: 40 }} onPointerUp={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>添加今日任务</div>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="想做什么？" style={{ width: '100%', padding: 13, borderRadius: 14, border: '1.5px solid #E5ECDE', fontSize: 15, background: '#fff', outline: 'none' }} />
            <button onPointerUp={addTask} style={{ marginTop: 16, width: '100%', height: 48, borderRadius: 24, border: 'none', background: '#5B8C5A', color: '#fff', fontSize: 16, fontWeight: 700 }}>保存</button>
          </div>
        </div>
      )}
      <NavBar active="home" />
    </div>
  );
}