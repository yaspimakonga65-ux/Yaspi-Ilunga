let prompt;
const button=document.getElementById('installApp'),hint=document.getElementById('installHint');
if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;if(button)button.textContent='Installer SubTrack sur cet appareil'});
window.addEventListener('appinstalled',()=>{prompt=null;if(button)button.hidden=true});
if(button)button.onclick=async()=>{
 if(prompt){await prompt.prompt();await prompt.userChoice;prompt=null;return}
 hint.hidden=false;hint.textContent=/iPhone|iPad/.test(navigator.userAgent)?'Dans Safari : Partager → Sur l’écran d’accueil → Ajouter.':'Dans le menu du navigateur : Installer l’application ou Ajouter à l’écran d’accueil. Si cette option n’apparaît pas, ouvrez SubTrack dans Chrome ou Edge. La version locale téléchargeable s’utilise aussi dans le navigateur.';
};
