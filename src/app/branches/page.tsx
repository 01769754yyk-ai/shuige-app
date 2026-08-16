'use client';
import { useEffect, useState } from 'react';
const STORE='branches_v1';

function NavBar({active}:{active:string}){
  const items=[['home','首页','/'],['money','记账','/money'],['ai','AI助手','/ai'],['profile','我的','/profile']];
  return (
    <nav style={{position:'fixed',bottom:0,left:0,right:0,height:60,background:'rgba(255,255,255,.97)',borderTop:'1px solid #E5ECDE',display:'flex',alignItems:'center',justifyContent:'space-around',zIndex:10}}>
      {items.map(([k,label,href])=>{const on=active===k;return <a key={k} href={href} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,fontSize:12,textDecoration:'none',color:on?'#5B8C5A':'#9B8A80',fontWeight:on?700:500}}><span style={{fontSize:22}}>{k==='home'?'🏠':k==='money'?'💰':k==='ai'?'🤖':'👤'}</span>{label}</a>;})}
    </nav>
  );
}

const TYPE_COLORS:any={
  '重点推进':{color:'#5B8C5A',bg:'#EAF4EA'},
  '保持运行':{color:'#3F8F82',bg:'#E8F4F1'},
  '暂时放缓':{color:'#C9B8AC',bg:'#F5EFE8'},
};
const ICONS=['📖','🏃','😴','💼','💻','🎬','🎨','📚'];

