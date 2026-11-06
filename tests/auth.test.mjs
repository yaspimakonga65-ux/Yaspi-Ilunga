import test from 'node:test';import assert from 'node:assert/strict';
import {submitAuth,authError} from '../assets/auth-actions.js';
const base={email:'test@example.com',password:'a-strong-password',confirmation:'a-strong-password',redirectTo:'https://subtrack-yaspi.vercel.app/connexion.html'};
test('signup waits for email confirmation instead of claiming a session',async()=>{
 let received;const auth={signUp:async input=>(received=input,{data:{user:{id:'test'},session:null},error:null})};
 const data=await submitAuth(auth,{...base,mode:'signup'});assert.equal(data.session,null);assert.equal(received.options.emailRedirectTo,base.redirectTo);assert.equal(received.email,base.email);
});
test('login returns real session; failures propagate',async()=>{
 const session={user:{id:'one'}};const data=await submitAuth({signInWithPassword:async()=>({data:{session},error:null})},{...base,mode:'login'});assert.equal(data.session,session);
 await assert.rejects(submitAuth({signInWithPassword:async()=>({error:Error('invalid')})},{...base,mode:'login'}),/invalid/);
});
test('recovery returns to password form and updates only after confirmation',async()=>{
 let redirect,password;await submitAuth({resetPasswordForEmail:async(email,options)=>(redirect=options.redirectTo,{data:{},error:null})},{...base,mode:'reset'});assert.equal(redirect,base.redirectTo+'?recovery=1');
 await submitAuth({updateUser:async input=>(password=input.password,{data:{},error:null})},{...base,mode:'update'});assert.equal(password,base.password);
 await assert.rejects(submitAuth({}, {...base,mode:'update',confirmation:'different'}),e=>e.code==='form_password');
 await assert.rejects(submitAuth({}, {...base,mode:'signup',password:'short',confirmation:'short'}),e=>e.code==='form_password');
});
test('mail setup and paused backend are actionable, not invalid-password errors',()=>{
 assert.match(authError({code:'email_address_not_authorized'}),/SMTP/);assert.match(authError({status:503}),/indisponible/);assert.match(authError({code:'invalid_credentials'}),/incorrect/);
});
