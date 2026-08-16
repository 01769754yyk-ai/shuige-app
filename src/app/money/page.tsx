'use client';
import { useEffect, useMemo, useState } from 'react';
const STORE='money_v1';

function NavBar(){const items=[['home','首页','/'],['money','记账','/money'],['ai','AI助手','/ai'],['profile','我的','/profile']];return(<nav style={{position:'fixed',bottom:0,left:0,right:0,height:60,background:'rgba(255,255,255,.97)',borderTop:'1px solid #E5ECDE',display:'flex',alignItems:'center',justifyContent:'space-around',zIndex:10}}>{items.map(([k,label,href])=>{const on=k==='money';return<a key={k} href={href} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,fontSize:12,textDecoration:'none',color:on?'#5B8C5A':'#9B8A80',fontWeight:on?700:500}}><span style={{fontSize:22}}>{k==='home'?'🏠':k==='money'?'💰':k==='ai'?'🤖':'👤'}</span>{label}</a>;})}</nav>);}

const EXP_CATS=['餐饮','交通','购物','学习','娱乐','其他'];
const INC_CATS=['主业收入','副业收入'];
const QUICK=[['☕早餐','12'],['🚌交通','3'],['🥗午餐','20'],['🛒买菜','35'],['📚学习','30']];
const RING_COLORS=['#E07A5F','#F2A65A','#5B8C5A','#3F8F82','#8A78CE','#C9B8AC'];

