'use client';
import { useEffect, useMemo, useState } from 'react';

function get(k:string){ if(typeof window==='undefined')return null; try{const r=localStorage.getItem(k);return r?JSON.parse(r):null}catch{return null} }

function NavBar({active}:{active:string}){
  const items=[['home','首页','/'],['money','记账','/money'],['ai','AI助手','/ai'],['profile','我的','/profile']];
  return (
    <nav style={{position:'fixed',bottom:0,left:0,right:0,height:60,background:'rgba(255,255,255,.97)',borderTop:'1px solid #E5ECDE',display:'flex',alignItems:'center',justifyContent:'space-around',zIndex:10}}>
      {items.map(([k,label,href])=>{const on=active===k;return <a key={k} href={href} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,fontSize:12,textDecoration:'none',color:on?'#5B8C5A':'#9B8A80',fontWeight:on?700:500}}><span style={{fontSize:22}}>{k==='home'?'🏠':k==='money'?'💰':k==='ai'?'🤖':'👤'}</span>{label}</a>;})}
    </nav>
  );
}

export default function Insights(){
  const [tasks,setTasks]=useState<any[]>([]);
  const [money,setMoney]=useState<any[]>([]);
  const [savings,setSavings]=useState<any>(null);
  const [counts,setCounts]=useState<any[]>([]);
  const [diary,setDiary]=useState<any[]>([]);
  const [branches,setBranches]=useState<any[]>([]);

  useEffect(()=>{
    const t=get('tasks_v1'); if(t&&t.length)setTasks(t);
    const m=get('money_v1'); if(m){ if(m.records)setMoney(m.records); if(m.savings)setSavings(m.savings);}
    const c=get('countdown_v1'); if(c&&c.length)setCounts(c);
    const d=get('diary_v1'); if(d&&d.length)setDiary(d);
    const b=get('branches_v1'); if(b&&b.length)setBranches(b);
  },[]);

  const done=tasks.filter((t:any)=>t.done).length;
  const total=tasks.length||1;
  const taskPct=Math.round(done/total*100);

  const income=money.filter(r=>r.type==='收入').reduce((a,r)=>a+Number(r.amount),0);
  const expense=money.filter(r=>r.type==='支出').reduce((a,r)=>a+Number(r.amount),0);
  const balance=income-expense;

  const trend=useMemo(()=>{const days=[];const now=new Date();for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push({label:'周'+'日一二三四五六'[d.getDay()],date:d.toISOString().slice(0,10),inc:0,exp:0});}money.forEach(r=>{const day=days.find(d=>d.date===r.date);if(day){if(r.type==='收入')day.inc+=Number(r.amount);else day.exp+=Number(r.amount);}});const m=Math.max(...days.map(d=>Math.max(d.inc,d.exp)),1);days.forEach(d=>{d.ih=Math.round(d.inc/m*70);d.eh=Math.round(d.exp/m*70);});return days;},[money]);

  const expByCat=useMemo(()=>{const m:any={};money.filter(r=>r.type==='支出').forEach(r=>{m[r.cat]=(m[r.cat]||0)+Number(r.amount)});return Object.entries(m).sort((a,b)=>b[1]-a[1]);},[money]);
  const checkinDays=new Set(money.map(r=>r.date)).size;
  const upcoming=counts.map((c:any)=>({...c,left:Math.ceil((new Date(c.date).getTime()-new Date().setHours(0,0,0,0))/86400000)})).filter(c=>c.left>=0).sort((a,b)=>a.left-b.left)[0];
  const savePct=savings?Math.min(100,Math.round(savings.saved/Math.max(savings.shortTarget,1)*100)):0;

  const BranchTypeColor:any={'重点推进':'#5B8C5A','保持运行':'#3F8F82','暂时放缓':'#C9B8AC'};
  const groupOrder=['重点推进','保持运行','暂时放缓'];

  const card:any={background:'#fff',border:'1px solid #E5ECDE',borderRadius:16,padding:14};

  return (
    <div style={{minHeight:'100vh',padding:'16px 14px 80px',background:'#F4F7F0',color:'#3A4437',fontSize:15}}>
      <h1 style={{fontSize:21,fontWeight:800}}>数据洞察</h1>
      <div style={{fontSize:12,color:'#8A9785',marginTop:4}}>小水獭帮你看看整体节奏</div>

      <div style={{...card,marginTop:14}}>
        <div style={{fontSize:13,color:'#8A9785',marginBottom:10}}>核心概览</div>
        <div style={{display:'flex',justifyContent:'space-around',textAlign:'center'}}>
          <div><div style={{fontSize:20,fontWeight:800,color:'#5B8C5A'}}>{taskPct}%</div><div style={{fontSize:11,color:'#8A9785',marginTop:2}}>任务</div></div>
          <div><div style={{fontSize:20,fontWeight:800,color:'#E07A5F'}}>{expense}</div><div style={{fontSize:11,color:'#8A9785',marginTop:2}}>支出</div></div>
          <div><div style={{fontSize:20,fontWeight:800,color:'#5B8C5A'}}>{balance>=0?'+':''}{balance}</div><div style={{fontSize:11,color:'#8A9785',marginTop:2}}>结余</div></div>
          <div><div style={{fontSize:20,fontWeight:800,color:'#3F8F82'}}>{diary.length}</div><div style={{fontSize:11,color:'#8A9785',marginTop:2}}>日记</div></div>
        </div>
      </div>

      {/* 支线概览 */}
      <div style={{...card,marginTop:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontSize:13,color:'#8A9785'}}>支线进展</span>
          <a href="/branches" style={{color:'#5B8C5A',fontSize:12,textDecoration:'none'}}>管理›</a>
        </div>
        {branches.length? groupOrder.map(g=>{
          const list=branches.filter(b=>b.type===g);
          if(!list.length) return null;
          const color=BranchTypeColor[g];
          return (
            <div key={g} style={{marginTop:6}}>
              <div style={{fontSize:12,color:color,fontWeight:700}}>{g} · {list.length}</div>
              {list.map(b=>(
                <div key={b.id} style={{display:'flex',alignItems:'center',gap:10,padding:'5px 0'}}>
                  <span>{b.icon||'📌'}</span>
                  <span style={{width:80,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.name}</span>
                  <div style={{flex:1,height:8,borderRadius:4,background:'#EDF2E8',overflow:'hidden'}}><div style={{height:'100%',width:b.pct+'%',background:color,borderRadius:4}}/></div>
                  <span style={{fontSize:13,fontWeight:700,color:color,width:36,textAlign:'right'}}>{b.pct}%</span>
                </div>
              ))}
            </div>
          );
        }) : <div style={{fontSize:12,color:'#A8B2A5',textAlign:'center',padding:10}}>还没有支线，去支线页添加一个吧</div>}
      </div>

      <div style={{...card,marginTop:12}}>
        <div style={{fontSize:13,color:'#8A9785',marginBottom:8}}>今日任务完成度</div>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:64,height:64,position:'relative',flexShrink:0}}><svg width="64" height="64" style={{transform:'rotate(-90deg)'}}><circle cx="32" cy="32" r="28" fill="none" stroke="#EDF2E8" strokeWidth="8"/><circle cx="32" cy="32" r="28" fill="none" stroke="#5B8C5A" strokeWidth="8" strokeLinecap="round" strokeDasharray={176} strokeDashoffset={176*(1-taskPct/100)}/></svg><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800}}>{taskPct}%</div></div>
          <div style={{fontSize:13,color:'#3A4437'}}>{done} / {tasks.length} 个任务完成{taskPct>0?' · 很棒！':' · 开始第一件吧'}</div>
        </div>
      </div>

      <div style={{...card,marginTop:12}}>
        <div style={{fontSize:13,color:'#8A9785',marginBottom:8}}>近7天收支趋势</div>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',height:80}}>{trend.map((d,i)=>(<div key={i} style={{textAlign:'center',flex:1}}><div style={{display:'flex',justifyContent:'center',gap:2,alignItems:'flex-end',height:66}}><div style={{width:7,background:'#E07A5F',height:d.eh+'px',borderRadius:2}}/><div style={{width:7,background:'#5B8C5A',height:d.ih+'px',borderRadius:2}}/></div><div style={{fontSize:9,color:'#8A9785',marginTop:3}}>{d.label}</div></div>))}</div>
      </div>

      <div style={{...card,marginTop:12}}>
        <div style={{fontSize:13,color:'#8A9785',marginBottom:8}}>支出分类</div>
        {expByCat.length? expByCat.slice(0,5).map(([c,v]:any)=>(
          <div key={c} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0'}}><span style={{width:70,fontSize:13}}>{c}</span><div style={{flex:1,height:10,borderRadius:5,background:'#EDF2E8',overflow:'hidden'}}><div style={{height:'100%',width:expense?Math.round(Number(v)/expense*100)+'%':'0%',background:'#E07A5F',borderRadius:5}}/></div><span style={{fontSize:13,fontWeight:700,width:50,textAlign:'right'}}>{v}</span></div>
        )) : <div style={{fontSize:12,color:'#A8B2A5',textAlign:'center',padding:10}}>暂无记账数据</div>}
      </div>

      {savings && (
        <div style={{...card,marginTop:12}}>
          <div style={{fontSize:13,color:'#8A9785',marginBottom:6}}>🏦 存款 ¥{savings.saved} / 短目标 ¥{savings.shortTarget}</div>
          <div style={{height:8,borderRadius:4,background:'#EDF2E8',overflow:'hidden'}}><div style={{height:'100%',width:savePct+'%',background:'#5B8C5A'}}/></div>
        </div>
      )}

      <div style={{...card,marginTop:12}}>
        <div style={{fontSize:13,color:'#8A9785',marginBottom:6}}>坚持度</div>
        <div style={{display:'flex',justifyContent:'space-around',textAlign:'center'}}>
          <div><div style={{fontSize:18,fontWeight:800,color:'#3F8F82'}}>{checkinDays}</div><div style={{fontSize:11,color:'#8A9785'}}>记账天数</div></div>
          <div><div style={{fontSize:18,fontWeight:800,color:'#3F8F82'}}>{diary.length}</div><div style={{fontSize:11,color:'#8A9785'}}>日记篇数</div></div>
          <div><div style={{fontSize:18,fontWeight:800,color:'#3F8F82'}}>{branches.length}</div><div style={{fontSize:11,color:'#8A9785'}}>支线总数</div></div>
        </div>
      </div>

      {upcoming && (
        <div style={{...card,marginTop:12}}>
          <div style={{fontSize:13,color:'#8A9785',marginBottom:6}}>最近重要的日子</div>
          <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:28}}>⏳</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:700}}>{upcoming.name}</div><div style={{fontSize:12,color:'#5B8C5A'}}>还有 {upcoming.left} 天 · {upcoming.date}</div></div></div>
        </div>
      )}

      <div style={{background:'#EAF4EA',border:'1px solid #CBE3CC',borderRadius:14,padding:14,marginTop:12,fontSize:13,color:'#3F5B3C',lineHeight:1.8}}>💡 <b>小提示：</b>
        {!tasks.length?' 去首页添加今日任务吧。':(taskPct<50?' 今日任务完成度还不到一半，挑一件先完成。':' 今日任务完成得很棒！')}
        {expense>income?' 支出已超过收入，注意控制。':' 收支状态健康。'}
        {branches.length?(' 你有 '+branches.length+' 个支线在推进，保持节奏。'):(' 添加一个支线，让生活更有条理吧。')}
      </div>

      <NavBar active="insights"/>
    </div>
  );
}