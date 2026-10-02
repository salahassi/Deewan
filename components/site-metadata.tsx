'use client';
import {useEffect} from 'react';
import {DemoState} from '@/lib/demo-data';
export function SiteMetadata({settings:s}:{settings:DemoState['settings']}){
 useEffect(()=>{
   document.title=s.seoTitle||s.siteName;
   const meta=(attr:string,key:string,value:string)=>{let el=document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el);}el.content=value;};
   meta('name','description',s.seoDescription);meta('name','keywords',s.seoKeywords);meta('name','robots',s.robotsIndex?'index,follow':'noindex,nofollow');
   meta('property','og:title',s.seoTitle);meta('property','og:description',s.seoDescription);meta('property','og:site_name',s.siteName);meta('property','og:type','website');meta('property','og:image',s.seoImage);meta('property','og:url',s.canonicalUrl);
   meta('name','twitter:card',s.seoImage?'summary_large_image':'summary');meta('name','twitter:title',s.seoTitle);meta('name','twitter:description',s.seoDescription);meta('name','twitter:image',s.seoImage);meta('name','twitter:site',s.twitterHandle);
   let canonical=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical);}canonical.href=s.canonicalUrl;
   let icon=document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon);}if(!icon.dataset.original)icon.dataset.original=icon.href;icon.href=s.favicon||icon.dataset.original;
   for(const [key,val] of Object.entries({'--diwan-primary':s.primaryColor,'--primary':s.primaryColor,'--diwan-accent':s.accentColor,'--diwan-background':s.backgroundColor,'--diwan-text':s.textColor,'--foreground':s.textColor,'--ring':s.accentColor}))document.documentElement.style.setProperty(key,val);
   document.body.style.backgroundColor=s.backgroundColor;
 },[s]);return null;
}
