'use client';
import React,{useState} from 'react';
import {Megaphone,Pause,Play} from 'lucide-react';
import {DemoState} from '@/lib/demo-data';
export function NewsTicker({settings}:{settings:DemoState['settings']}){
 const [paused,setPaused]=useState(false);const items=settings.tickerItems.filter(n=>n.enabled&&n.text.trim());
 if(!settings.tickerEnabled||!items.length)return null;
 return <aside className={'news-ticker '+(settings.tickerPause?'hover-pause':'')+(paused?' paused':'')} aria-label="الشريط الإخباري" style={{'--ticker-duration':`${settings.tickerSpeed}s`,'--ticker-direction':settings.tickerDirection==='right'?'reverse':'normal'} as React.CSSProperties}><div className="ticker-label"><Megaphone size={16}/><b>{settings.tickerTitle}</b></div><div className="ticker-window"><div className="ticker-track">{[0,1].map(copy=><div className="ticker-group" key={copy} aria-hidden={copy===1}>{items.map(n=><span className="ticker-item" key={n.id}><i/>{n.url?<a href={n.url} target="_blank" rel="noopener noreferrer" tabIndex={copy===1?-1:0}>{n.text}</a>:n.text}</span>)}</div>)}</div></div><button type="button" className="ticker-pause" aria-label={paused?'تشغيل الشريط الإخباري':'إيقاف الشريط الإخباري'} onClick={()=>setPaused(v=>!v)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button></aside>;
}
