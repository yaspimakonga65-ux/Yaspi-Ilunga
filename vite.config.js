import {readdirSync,writeFileSync} from 'node:fs';
import {defineConfig} from 'vite';import {resolve} from 'node:path';
export default defineConfig({
 server:{allowedHosts:['terminal.local']},
 plugins:[{name:'subtrack-offline-shell',closeBundle(){
  const files=['./connexion.html','./index.html','./abonnements.html','./import.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png',...readdirSync('dist/assets').map(f=>'./assets/'+f)];
  writeFileSync('dist/sw.js',`const CACHE='subtrack-shell-${Date.now()}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('subtrack-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
 const shell=new URL(u.pathname,self.location.origin);if(!FILES.some(f=>new URL(f,self.location.href).href===shell.href))return;
 // Only the public app shell is cached, never API responses, credentials or user data.
 e.respondWith(fetch(e.request).catch(()=>caches.match(shell.href).then(r=>r||Response.error())));
});`);
 }}],
 build:{rollupOptions:{input:{overview:resolve(import.meta.dirname,'index.html'),subscriptions:resolve(import.meta.dirname,'abonnements.html'),imports:resolve(import.meta.dirname,'import.html'),auth:resolve(import.meta.dirname,'connexion.html')}}}
});
