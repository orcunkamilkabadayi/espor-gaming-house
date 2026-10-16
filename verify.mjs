// Focused verification of the actual deliverable and spatial model, without a browser.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import * as THREE from 'three';
import {buildHouse} from './src/scene.js';
import {ROOMS} from './src/data.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const noop=()=>{};
const context=new Proxy({createLinearGradient:()=>({addColorStop:noop}),measureText:()=>({width:100})},{get:(object,key)=>key in object?object[key]:noop});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
const scene=new THREE.Scene();const house=buildHouse(THREE,scene);
assert.equal(house.floors.length,2);assert.equal(house.floors[1].position.y,4.2);
assert.equal(house.hotspots.length,12);assert.equal(house.doors.length,12);
assert.deepEqual(new Set(house.hotspots.map(h=>h.id)),new Set(ROOMS.map(r=>r.id)));
let objects=0,instances=0;
scene.traverse(o=>{objects++;assert.ok([...o.position.toArray(),...o.scale.toArray(),...o.quaternion.toArray()].every(Number.isFinite),'Non-finite transform');if(o.isInstancedMesh)instances+=o.count;});
const blocked=(x,z,floor)=>house.colliders.some(c=>c.floor===floor&&x>c.minX-.27&&x<c.maxX+.27&&z>c.minZ-.27&&z<c.maxZ+.27);
for(const h of house.hotspots){assert.ok(!blocked(h.position.x,h.position.z,h.position.y>4?1:0),`Blocked hotspot: ${h.id}`);}
for(const door of house.doors)assert.equal(door.pivot.rotation.y,door.open);
// Search the actual furnished floor, rather than asserting a list of wall coordinates.
const paths=[];
for(const floor of [0,1]){
  const step=.15;const key=(x,z)=>`${x},${z}`;const nodes=new Set();const queue=[[0,63]];nodes.add(key(0,63));
  for(let i=0;i<queue.length;i++){
    const [x,z]=queue[i];
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,nz=z+dz;
      if(Math.abs(nx*step)>13.45||Math.abs(nz*step)>10.45||nodes.has(key(nx,nz))||blocked(nx*step,nz*step,floor))continue;
      nodes.add(key(nx,nz));queue.push([nx,nz]);
    }
  }
  for(const h of house.hotspots.filter(h=>h.position.y>4?floor===1:floor===0)){
    const reachable=queue.some(([x,z])=>Math.hypot(x*step-h.position.x,z*step-h.position.z)<.3);
    assert.ok(reachable,`Unreachable room: ${h.id}`);paths.push(h.id);
  }
}
const html=await readFile(path.join(root,'AZE-Gaming-House.html'),'utf8');
assert.ok(!/<script[^>]+src\s*=|<link[^>]+rel=["']stylesheet["']|<img[^>]+src=["']https?:/i.test(html),'External resource found in portable HTML');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];assert.equal(scripts.length,1);
new vm.Script(scripts[0][1]);assert.ok(html.indexOf('<script>')>html.indexOf('id="viewport"'),'Inline code executes before DOM');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
// Runtime HTML strings inside the bundled JavaScript are not static DOM IDs.
const markup=html.slice(0,html.indexOf('<script>'));
const markupIds=[...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(markupIds.length,new Set(markupIds).size);
const checks={portableBytes:Buffer.byteLength(html),floors:2,rooms:12,doors:12,colliders:house.colliders.length,sceneObjects:objects,instancedDetails:instances,reachableRooms:paths,portableSyntax:'pass',automaticExternalResources:0,staticDOMIds:markupIds.length};
await writeFile(path.join(root,'qa-results.json'),JSON.stringify(checks,null,2)+'\n');
console.log(JSON.stringify(checks,null,2));
