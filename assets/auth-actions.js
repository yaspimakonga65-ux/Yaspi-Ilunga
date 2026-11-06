export function authError(error){
 const messages={invalid_credentials:'Adresse e-mail ou mot de passe incorrect.',email_not_confirmed:'Confirmez votre adresse e-mail, puis connectez-vous. Vous pouvez renvoyer la confirmation ci-dessous.',over_email_send_rate_limit:'Trop de messages demandés. Patientez quelques minutes avant de réessayer.',over_request_rate_limit:'Trop de tentatives. Patientez avant de réessayer.',weak_password:'Choisissez un mot de passe d’au moins 10 caractères.',user_already_exists:'Ce compte existe déjà. Connectez-vous ou utilisez « Mot de passe oublié ».',signup_disabled:'Les nouvelles inscriptions sont désactivées par le propriétaire du service.',email_address_not_authorized:'L’envoi des e-mails n’est pas encore configuré pour les nouveaux utilisateurs. Le propriétaire doit configurer le service SMTP. Vous pouvez utiliser le mode local en attendant.'};
 return messages[error?.code]||(error?.status>=500?'Le service de comptes est momentanément indisponible. Réessayez dans quelques instants.':'La demande a échoué. Vérifiez votre connexion et réessayez.');
}
export async function submitAuth(auth,{mode,email,password,confirmation,redirectTo}){
 if((mode==='signup'||mode==='update')&&(password.length<10||password!==confirmation))throw {code:'form_password',message:'Saisissez deux mots de passe identiques d’au moins 10 caractères.'};
 let result;
 if(mode==='signup')result=await auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});
 else if(mode==='reset')result=await auth.resetPasswordForEmail(email,{redirectTo:redirectTo+'?recovery=1'});
 else if(mode==='update')result=await auth.updateUser({password});
 else result=await auth.signInWithPassword({email,password});
 if(result.error)throw result.error;
 return result.data;
}
