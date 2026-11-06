import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './config.js';
import {sample,validate} from './data.js';
export const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
export const isLocal=new URLSearchParams(location.search).get('local')==='1';
export const LOCAL_KEY='subtrack.local.workspace.v1';
export const isDemo=new URLSearchParams(location.search).get('demo')==='1';
const DEMO_KEY='subtrack.cloud.demo.v1';let version=null,user=null;
function checked(data){if(!data||!Array.isArray(data.subscriptions)||!Array.isArray(data.history))throw Error('Le contenu enregistré est invalide.');const subscriptions=data.subscriptions.map(validate);if(new Set(subscriptions.map(s=>s.id)).size!==subscriptions.length)throw Error('Des identifiants sont dupliqués.');return {...data,subscriptions,history:data.history.slice(0,50)}}
export async function initialise(){
 if(isLocal){const raw=localStorage.getItem(LOCAL_KEY);const data=raw?checked(JSON.parse(raw)):{subscriptions:[],history:[],demo:false};return {user:null,data,demo:false,local:true}}
 if(isDemo){let data;try{const raw=localStorage.getItem(DEMO_KEY);data=raw?checked(JSON.parse(raw)):null}catch{}if(!data){const subscriptions=sample();data={subscriptions,history:[],demo:true,demoIds:subscriptions.map(s=>s.id)};try{localStorage.setItem(DEMO_KEY,JSON.stringify(data))}catch{}}return {user:null,data,demo:true}}
 const {data:auth,error}=await supabase.auth.getUser();
 if(error||!auth.user){location.replace('./connexion.html');throw Error('Connexion requise.');}
 user=auth.user;
 const {data,error:readError}=await supabase.from('workspaces').select('data,version').eq('user_id',user.id).maybeSingle();
 if(readError)throw Error('Impossible de charger vos abonnements. Réessayez dans un instant.');
 if(data){version=data.version;return {user,data:checked(data.data),demo:false}}
 const empty={subscriptions:[],history:[],demo:false};const {data:created,error:createError}=await supabase.from('workspaces').insert({user_id:user.id,data:empty}).select('data,version').single();
 if(createError){if(createError.code==='23505')return initialise();throw Error('Impossible de créer votre espace de sauvegarde.');}
 version=created.version;return {user,data:created.data,demo:false};
}
export async function saveRemote(next){checked(next);if(isLocal){localStorage.setItem(LOCAL_KEY,JSON.stringify(next));return}if(isDemo){localStorage.setItem(DEMO_KEY,JSON.stringify(next));return}const {data,error}=await supabase.from('workspaces').update({data:next}).eq('user_id',user.id).eq('version',version).select('version').maybeSingle();if(error)throw Error('La sauvegarde a échoué. Vos modifications ne sont pas enregistrées. Vérifiez votre connexion et réessayez.');if(!data)throw Error('Votre espace a changé dans un autre onglet ou appareil. Rechargez la page avant de réessayer pour éviter d’écraser ces changements.');version=data.version;}
export async function signOut(){const {error}=await supabase.auth.signOut({scope:'local'});if(error)throw error;location.replace('./connexion.html')}
export function preserveDemo(){if(!isDemo&&!isLocal)return;for(const a of document.querySelectorAll('a[href]')){const h=a.getAttribute('href');if(h?.startsWith('./')&&/\.html(?:\?|$)/.test(h)){const url=new URL(h,location.href);if(url.pathname.endsWith('connexion.html'))continue;url.searchParams.set(isLocal?'local':'demo','1');a.href=url.href}}}

