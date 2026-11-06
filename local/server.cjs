const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'app'),port=4173;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const target=path.resolve(root,'.'+(pathname==='/'?'/connexion.html':pathname));
 if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.stat(target,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404);return res.end('Page introuvable')}
 res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD')return res.end();fs.createReadStream(target).pipe(res)})
 }catch{res.writeHead(400);res.end('Requete invalide')}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Le port 4173 est deja utilise. Fermez l autre instance, puis relancez.':error.message);process.exitCode=1});
server.listen(port,'127.0.0.1',()=>console.log('\nSubTrack local : http://localhost:4173/connexion.html\nSans compte : http://localhost:4173/index.html?local=1\nGardez cette fenetre ouverte. Ctrl+C pour arreter.\n'));