export default function Branches(){
  const [items,setItems]=useState<any[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [name,setName]=useState('');
  const [desc,setDesc]=useState('');
  const [type,setType]=useState('重点推进');
  const [pct,setPct]=useState('50');
  const [icon,setIcon]=useState('📖');
  const [editId,setEditId]=useState<string|null>(null);

  useEffect(()=>{ try{ const raw=localStorage.getItem(STORE); if(raw){ const arr=JSON.parse(raw); if(Array.isArray(arr)&&arr.length) setItems(arr); } }catch(e){} setLoaded(true); },[]);
  useEffect(()=>{ if(!loaded)return; try{ localStorage.setItem(STORE, JSON.stringify(items)); }catch(e){} },[items,loaded]);

  const save=()=>{
    if(!name.trim()){ alert('给支线起个名字'); return; }
    const rec={id:editId||Date.now()+'',name:name.trim(),desc:desc.trim(),type,icon,pct:Math.min(100,Math.max(0,parseInt(pct)||0))};
    if(editId) setItems(items.map(i=>i.id===editId?rec:i));
    else setItems([rec,...items]);
    setName('');setDesc('');setType('重点推进');setPct('50');setIcon('📖');setEditId(null);setShowAdd(false);
  };
  const del=(id:any)=>{ if(confirm('删除这个支线？')) setItems(items.filter(i=>i.id!==id)); };
  const openEdit=(i:any)=>{ setEditId(i.id);setName(i.name);setDesc(i.desc);setType(i.type);setPct(String(i.pct));setIcon(i.icon);setShowAdd(true); };

  const groups=['重点推进','保持运行','暂时放缓'];
  const done=tasksTotal(items);

  function tasksTotal(){ return items.length; }

  return (
    <div style={{minHeight:'100vh',padding:'16px 14px 80px',background:'#F4F7F0',color:'#3A4437',fontSize:15}}>
      <h1 style={{fontSize:21,fontWeight:800}}>支线</h1>
      <div style={{fontSize:12,color:'#8A9785',marginTop:4}}>把生活分成几个支线，慢慢推进</div>

      <button onTouchStart={()=>{setEditId(null);setShowAdd(true)}} onClick={()=>{setEditId(null);setShowAdd(true)}} style={{marginTop:14,width:'100%',height:48,borderRadius:14,border:'none',background:'#5B8C5A',color:'#fff',fontSize:15,fontWeight:700,touchAction:'manipulation'}}>＋ 新增支线</button>

      {groups.map(g=>{
        const list=items.filter(i=>i.type===g);
        const tc=TYPE_COLORS[g];
        return (
          <div key={g} style={{marginTop:18}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:tc.color}}/>
              <span style={{fontSize:14,fontWeight:700}}>{g}</span>
              <span style={{fontSize:11,color:'#8A9785'}}>{list.length}</span>
            </div>
            {list.length? list.map(i=>(
              <div key={i.id} style={{background:'#fff',border:'1px solid #E5ECDE',borderRadius:14,padding:12,marginTop:8}}>
                <div style={{display:'flex',alignItems:'center'}}>
                  <span style={{width:38,height:38,borderRadius:10,background:tc.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginRight:10}}>{i.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700}}>{i.name}</div>
                    {i.desc&&<div style={{fontSize:12,color:'#8A9785',marginTop:2}}>{i.desc}</div>}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginTop:10}}>
                  <div style={{flex:1,height:8,borderRadius:4,background:'#EDF2E8',overflow:'hidden'}}><div style={{height:'100%',width:i.pct+'%',background:tc.color,borderRadius:4}}/></div>
                  <span style={{fontSize:14,fontWeight:800,color:tc.color}}>{i.pct}%</span>
                  <button onClick={()=>openEdit(i)} style={{background:'none',border:'none',color:'#5B8C5A',fontSize:13}}>编辑</button>
                  <button onClick={()=>del(i.id)} style={{background:'none',border:'none',color:'#E07A5F',fontSize:13}}>✕</button>
                </div>
              </div>
            )) : <div style={{fontSize:12,color:'#A8B2A5',padding:'8px 0'}}>暂无</div>}
          </div>
        );
      })}

      {showAdd && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:20,display:'flex',alignItems:'flex-end'}} onClick={()=>setShowAdd(false)}>
          <div style={{background:'#FFFDF9',width:'100%',borderRadius:'24px 24px 0 0',padding:22,paddingBottom:40}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:18,fontWeight:800,marginBottom:14}}>{editId?'编辑支线':'新增支线'}</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="支线名（如：六级的英语）" style={{width:'100%',padding:13,borderRadius:14,border:'1.5px solid #E5ECDE',fontSize:15,background:'#fff',outline:'none',marginBottom:12}}/>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="描述（可选）" style={{width:'100%',padding:13,borderRadius:14,border:'1.5px solid #E5ECDE',fontSize:14,background:'#fff',outline:'none',marginBottom:12}}/>
            <div style={{display:'flex',gap:6,marginBottom:12}}>{groups.map(g=>(<button key={g} onClick={()=>setType(g)} style={{padding:'7px 12px',borderRadius:16,border:type===g?'2px solid '+TYPE_COLORS[g].color:'1px solid #E5ECDE',background:type===g?TYPE_COLORS[g].bg:'#fff',color:type===g?TYPE_COLORS[g].color:'#3A4437',fontSize:13}}>{g}</button>))}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>{ICONS.map(c=>(<button key={c} onClick={()=>setIcon(c)} style={{fontSize:22,opacity:icon===c?1:.3,background:'none',border:'none'}}>{c}</button>))}</div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <span style={{fontSize:13,color:'#8A9785'}}>进度</span>
              <input value={pct} onChange={e=>setPct(e.target.value.replace(/\D/g,''))} placeholder="50" style={{width:60,padding:'8px',borderRadius:10,border:'1.5px solid #E5ECDE',fontSize:14,textAlign:'center',background:'#fff',outline:'none'}}/>
              <span style={{fontSize:13}}>%</span>
            </div>
            <div style={{display:'flex',gap:8,marginTop:4}}>
              <button onClick={()=>setShowAdd(false)} style={{flex:1,height:46,borderRadius:23,border:'1px solid #E5ECDE',background:'#F4F7F0',color:'#3A4437',fontSize:15}}>取消</button>
              <button onTouchStart={save} onClick={save} style={{flex:1,height:46,borderRadius:23,border:'none',background:'#5B8C5A',color:'#fff',fontSize:15,fontWeight:700,touchAction:'manipulation'}}>保存</button>
            </div>
          </div>
        </div>
      )}

      <NavBar active="branches"/>
    </div>
  );
}