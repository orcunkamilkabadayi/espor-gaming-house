import { build } from 'esbuild';
import { readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
await build({entryPoints:[path.join(root,'src/main.js')],bundle:true,format:'iife',target:['es2020'],minify:true,outfile:path.join(root,'gaming-house.js'),legalComments:'eof'});
const report=await readFile(path.join(root,'REFERANS-INCELEME.md'),'utf8');
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const inline=value=>escape(value).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
let reportBody='';const lines=report.split(/\r?\n/);let paragraph=[];
const flush=()=>{if(paragraph.length){reportBody+='<p>'+inline(paragraph.join(' '))+'</p>';paragraph=[];}};
for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();
  if(!line){flush();continue;}
  if(/^#{1,6} /.test(line)){flush();const level=line.indexOf(' ');reportBody+=`<h${level}>${inline(line.slice(level+1))}</h${level}>`;continue;}
  if(line.startsWith('|')){flush();const rows=[];while(i<lines.length&&lines[i].trim().startsWith('|')){const cells=lines[i].trim().slice(1,-1).split('|').map(c=>c.trim());if(!cells.every(c=>/^:?-+:?$/.test(c)))rows.push(cells);i++;}i--;reportBody+='<div class="research-table"><table>'+rows.map((cells,n)=>'<tr>'+cells.map(cell=>`<${n?'td':'th'}>${inline(cell)}</${n?'td':'th'}>`).join('')+'</tr>').join('')+'</table></div>';continue;}
  paragraph.push(line);
}flush();
const html=await readFile(path.join(root,'index.html'),'utf8');
const css=await readFile(path.join(root,'styles.css'),'utf8');
const js=await readFile(path.join(root,'gaming-house.js'),'utf8');
const threeLicense=await readFile(new URL('../LICENSE',import.meta.resolve('three')),'utf8');
await writeFile(path.join(root,'THIRD-PARTY-LICENSES.txt'),'Three.js (including OrbitControls)\n\n'+threeLicense);
const reportStyle='body{margin:0;background:#f2f3ec;color:#262b23;font:16px/1.75 Segoe UI,Arial,sans-serif}main{max-width:980px;margin:50px auto;padding:30px}h1{font-size:40px;line-height:1.2;letter-spacing:-1.5px}h2{margin-top:55px;font-size:27px;letter-spacing:-.7px}h3{margin-top:35px;font-size:20px}p{color:#51584b}a{color:#4f6b20;text-underline-offset:3px}table{border-collapse:collapse;font-size:13px;width:100%;background:#fbfcf6}td,th{padding:12px;border:1px solid #d7ddce;text-align:left;vertical-align:top}th{background:#e4edcf}.research-table{overflow:auto}code{font-size:.9em;background:#e6eadc;padding:2px 5px;border-radius:4px}.research-brand{font-size:13px;font-weight:750;letter-spacing:3px;color:#6b7d47}footer{border-top:1px solid #d2dac6;margin-top:50px;padding-top:20px;font-size:13px}@media(max-width:600px){main{margin:0;padding:23px}h1{font-size:29px}h2{font-size:23px}body{font-size:14px}}';
await writeFile(path.join(root,'REFERANS-INCELEME.html'),'<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>AZES Gaming House — Referans incelemesi</title><style>'+reportStyle+'</style><main><div class="research-brand">AZES / ARAŞTIRMA</div>'+reportBody+'<footer><a href="AZES-Gaming-House.html">3D Gaming House turunu aç ↗</a></footer></main></html>');
const researchDialog='<dialog id="research-dialog" class="modal research-modal" aria-label="Ayrıntılı referans incelemesi"><button id="research-close" type="button" class="research-close" aria-label="Araştırmayı kapat">Kapat ×</button><article>'+reportBody+'</article></dialog>';
const portable=html.replace(/<link\b[^>]*href=["']styles\.css["'][^>]*>/,()=>'<style>'+css+'</style>').replace(/<script\b[^>]*src=["']gaming-house\.js["'][^>]*><\/script>/,'').replace('</body>',()=>researchDialog+'<!-- Three.js license\n'+threeLicense+'-->\n<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script></body>');
await writeFile(path.join(root,'AZES-Gaming-House.html'),portable);
console.log('Built offline bundle and portable HTML.');
