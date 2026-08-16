'use client';
import { useEffect, useState } from 'react';
const STORE='countdown_v1';   // 独立的 key，简单直接

export default function Countdown(){
  const [items,setItems]=useState<any[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [name,setName]=useState('');
  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [showAdd,setShowAdd]=useState(false);

  // 读取（只读一次）
  useEffect(()=>{
    try{ const raw=localStorage.getItem(STORE); if(raw){ const arr=JSON.parse(raw); if(Array.isArray(arr)&&arr.length) setItems(arr); } }catch(e){}
    setLoaded(true);
  },[]);

  // 写入
  useEffect(()=>{
    if(!loaded) return;
    try{ localStorage.setItem(STORE, JSON.stringify(items)); }catch(e){}
  },[items,loaded]);

  const daysLeft=(target:string)=>{ const diff=new Date(target).getTime()-new Date().setHours(0,0,0,0); return Math.ceil(diff/86400000); };
  const add=()=>{ if(!name.trim()){alert('输入事件名');return;} setItems([{id:Date.now()+'',name:name.trim(),date},...items]); setName(''); setShowAdd(false); };
  const del=(id:any)=>{ if(confirm('删除这个倒数日？')) setItems(items.filter(i=>i.id!==id)); };

  return (
    <div style={{minHeight:'100vh',padding:'16px 14px 80px',background:'#F4F7F0',color:'#3A4437',fontSize:15}}>
      <h1 style={{fontSize:21,fontWeight:800}}>倒数日</h1>
      <div style={{fontSize:12,color:'#8A9785',marginTop:4}}>重要的日子，都在这里倒计时</div>
      <div style={{display:'flex',gap:4,marginTop:8,maxWidth:120}}><div style={{fontSize:10,color:'#A8B2A5'}}>当前 {items.length} 条（独立存储测试）</div></div>
      <button onTouchStart={()=>setShowAdd(true)} onClick={()=>setShowAdd(true)} style={{marginTop:10,width:'100%',height:48,borderRadius:14,border:'none',background:'#5B8C5A',color:'#fff',fontSize:15,fontWeight:700,touchAction:'manipulation'}}>＋ 添加倒数日</button>
      <div style={{marginTop:14}}>
        {items.length? items.map(i=>{ const d=daysLeft(i.date); return (
          <div key={i.id} style={{background:'#fff',border:'1px solid #E5ECDE',borderRadius:16,padding:14,marginTop:8,display:'flex',alignItems:'center'}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'#EAF4EA',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginRight:12}}><span style={{fontSize:17,fontWeight:800,color:'#5B8C5A'}}>{d<0?Math.abs(d):d}</span></div>
            <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700}}>{i.name}</div><div style={{fontSize:12,color:'#8A9785',marginTop:2}}>{i.date} · {d<0?`已过${Math.abs(d)}天`:(d===0?'今天！':`还有${d}天`)}</div></div>
            <button onClick={()=>del(i.id)} style={{background:'none',border:'none',color:'#E07A5F',fontSize:14}}>✕</button>
          </div> ); 
        }) : <div style={{fontSize:13,color:'#A8B2A5',textAlign:'center',marginTop:30}}>还没有倒数日，加一个吧～</div>}
      </div>
      {showAdd && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:20,display:'flex',alignItems:'flex-end'}} onClick={()=>setShowAdd(false)}>
          <div style={{background:'#FFFDF9',width:'100%',borderRadius:'24px 24px 0 0',padding:22,paddingBottom:40}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:18,fontWeight:800,marginBottom:14}}>添加倒数日</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="事件（如：六级考试、我的生日）" style={{width:'100%',padding:13,borderRadius:14,border:'1.5px solid #E5ECDE',fontSize:15,background:'#fff',outline:'none',marginBottom:12}}/>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%',padding:13,borderRadius:14,border:'1.5px solid #E5ECDE',fontSize:15,background:'#fff',outline:'none',marginBottom:16}}/>
            <button onTouchStart={add} onClick={add} style={{width:'100%',height:48,borderRadius:24,border:'none',background:'#5B8C5A',color:'#fff',fontSize:16,fontWeight:700,touchAction:'manipulation'}}>保存</button>
          </div>
        </div>
      )}
    </div>
  );
}