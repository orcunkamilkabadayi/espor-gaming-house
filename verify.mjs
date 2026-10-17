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
// Actual chair transforms must point towards their own work/dining surface.
for(const {seat,target} of house.seating){
  const position=seat.getWorldPosition(new THREE.Vector3());
  const facing=new THREE.Vector3(0,0,-1).applyQuaternion(seat.getWorldQuaternion(new THREE.Quaternion()));
  const desired=target.clone().sub(position);desired.y=0;desired.normalize();
  assert.ok(facing.dot(desired)>.999,'Chair faces away from its table');
}
// A clear body-width approach across all twelve furnished doorways.
for(const d of house.doors){
  const side=Math.sign(d.pivot.position.x), z=d.pivot.position.z+1.06;
  for(let advance=-.6;advance<=2.3;advance+=.1){
    assert.ok(!blocked(d.pivot.position.x+side*advance,z,d.floor),`Blocked doorway at floor ${d.floor}, z ${z}`);
  }
}
const circulation=house.circulation;
const clearSideWidth=circulation.rearHalfWidth-.09-circulation.stairHalfWidth-.0175;
assert.ok(clearSideWidth>=1.4,'Upper stair side route narrower than 1.4 m');
assert.ok(circulation.stairEndZ+10.9>=1.7,'Upper stair rear landing too shallow');
for(const side of [-1,1])for(let z=-10.2;z<=-2.9;z+=.1){
  assert.ok(!blocked(side*1.5,z,1),'Upper stair side route is obstructed');
}
// Run the delivered walking code with the real furnished collision model.
const movementSource=await readFile(path.join(root,'src/main.js'),'utf8');
const movementCode=movementSource.slice(movementSource.indexOf('function getFloorAt'),movementSource.indexOf('function toggleDoor'));
const movement={THREE,house,CIRCULATION:house.circulation,CAMERA_HEIGHT:1.7,FLOOR_HEIGHT:4.2,
  camera:new THREE.PerspectiveCamera(),state:{floor:0,stairs:false,view:'walk',room:null},keys:new Set(),yaw:0,
  temp:new THREE.Vector3(),ROOMS,document:{body:{dataset:{}}},renderRooms:noop,setVisibility:noop,syncLocation:noop,updatePlayer:noop,stopTour:noop};
vm.createContext(movement);vm.runInContext(movementCode,movement);
const walkTo=(axis,target,key)=>{
  movement.keys.clear();movement.keys.add(key);let previous=movement.camera.position.y;
  for(let i=0;i<1200&&Math.abs(movement.camera.position[axis]-target)>.07;i++){
    const before=movement.camera.position[axis];movement.movePlayer(1/60);
    assert.ok(Math.abs(movement.camera.position.y-previous)<.1,'Abrupt step in stair height');previous=movement.camera.position.y;
    assert.notEqual(movement.camera.position[axis],before,`Walking route blocked at ${movement.camera.position.toArray()}`);
  }
  assert.ok(Math.abs(movement.camera.position[axis]-target)<=.07,`Walking target not reached: ${axis} ${target}`);
};
movement.camera.position.set(0,1.7,9.5);walkTo('z',-9.6,'forward');
assert.equal(movement.state.floor,1);assert.ok(Math.abs(movement.camera.position.y-5.9)<.01);
walkTo('x',-1.5,'left');walkTo('z',-7,'back');walkTo('x',-6,'left');
movement.camera.position.set(0,5.9,-9.6);movement.state.floor=1;movement.state.stairs=false;
walkTo('z',-2.7,'back');assert.equal(movement.state.floor,0);assert.ok(Math.abs(movement.camera.position.y-1.7)<.01);
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
const html=await readFile(path.join(root,'AZES-Gaming-House.html'),'utf8');
assert.ok(!/<script[^>]+src\s*=|<link[^>]+rel=["']stylesheet["']|<img[^>]+src=["']https?:/i.test(html),'External resource found in portable HTML');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];assert.equal(scripts.length,1);
new vm.Script(scripts[0][1]);assert.ok(html.indexOf('<script>')>html.indexOf('id="viewport"'),'Inline code executes before DOM');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
// Runtime HTML strings inside the bundled JavaScript are not static DOM IDs.
const markup=html.slice(0,html.indexOf('<script>'));
const markupIds=[...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(markupIds.length,new Set(markupIds).size);
const checks={portableBytes:Buffer.byteLength(html),floors:2,rooms:12,doors:12,colliders:house.colliders.length,sceneObjects:objects,instancedDetails:instances,reachableRooms:paths,tableFacingChairs:house.seating.length,clearDoorways:12,stairSideClearWidth:clearSideWidth,stairRearLandingDepth:circulation.stairEndZ+10.9,actualStairAscentDescentAndSideExit:'pass',portableSyntax:'pass',automaticExternalResources:0,staticDOMIds:markupIds.length};
await writeFile(path.join(root,'qa-results.json'),JSON.stringify(checks,null,2)+'\n');
console.log(JSON.stringify(checks,null,2));
