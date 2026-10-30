import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({server:{allowedHosts:['terminal.local']},build:{rollupOptions:{input:{overview:resolve(import.meta.dirname,'index.html'),subscriptions:resolve(import.meta.dirname,'abonnements.html'),imports:resolve(import.meta.dirname,'import.html'),auth:resolve(import.meta.dirname,'connexion.html')}}}});