export default function Money(){
  const [records,setRecords]=useState<any[]>([]);
  const [trash,setTrash]=useState<any[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [type,setType]=useState<'收入'|'支出'>('支出');
  const [amount,setAmount]=useState(''); const [cats,setCats]=useState(EXP_CATS); const [cat,setCat]=useState(EXP_CATS[0]);
  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10)); const [note,setNote]=useState('');
  const [showAdd,setShowAdd]=useState(false); const [showCheckin,setShowCheckin]=useState(false); const [showTrash,setShowTrash]=useState(false);
  const [view,setView]=useState<'月'|'年'>('月'); const [filter,setFilter]=useState('全部');
  // 存款目标（真实手动）
  const [savings,setSavings]=useState({saved:0,shortTarget:5000,longTarget:50000,monthSave:1000});

  useEffect(()=>{ try{ const raw=localStorage.getItem(STORE); if(raw){ const d=JSON.parse(raw); if(d.records&&d.records.length)setRecords(d.records); if(d.trash&&d.trash.length)setTrash(d.trash); if(d.savings)setSavings({saved:0,shortTarget:5000,longTarget:50000,monthSave:1000,...d.savings});} }catch(e){} setLoaded(true); },[]);
  useEffect(()=>{ if(!loaded)return; try{ localStorage.setItem(STORE, JSON.stringify({records,trash,savings})); }catch(e){} },[records,trash,savings,loaded]);

  const income=records.filter(r=>r.type==='收入').reduce((a,r)=>a+Number(r.amount),0);
  const expense=records.filter(r=>r.type==='支出').reduce((a,r)=>a+Number(r.amount),0);
  const balance=income-expense;
  const incMain=records.filter(r=>r.type==='收入'&&r.cat==='主业收入').reduce((a,r)=>a+Number(r.amount),0);
  const incSide=records.filter(r=>r.type==='收入'&&r.cat==='副业收入').reduce((a,r)=>a+Number(r.amount),0);

  const expByCat=useMemo(()=>{const m:any={};records.filter(r=>r.type==='支出').forEach(r=>{m[r.cat]=(m[r.cat]||0)+Number(r.amount)});return Object.entries(m).sort((a,b)=>b[1]-a[1]);},[records]);
  const incByCat=useMemo(()=>{const m:any={};records.filter(r=>r.type==='收入').forEach(r=>{m[r.cat]=(m[r.cat]||0)+Number(r.amount)});return Object.entries(m).sort((a,b)=>b[1]-a[1]);},[records]);
  const chartData=type==='支出'?expByCat:incByCat; const chartTotal=chartData.reduce((a:number,x:any)=>a+Number(x[1]),0)||1;

  const trend=useMemo(()=>{const days=[];const now=new Date();for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push({label:'周'+'日一二三四五六'[d.getDay()],date:d.toISOString().slice(0,10),inc:0,exp:0});}records.forEach(r=>{const day=days.find(d=>d.date===r.date);if(day){if(r.type==='收入')day.inc+=Number(r.amount);else day.exp+=Number(r.amount);}});const m=Math.max(...days.map(d=>Math.max(d.inc,d.exp)),1);days.forEach(d=>{d.ih=Math.round(d.inc/m*80);d.eh=Math.round(d.exp/m*80);});return days;},[records]);

  const monthStat=useMemo(()=>{const m:any={};records.forEach(r=>{const k=r.date.slice(0,7);if(!m[k])m[k]={income:0,expense:0};if(r.type==='收入')m[k].income+=Number(r.amount);else m[k].expense+=Number(r.amount);});return Object.entries(m).sort((a,b)=>b[0].localeCompare(a[0]));},[records]);
  const yearStat=useMemo(()=>{const m:any={};records.forEach(r=>{const k=r.date.slice(0,4);if(!m[k])m[k]={income:0,expense:0};if(r.type==='收入')m[k].income+=Number(r.amount);else m[k].expense+=Number(r.amount);});return Object.entries(m).sort((a,b)=>b[0].localeCompare(a[0]));},[records]);
  const checkinDays=useMemo(()=>{const bd:any={};records.forEach(r=>{if(!bd[r.date])bd[r.date]=[];bd[r.date].push(r);});const days=Object.keys(bd).sort((a,b)=>b.localeCompare(a));return {count:days.length,days};},[records]);

  const nowMonth=new Date().toISOString().slice(0,7);
  const monthExpense=records.filter(r=>r.type==='支出'&&r.date.startsWith(nowMonth)).reduce((a,r)=>a+Number(r.amount),0);
  const budgetPct=Math.min(100,Math.round(monthExpense/savings.budget?monthExpense/savings.budget*100:0));
  const overBudget=monthExpense>savings.budget;
  const prevMonth=new Date();prevMonth.setMonth(prevMonth.getMonth()-1);const pm=prevMonth.toISOString().slice(0,7);
  const prevExpense=records.filter(r=>r.type==='支出'&&r.date.startsWith(pm)).reduce((a,r)=>a+Number(r.amount),0);
  let trendTip='';if(prevExpense>0){const diff=Math.round((monthExpense-prevExpense)/prevExpense*100);trendTip=diff>0?`本月支出比上月多${Math.abs(diff)}%`:(diff<0?`本月支出比上月少${Math.abs(diff)}%`:'与上月持平');}

  const visible=filter==='全部'?records:records.filter(r=>r.cat===filter);
  const addWith=(amt:number,c:string)=>{const rec={id:Date.now()+'',type:'支出',amount:amt,cat:c,date,note:'',time:'12:00'};setRecords([rec,...records]);setShowAdd(false);};
  const add=()=>{const amt=parseFloat(amount);if(!amt||amt<=0){alert('请输入有效金额');return;}const rec={id:Date.now()+'',type,amount:amt,cat,date,note,time:'12:00'};setRecords([rec,...records]);setAmount('');setNote('');setShowAdd(false);};
  const del=(id:any)=>{const r=records.find(x=>x.id===id);if(r&&confirm('删除？可回收站恢复')){setTrash([r,...trash]);setRecords(records.filter(x=>x.id!==id));}};
  const restore=(id:any)=>{const r=trash.find(x=>x.id===id);if(r){setRecords([r,...records]);setTrash(trash.filter(x=>x.id!==id));}};
  const exportData=()=>{const blob=new Blob([JSON.stringify({money:records,savings,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='我的记账备份.json';a.click();};
  const setType2=(t:any)=>{setType(t);setCats(t==='收入'?INC_CATS:EXP_CATS);setCat((t==='收入'?INC_CATS:EXP_CATS)[0]);};

  let acc=0;const arcs=chartData.map(([c,v],i)=>{const pct=Number(v)/chartTotal;const f=acc*360;acc+=pct;return {color:RING_COLORS[i%RING_COLORS.length],from:f,to:acc*360,pct};});

  // 目标进度
  const shortPct=Math.min(100,Math.round(savings.saved/Math.max(savings.shortTarget,1)*100));
  const longPct=Math.min(100,Math.round(savings.saved/Math.max(savings.longTarget,1)*100));

  const GoalBar=({label,target,pct,color}:any)=>(<div style={{background:'#fff',border:'1px solid #E5ECDE',borderRadius:12,padding:12,marginTop:8}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700}}>{label}</span><button onClick={()=>{const v=prompt('设置'+label,target);const n=parseFloat(v||'');if(n>0)setSavings(s=>({...s,[label==='短目标'?'shortTarget':'longTarget']:n}));}} style={{background:'none',border:'none',color:'#5B8C5A',fontSize:12}}>¥{target} 改</button></div>
    <div style={{height:8,borderRadius:4,background:'#EDF2E8',overflow:'hidden',marginTop:8}}><div style={{height:'100%',width:pct+'%',background:color,borderRadius:4}}/></div>
    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#8A9785',marginTop:6}}>
      <span>已存 ¥{savings.saved} · {pct}%</span>
      <span>{pct>=100?'🎉达标':'还差 ¥'+(Math.max(target-savings.saved,0))}</span>
    </div>
  </div>);

  return (
    <div style={{minHeight:'100vh',padding:'16px 14px 80px',background:'#F4F7F0',color:'#3A4437',fontSize:15}}>
      <h1 style={{fontSize:21,fontWeight:800}}>记账</h1>
      <div style={{marginTop:8,fontSize:13,color:'#5B8C5A',fontStyle:'italic'}}>钱的本质是买自由 · 会存钱的人，才拥有选择权</div>

      <div style={{display:'flex',gap:8,marginTop:12}}>
        <div style={{flex:1,background:'#fff',border:'1px solid #E5ECDE',borderRadius:14,padding:10,textAlign:'center'}}><div style={{fontSize:10,color:'#8A9785'}}>收入</div><div style={{fontSize:15,fontWeight:800,color:'#5B8C5A'}}>+{income}</div></div>
        <div style={{flex:1,background:'#fff',border:'1px solid #E5ECDE',borderRadius:14,padding:10,textAlign:'center'}}><div style={{fontSize:10,color:'#8A9785'}}>支出</div><div style={{fontSize:15,fontWeight:800,color:'#E07A5F'}}>-{expense}</div></div>
        <div style={{flex:1,background:'#fff',border:'1px solid #E5ECDE',borderRadius:14,padding:10,textAlign:'center'}}><div style={{fontSize:10,color:'#8A9785'}}>结余</div><div style={{fontSize:15,fontWeight:800}}>{balance}</div></div>
        <div style={{flex:1,background:'#fff',border:'1px solid #5B8C5A',borderRadius:14,padding:10,textAlign:'center',cursor:'pointer'}} onClick={()=>setShowCheckin(true)} onTouchStart={()=>setShowCheckin(true)}><div style={{fontSize:10,color:'#8A9785'}}>打卡</div><div style={{fontSize:15,fontWeight:800}}>🔥{checkinDays.count}</div></div>
      </div>

      {/* 存款目标 */}
      <div style={{background:'#fff',border:'1px solid #E5ECDE',borderRadius:14,padding:14,marginTop:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:13,color:'#8A9785'}}>🏦 存款余额</span>
          <button onClick={()=>{const v=prompt('输入你的存款余额',String(savings.saved));const n=parseFloat(v||'');if(n>=0)setSavings(s=>({...s,saved:n}));}} style={{background:'#5B8C5A',border:'none',borderRadius:10,padding:'6px 12px',color:'#fff',fontSize:13}}>¥{savings.saved} 改</button>
        </div>
        <div style={{fontSize:22,fontWeight:800,margin:'8px 0 4px'}}>¥{savings.saved}</div>
        <div style={{fontSize:11,color:'#8A9785'}}>每月固定存 ¥{savings.monthSave}{savings.monthSave>0&&savings.saved<savings.shortTarget?`  · 还差 ${Math.ceil((savings.shortTarget-savings.saved)/savings.monthSave)} 个月`:' · 目标达成！'}</div>
        <GoalBar label="短目标" target={savings.shortTarget} pct={shortPct} color="#5B8C5A"/>
        <GoalBar label="长目标" target={savings.longTarget} pct={longPct} color="#3F8F82"/>
        {savings.saved>=savings.shortTarget&&<div style={{fontSize:13,color:'#5B8C5A',marginTop:8,textAlign:'center'}}>🎉 已达成短目标！你太棒了！</div>}
      </div>

      {/* 预算 */}
      <div style={{background:'#fff',border:'1px solid '+(overBudget?'#E07A5F':'#E5ECDE'),borderRadius:14,padding:12,marginTop:10}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span style={{color:'#8A9785'}}>本月预算</span><button onClick={()=>{const v=prompt('设置月预算',String(savings.budget));const n=parseFloat(v||'');if(n>0)setSavings(s=>({...s,budget:n}));}} style={{background:'none',border:'none',color:'#5B8C5A',fontSize:12}}>¥{savings.budget} 改</button></div>
        <div style={{fontSize:18,fontWeight:800,color:overBudget?'#E07A5F':(budgetPct>70?'#F2A65A':'#3A4437')}}>¥{monthExpense} <span style={{fontSize:12,color:'#8A9785'}}>/ ¥{savings.budget}</span></div>
        <div style={{height:8,borderRadius:4,background:'#EDF2E8',overflow:'hidden',marginTop:6}}><div style={{height:'100%',width:budgetPct+'%',background:overBudget?'#E07A5F':(budgetPct>70?'#F2A65A':'#5B8C5A')}}/></div>
        {overBudget?<div style={{fontSize:12,color:'#E07A5F',marginTop:6}}>⚠️已超预算</div>:<div style={{fontSize:12,color:'#8A9785',marginTop:6}}>已用{budgetPct}%{trendTip?('·'+trendTip):''}</div>}
      </div>

      {/* 快捷记账 */}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>
        {QUICK.map(([label,amt])=>(<button key={label as string} onClick={()=>addWith(parseFloat(amt as string),'餐饮')} onTouchStart={()=>addWith(parseFloat(amt as string),'餐饮')} style={{padding:'7px 11px',borderRadius:20,border:'1px solid #E5ECDE',background:'#fff',fontSize:12,color:'#3A4437',touchAction:'manipulation'}}>{label}¥{amt}</button>))}
      </div>

      <div style={{display:'flex',gap:10,marginTop:12}}>
        <div style={{flex:1,background:'#fff',border:'1px solid #E5ECDE',borderRadius:14,padding:10,textAlign:'center'}}>
          <div style={{fontSize:11,color:'#8A9785',marginBottom:6}}>{type==='支出'?'支出分类':'收入分类'}</div>
          <div style={{position:'relative',width:90,height:90,margin:'0 auto'}}><svg width="90" height="90" viewBox="0 0 42 42" style={{transform:'rotate(-90deg)'}}><circle cx="21" cy="21" r="15.9" fill="none" stroke="#EDF2E8" strokeWidth="6"/>{arcs.map((a,i)=>(<circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={a.color} strokeWidth="6" strokeDasharray={`${a.pct*100} ${100-a.pct*100}`} strokeDashoffset={-a.from/360*100}/>))}</svg><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800}}>{chartTotal}</div></div>
          {chartData.slice(0,3).map(([c,v],i)=>(<div key={c} style={{display:'flex',justifyContent:'space-between',fontSize:10,padding:'3px 0'}}><span><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:RING_COLORS[i%RING_COLORS.length],marginRight:4}}/>{c}</span><span style={{color:'#8A9785'}}>{v}</span></div>))}
        </div>
        <div style={{flex:1,background:'#fff',border:'1px solid #E5ECDE',borderRadius:14,padding:10}}>
          <div style={{fontSize:11,color:'#8A9785',marginBottom:6}}>近7天</div>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',height:80}}>{trend.map((d,i)=>(<div key={i} style={{textAlign:'center',flex:1}}><div style={{display:'flex',justifyContent:'center',gap:2,alignItems:'flex-end',height:66}}><div style={{width:6,background:'#E07A5F',height:d.eh+'px',borderRadius:2}}/><div style={{width:6,background:'#5B8C5A',height:d.ih+'px',borderRadius:2}}/></div><div style={{fontSize:9,color:'#8A9785',marginTop:3}}>{d.label}</div></div>))}</div>
        </div>
      </div>

      <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap',alignItems:'center'}}>
        <button onClick={()=>setView('月' as any)} style={{padding:'6px 12px',borderRadius:12,border:view==='月'?'2px solid #5B8C5A':'1px solid #E5ECDE',background:view==='月'?'#EDF6EB':'#fff',color:view==='月'?'#5B8C5A':'#3A4437',fontSize:12}}>月</button>
        <button onClick={()=>setView('年' as any)} style={{padding:'6px 12px',borderRadius:12,border:view==='年'?'2px solid #5B8C5A':'1px solid #E5ECDE',background:view==='年'?'#EDF6EB':'#fff',color:view==='年'?'#5B8C5A':'#3A4437',fontSize:12}}>年</button>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:'6px 10px',borderRadius:12,border:'1px solid #E5ECDE',fontSize:12,background:'#fff'}}><option value="全部">全部</option>{[...EXP_CATS,...INC_CATS].map(c=>(<option key={c} value={c}>{c}</option>))}</select>
      </div>
      {(view==='月'?monthStat:yearStat).map(([k,d]:any)=>(<div key={k} style={{display:'flex',justifyContent:'space-between',background:'#fff',border:'1px solid #E5ECDE',borderRadius:10,padding:8,marginTop:6,fontSize:12}}><span>{k}</span><span style={{color:'#5B8C5A'}}>收+{d.income}</span><span style={{color:'#E07A5F'}}>支-{d.expense}</span><span>余{d.income-d.expense}</span></div>))}

      <div style={{marginTop:12}}>
        <div style={{fontSize:13,color:'#8A9785',marginBottom:6}}>{filter==='全部'?'全部记录':filter}</div>
        {visible.length?visible.map(r=>(<div key={r.id} style={{background:'#fff',border:'1px solid #E5ECDE',borderRadius:12,padding:10,marginTop:6,display:'flex',alignItems:'center'}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{r.cat}{r.time?('·'+r.time):''}</div><div style={{fontSize:11,color:'#8A9785'}}>{r.date}{r.note?'·'+r.note:''}</div></div><div style={{fontSize:15,fontWeight:800,color:r.type==='收入'?'#5B8C5A':'#E07A5F',marginRight:8}}>{r.type==='收入'?'+':'-'}{r.amount}</div><button onClick={()=>del(r.id)} style={{background:'none',border:'none',color:'#E07A5F',fontSize:13}}>✕</button></div>)):<div style={{fontSize:12,color:'#A8B2A5',textAlign:'center',marginTop:16}}>没有记录</div>}
      </div>

      <button onClick={()=>setShowAdd(true)} onTouchStart={()=>setShowAdd(true)} style={{marginTop:14,width:'100%',height:48,borderRadius:14,border:'none',background:'#5B8C5A',color:'#fff',fontSize:15,fontWeight:700,touchAction:'manipulation'}}>＋记一笔</button>
      <button onClick={exportData} onTouchStart={exportData} style={{marginTop:8,width:'100%',height:42,borderRadius:14,border:'1.5px solid #5B8C5A',background:'#fff',color:'#5B8C5A',fontSize:14,fontWeight:700,touchAction:'manipulation'}}>📤导出备份</button>

      {showCheckin&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:20,display:'flex',alignItems:'flex-end'}} onClick={()=>setShowCheckin(false)}><div style={{background:'#FFFDF9',width:'100%',borderRadius:'24px 24px 0 0',padding:22,paddingBottom:40,maxHeight:'70vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}><div style={{fontSize:18,fontWeight:800,marginBottom:4}}>打卡明细</div><div style={{fontSize:12,color:'#8A9785',marginBottom:12}}>共{checkinDays.count}天有记账打卡</div>{checkinDays.days.map(day=>(<div key={day} style={{background:'#F7FAF4',borderRadius:12,padding:10,marginTop:8}}><div style={{fontSize:14,fontWeight:700}}>📅{day}</div>{records.filter(r=>r.date===day).map(r=>(<div key={r.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'3px 0'}}><span>{r.time||'--'}·{r.cat}</span><span style={{color:r.type==='收入'?'#5B8C5A':'#E07A5F'}}>{r.type==='收入'?'+':'-'}{r.amount}</span></div>))}</div>))}{!checkinDays.count&&<div style={{fontSize:13,color:'#A8B2A5',textAlign:'center',marginTop:20}}>还没有打卡记录</div>}</div></div>)}
      {showTrash&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:20,display:'flex',alignItems:'flex-end'}} onClick={()=>setShowTrash(false)}><div style={{background:'#FFFDF9',width:'100%',borderRadius:'24px 24px 0 0',padding:22,paddingBottom:40,maxHeight:'70vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}><div style={{fontSize:18,fontWeight:800,marginBottom:12}}>🗑回收站</div>{trash.length?trash.map(r=>(<div key={r.id} style={{display:'flex',alignItems:'center',background:'#F7FAF4',borderRadius:10,padding:10,marginTop:6}}><div style={{flex:1,fontSize:13}}>{r.cat}·{r.date}<span style={{color:r.type==='收入'?'#5B8C5A':'#E07A5F'}}>{r.type==='收入'?'+':'-'}{r.amount}</span></div><button onClick={()=>restore(r.id)} style={{background:'none',border:'2px solid #5B8C5A',borderRadius:10,padding:'4px 10px',color:'#5B8C5A',fontSize:12}}>恢复</button></div>)):<div style={{fontSize:13,color:'#A8B2A5',textAlign:'center',marginTop:20}}>回收站为空</div>}</div></div>)}
      {showAdd&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:20,display:'flex',alignItems:'flex-end'}} onClick={()=>setShowAdd(false)}><div style={{background:'#FFFDF9',width:'100%',borderRadius:'24px 24px 0 0',padding:22,paddingBottom:40}} onClick={e=>e.stopPropagation()}><div style={{fontSize:18,fontWeight:800,marginBottom:12}}>记一笔</div><div style={{display:'flex',gap:8,marginBottom:12}}>{['支出','收入'].map(t=>(<button key={t} onClick={()=>setType2(t)} style={{padding:'8px 16px',borderRadius:20,border:type===t?'2px solid #5B8C5A':'1px solid #E5ECDE',background:type===t?'#EDF6EB':'#fff',color:type===t?'#5B8C5A':'#3A4437',fontSize:14}}>{t}</button>))}</div><input value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9.]/g,''))} inputMode="decimal" placeholder="金额" style={{width:'100%',padding:13,borderRadius:14,border:'1.5px solid #E5ECDE',fontSize:16,background:'#fff',outline:'none',marginBottom:12}}/><div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>{cats.map(c=>(<button key={c} onClick={()=>setCat(c)} style={{padding:'6px 12px',borderRadius:14,border:cat===c?'2px solid #5B8C5A':'1px solid #E5ECDE',background:cat===c?'#EDF6EB':'#fff',color:cat===c?'#5B8C5A':'#3A4437',fontSize:13}}>{c}</button>))}</div><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%',padding:13,borderRadius:14,border:'1.5px solid #E5ECDE',fontSize:14,background:'#fff',outline:'none',marginBottom:12}}/><input value={note} onChange={e=>setNote(e.target.value)} placeholder="备注（可选）" style={{width:'100%',padding:13,borderRadius:14,border:'1.5px solid #E5ECDE',fontSize:14,background:'#fff',outline:'none',marginBottom:16}}/><button onTouchStart={add} onClick={add} style={{width:'100%',height:48,borderRadius:24,border:'none',background:'#5B8C5A',color:'#fff',fontSize:16,fontWeight:700,touchAction:'manipulation'}}>保存</button></div></div>)}

      <NavBar/>
    </div>
  );
}