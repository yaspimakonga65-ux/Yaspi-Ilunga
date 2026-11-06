// Package the compiled application with a dependency-free Node HTTP launcher.
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {deflateRawSync} from 'node:zlib';
const entries=[];
async function walk(dir,prefix){for(const e of await readdir(dir,{withFileTypes:true})){if(e.name==='subtrack-local.zip')continue;const path=dir+'/'+e.name,name=prefix+'/'+e.name;if(e.isDirectory())await walk(path,name);else entries.push([name,await readFile(path)])}}
await walk('dist','SubTrack-local/app');
for(const name of ['server.cjs','Demarrer-Windows.cmd','demarrer-mac-linux.sh','LIRE-MOI.txt'])entries.push(['SubTrack-local/'+name,await readFile('local/'+name)]);
function crc32(data){let crc=0xffffffff;for(const b of data){crc^=b;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
const local=[],central=[];let offset=0;
for(const [name,bytes] of entries){const n=Buffer.from(name),data=deflateRawSync(bytes),crc=crc32(bytes),h=Buffer.alloc(30),c=Buffer.alloc(46);
 h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(8,8);h.writeUInt16LE(33,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(bytes.length,22);h.writeUInt16LE(n.length,26);
 c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(8,10);c.writeUInt16LE(33,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);
 local.push(h,n,data);central.push(c,n);offset+=h.length+n.length+data.length;
}
const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);
await writeFile('dist/subtrack-local.zip',Buffer.concat([...local,cd,end]));console.log(`Paquet local : ${entries.length} fichiers, dist/subtrack-local.zip`);
