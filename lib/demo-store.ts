import {initial,DemoState} from './demo-data';
declare const __DIWAN_STATIC__:boolean;
export const localMode=typeof __DIWAN_STATIC__!=='undefined'&&__DIWAN_STATIC__;
const key='haqbani-diwan-demo-v2';
export function normalizeState(state:DemoState):DemoState {
  return {...state,settings:{...initial.settings,...state.settings},posts:state.posts.map(p=>({...p,sections:p.sections?.length?p.sections:[p.section]}))};
}
export function readLocal(){
  const raw=localStorage.getItem(key);
  if(!raw)return {state:structuredClone(initial),revision:0};
  const v=JSON.parse(raw);return {...v,state:normalizeState(v.state)};
}
export function writeLocal(state:DemoState,revision:number){
  const current=readLocal();if(current.revision!==revision)throw new Error('تغيّرت البيانات في تبويب آخر. أعد المحاولة.');
  const next={state,revision:revision+1};localStorage.setItem(key,JSON.stringify(next));return next;
}
function db():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('haqbani-diwan-files',1);request.onupgradeneeded=()=>request.result.createObjectStore('receipts');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function saveReceipt(file:File){
  if(!['image/png','image/jpeg','image/webp','application/pdf'].includes(file.type))throw new Error('ارفع صورة PNG أو JPG أو WEBP أو ملف PDF');
  if(file.size>5*1024*1024)throw new Error('حجم الوصل الأقصى 5 ميغابايت');
  const database=await db(),id='local:'+Array.from(crypto.getRandomValues(new Uint8Array(16)),v=>v.toString(16).padStart(2,'0')).join('');
  await new Promise<void>((resolve,reject)=>{const tx=database.transaction('receipts','readwrite');tx.objectStore('receipts').put(file,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});database.close();return {key:id,filename:file.name};
}
export async function readReceipt(id:string){const database=await db();const blob=await new Promise<Blob>((resolve,reject)=>{const req=database.transaction('receipts').objectStore('receipts').get(id);req.onsuccess=()=>req.result?resolve(req.result):reject(new Error('الملف غير موجود في هذا المتصفح'));req.onerror=()=>reject(req.error);});database.close();return URL.createObjectURL(blob);}
export const imageData=(file:File,maxEdge=1200):Promise<string>=>new Promise((resolve,reject)=>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>1024*1024)return reject(new Error('استخدم PNG أو JPG أو WEBP بحجم لا يتجاوز 1 ميغابايت'));
 const url=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{try{const canvas=document.createElement('canvas'),scale=Math.min(1,maxEdge/Math.max(img.width,img.height));canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d')!.drawImage(img,0,0,canvas.width,canvas.height);const result=canvas.toDataURL('image/webp',0.82);if(result.length>300000)throw new Error('الصورة كبيرة بعد المعالجة؛ اختر صورة أبسط أو أصغر');resolve(result);}catch(e){reject(e);}finally{URL.revokeObjectURL(url);}};
 img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('تعذر قراءة الصورة'));};img.src=url;
});
