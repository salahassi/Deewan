'use client';
import React, {useEffect, useRef, useState} from 'react';
import {Bold, Italic, Underline, List, ListOrdered, Quote, Link2, Undo2, Redo2, Eraser} from 'lucide-react';

const escape = (v:string) => v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function safeHtml(value:string):string {
  if (!/<\/?[a-z][\s\S]*>/i.test(value)) return value.split('\n\n').map(p=>`<p>${escape(p).replaceAll('\n','<br>')}</p>`).join('');
  if (typeof DOMParser === 'undefined') return escape(value);
  const doc = new DOMParser().parseFromString(value,'text/html');
  const allowed = new Set(['P','BR','DIV','STRONG','B','EM','I','U','H2','H3','UL','OL','LI','BLOCKQUOTE','A']);
  const walk = (node:Node):string => {
    if(node.nodeType===3)return escape(node.textContent||'');
    if(!(node instanceof Element))return '';
    if(['SCRIPT','STYLE','IFRAME','OBJECT','SVG','MATH'].includes(node.tagName))return '';
    const children=Array.from(node.childNodes).map(walk).join('');
    if(!allowed.has(node.tagName))return children;
    const tag=node.tagName.toLowerCase();
    if(tag==='br')return '<br>';
    if(tag==='a'){
      const href=node.getAttribute('href')||'';
      if(!/^(https?:\/\/|mailto:|tel:)/i.test(href))return children;
      return `<a href="${escape(href).replaceAll('"','&quot;')}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    }
    return `<${tag}>${children}</${tag}>`;
  };
  return Array.from(doc.body.childNodes).map(walk).join('');
}
export function plainText(html:string):string {
  return html.replace(/<[^>]*>/g,' ').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&nbsp;',' ').replace(/\s+/g,' ').trim();
}
export function RichBody({value}:{value:string}) {return <div className="prose rich-body" dangerouslySetInnerHTML={{__html:safeHtml(value)}}/>;}

export function RichEditor({value,onChange,label,maxLength=20000}:{value:string;onChange:(v:string)=>void;label:string;maxLength?:number}) {
  const editor=useRef<HTMLDivElement>(null);
  const [link,setLink]=useState(''),[linkOpen,setLinkOpen]=useState(false);
  const selection=useRef<Range|null>(null);
  useEffect(()=>{if(editor.current&&document.activeElement!==editor.current&&safeHtml(value)!==editor.current.innerHTML)editor.current.innerHTML=safeHtml(value);},[value]);
  const sync=()=>onChange(safeHtml(editor.current?.innerHTML||''));
  const command=(cmd:string,arg?:string)=>{editor.current?.focus();document.execCommand(cmd,false,arg);sync();};
  const tools=[['bold','عريض',Bold],['italic','مائل',Italic],['underline','تحته خط',Underline],['insertUnorderedList','قائمة نقطية',List],['insertOrderedList','قائمة مرقمة',ListOrdered],['formatBlock','اقتباس',Quote],['removeFormat','مسح التنسيق',Eraser],['undo','تراجع',Undo2],['redo','إعادة',Redo2]] as const;
  return <div className="field rich-field"><span id={'label-'+label}>{label}</span><div className="rich-editor"><div className="rich-toolbar" role="toolbar" aria-label={'تنسيق '+label}>
    <select aria-label={'نمط '+label} defaultValue="p" onChange={e=>command('formatBlock',e.target.value)}><option value="p">فقرة</option><option value="h2">عنوان كبير</option><option value="h3">عنوان فرعي</option></select>
    {tools.map(([cmd,title,Icon])=><button key={cmd} type="button" aria-label={title} title={title} onMouseDown={e=>e.preventDefault()} onClick={()=>command(cmd,cmd==='formatBlock'?'blockquote':undefined)}><Icon size={17}/></button>)}
    <button type="button" aria-label="إضافة رابط" title="إضافة رابط" onMouseDown={e=>e.preventDefault()} onClick={()=>{const s=window.getSelection();selection.current=s?.rangeCount?s.getRangeAt(0).cloneRange():null;setLinkOpen(v=>!v);}}><Link2 size={17}/></button>
  </div>{linkOpen&&<div className="rich-link"><input type="url" aria-label="رابط النص" placeholder="https://…" value={link} onChange={e=>setLink(e.target.value)} dir="ltr"/><button type="button" className="btn compact" onClick={()=>{if(!/^https?:\/\//i.test(link))return;editor.current?.focus();if(selection.current){const s=window.getSelection();s?.removeAllRanges();s?.addRange(selection.current);}command('createLink',link);setLinkOpen(false);setLink('');}}>إدراج الرابط</button></div>}
  <div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label={label} className="rich-input" onInput={sync} onBlur={sync} onPaste={e=>{e.preventDefault();document.execCommand('insertHTML',false,safeHtml(e.clipboardData.getData('text/html')||e.clipboardData.getData('text/plain')));sync();}}/>
  <div className="rich-count">{plainText(value).length.toLocaleString('ar-SA')} / {maxLength.toLocaleString('ar-SA')} حرف</div></div></div>;
}
