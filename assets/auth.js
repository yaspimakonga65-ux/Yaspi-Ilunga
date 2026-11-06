import {supabase} from './cloud.js';
import {authError,submitAuth} from './auth-actions.js';
const $=id=>document.getElementById(id);
const recovery=new URLSearchParams(location.search).has('recovery')||location.hash.includes('type=recovery');
let mode='login',busy=false;
const labels={login:['Heureux de vous retrouver.','Me connecter'],signup:['Créer mon espace','Créer mon compte'],reset:['Retrouver mon compte','Envoyer le lien de récupération'],update:['Nouveau mot de passe','Enregistrer mon mot de passe']};
function message(text,error=false){$('authMessage').textContent=text;$('authMessage').className=error?'callout error':'callout';$('authMessage').hidden=false}
function changeMode(next){
 if(busy)return;mode=next;
 [$('authTitle').textContent,$('authSubmit').textContent]=labels[mode];
 const needsPassword=mode!=='reset',needsConfirmation=mode==='signup'||mode==='update';
 $('passwordField').hidden=!needsPassword;$('password').required=needsPassword;$('password').minLength=needsConfirmation?10:1;
 $('confirmField').hidden=!needsConfirmation;$('confirmPassword').required=needsConfirmation;
 $('email').closest('label').hidden=mode==='update';$('email').required=mode!=='update';
 $('password').autocomplete=needsConfirmation?'new-password':'current-password';$('passwordHint').hidden=!needsConfirmation;
 $('showLogin').classList.toggle('active',mode==='login');$('showSignup').classList.toggle('active',mode==='signup');$('authMessage').hidden=true;
 $('password').value='';$('confirmPassword').value='';
}
$('showLogin').onclick=()=>changeMode('login');$('showSignup').onclick=()=>changeMode('signup');$('forgotPassword').onclick=()=>changeMode('reset');
$('showPassword').onclick=()=>{const show=$('password').type==='password';$('password').type=show?'text':'password';$('showPassword').textContent=show?'Masquer':'Afficher'};
const redirectTo=['localhost','127.0.0.1'].includes(location.hostname)?'https://subtrack-yaspi.vercel.app/connexion.html':new URL('./connexion.html',location.href).href;
function setBusy(value){busy=value;for(const id of ['authSubmit','resendEmail','showLogin','showSignup','forgotPassword'])$(id).disabled=value;}
$('authForm').onsubmit=async e=>{
 e.preventDefault();setBusy(true);$('authMessage').hidden=true;
 try{
  const data=await submitAuth(supabase.auth,{mode,email:$('email').value.trim(),password:$('password').value,confirmation:$('confirmPassword').value,redirectTo});
  if(mode==='update'){
   // Password recovery does not enter the application until the password is saved.
   await supabase.auth.signOut({scope:'local'});setBusy(false);changeMode('login');history.replaceState(null,'',location.pathname);message('Mot de passe modifié. Connectez-vous avec votre nouveau mot de passe.');
  }else if(mode==='reset')message('Si un compte correspond à cette adresse, un lien de récupération vous sera envoyé. Vérifiez aussi les courriers indésirables.');
  else if(data?.session)location.replace('./index.html');
  else message('Consultez votre boîte e-mail et confirmez votre adresse pour terminer l’inscription, puis connectez-vous. Si le compte existe déjà, utilisez la connexion ou la récupération de mot de passe.');
 }catch(error){message(error.code==='form_password'?error.message:authError(error),true)}finally{setBusy(false)}
};
$('resendEmail').onclick=async()=>{
 if(!$('email').reportValidity())return;setBusy(true);
 try{const {error}=await supabase.auth.resend({type:'signup',email:$('email').value.trim(),options:{emailRedirectTo:redirectTo}});if(error)throw error;message('Si une inscription attend une confirmation, un nouveau lien vous sera envoyé. Vérifiez vos e-mails.')}catch(error){message(authError(error),true)}finally{setBusy(false)}
};
supabase.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY'){setBusy(false);changeMode('update')}});
changeMode(new URLSearchParams(location.search).get('mode')==='signup'?'signup':'login');
const hash=new URLSearchParams(location.hash.slice(1));
if(hash.has('error')||new URLSearchParams(location.search).has('error'))message('Ce lien de confirmation ou de récupération est invalide ou expiré. Demandez un nouveau lien.',true);
try{
 const {data:{session},error}=await supabase.auth.getSession();if(error)throw error;
 if(recovery){if(session)changeMode('update');else {changeMode('reset');message('Demandez un nouveau lien de récupération pour choisir votre mot de passe.',true)}}
 else if(session){const {data:{user},error}=await supabase.auth.getUser();if(user&&!error)location.replace('./index.html')}
}catch(error){message(authError(error),true)}
window.addEventListener('offline',()=>message('Vous êtes hors connexion. Utilisez « Sur cet appareil » pour continuer localement.',true));
