import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildHouse, CIRCULATION } from './scene.js';
import { ROOMS, SOURCES } from './data.js';
import { initServices } from './services.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const state = {view:'outside',floor:0,room:null,night:false,sound:false,tour:false,tourIndex:0,ui:true,stairs:false};
let renderer,scene,camera,controls,house,sun,hemi,ambient;
let yaw=0,pitch=0,transition=null,lastTime=0,tourTimer=0,toastTimer=0,drag=null,audioContext=null,audioGain=null;
const keys=new Set();
const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
const temp=new THREE.Vector3();
const CAMERA_HEIGHT=1.7;
const FLOOR_HEIGHT=4.2;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

function toast(text){
  const el=$('#toast');
  el.textContent=text;el.classList.add('visible');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4200);
}
function active(id,value){const el=$(id);if(el){el.classList.toggle('active',value);el.setAttribute('aria-pressed',String(value));}}
function roomById(id){return ROOMS.find(r=>r.id===id);}
function sourceFor(room){return SOURCES[room.source]||SOURCES.aze;}

function setVisibility(){
  const cut=state.view==='orbit';
  house.floors[0].visible=true;
  house.floors[1].visible=!cut||state.floor===1;
  house.roof.visible=!cut;
  house.floors.forEach(group=>group.traverse(o=>{if(o.userData.ceiling)o.visible=!cut;}));
  document.body.classList.toggle('walking',state.view==='walk');
  document.body.dataset.view=state.view;
  active('#walk-btn',state.view==='walk');active('#orbit-btn',state.view!=='walk');
  $$('[data-floor]').forEach(el=>{const a=+el.dataset.floor===state.floor;el.classList.toggle('active',a);el.setAttribute('aria-pressed',String(a));});
  controls.enabled=state.view!=='walk';
  $('#look-hint').textContent=state.view==='walk'?'Sürükle: etrafa bak · WASD: yürü · E: kapı':'Sürükle: döndür · Tekerlek: yaklaş · Çift tıkla: içeri gir';
}
function syncLocation(){
  const room=roomById(state.room);
  $('#location-name').textContent=state.view==='outside'?'AZES Espor Takım Evi':room?.name||(state.floor===0?'Performans katı':'Yaşam katı');
  $('#location-meta').textContent=state.view==='outside'?'İKİ KATLI TAKIM EVİ · DIŞ MEKÂN':`${state.floor===0?'01 / PERFORMANS':'02 / YAŞAM'}${room?' · '+room.area+' m² KONSEPT ALAN':''}`;
  $('#info-btn').hidden=!room;
  services?.updateRoom(state.view==='outside'?null:state.room);
  $$('#room-list button').forEach(el=>{const a=el.dataset.room===state.room;el.classList.toggle('active',a);el.setAttribute('aria-pressed',String(a));});
  drawPlan();
}
function renderRooms(){
  $('#room-list').innerHTML=ROOMS.filter(r=>r.floor===state.floor).map(r=>`<button class="room-item" data-room="${r.id}" aria-pressed="false"><span class="room-preview" style="--room-color:${r.color}"><img alt="" data-thumb="${r.id}"><span>${r.no}</span></span><span class="room-copy"><strong>${r.name}</strong><small>${r.area} m² · konsept <span>↗</span></small></span></button>`).join('');
  $$('#room-list button').forEach(el=>el.addEventListener('click',()=>goRoom(el.dataset.room)));
  Object.entries(thumbnails).forEach(([id,url])=>{const img=$(`[data-thumb="${id}"]`);if(img)img.src=url;});
  syncLocation();
}

function setCamera(position,target,duration=900){
  const end=new THREE.Vector3(...position);
  const aim=new THREE.Vector3(...target);
  const ghost=new THREE.PerspectiveCamera();ghost.position.copy(end);ghost.lookAt(aim);
  transition={from:camera.position.clone(),to:end,qFrom:camera.quaternion.clone(),qTo:ghost.quaternion.clone(),start:performance.now(),duration:reducedMotion?0:duration};
  controls.target.copy(aim);
}
function finishLook(){
  const e=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ');yaw=e.y;pitch=e.x;
}
function stopTour(announce=false){
  if(!state.tour)return;
  state.tour=false;clearTimeout(tourTimer);$('#tour-status').hidden=true;active('#tour-btn',false);
  if(announce)toast('Sunum durduruldu. Keşfetmeye devam edebilirsiniz.');
}
function showOutside(user=true){
  if(user)stopTour();state.view='outside';state.room=null;state.stairs=false;
  const narrow=innerWidth<760;camera.fov=narrow?56:43;camera.updateProjectionMatrix();
  setVisibility();setCamera(narrow?[52,35,54]:[38,25,39],[-1,2,0],1100);syncLocation();$('#info-card').hidden=true;
}
function showFloor(floor,user=true){
  if(user)stopTour();state.floor=floor;state.view='orbit';state.room=null;state.stairs=false;
  const narrow=innerWidth<760;camera.fov=narrow?56:43;camera.updateProjectionMatrix();
  setVisibility();setCamera(narrow?[42,45+floor*3,44]:[28,31+floor*3,31],[0,floor*FLOOR_HEIGHT,0],1000);renderRooms();$('#info-card').hidden=true;
}
function goRoom(id,{user=true,info=true}={}){
  const room=roomById(id);if(!room)return;
  if(user)stopTour();
  const changed=state.floor!==room.floor;
  state.floor=room.floor;state.room=room.id;state.view='walk';state.stairs=false;
  camera.fov=68;camera.updateProjectionMatrix();
  setVisibility();
  // A fade avoids moving the eye through solid walls during room shortcuts.
  const curtain=$('#scene-curtain');curtain?.classList.add('changing');
  setCamera(room.pos,room.target,650);
  setTimeout(()=>curtain?.classList.remove('changing'),160);
  if(changed)renderRooms();else syncLocation();
  if(info)showInfo(room);
  $('#sections').classList.add('collapsed');$('#sections-toggle').setAttribute('aria-expanded','false');
}
function enterWalk(){
  stopTour();
  if(state.view==='walk'){showFloor(state.floor);return;}
  state.view='walk';state.room=null;state.stairs=false;
  camera.fov=68;camera.updateProjectionMatrix();
  setVisibility();setCamera([0,state.floor*FLOOR_HEIGHT+CAMERA_HEIGHT,9.5],[0,state.floor*FLOOR_HEIGHT+CAMERA_HEIGHT,0]);syncLocation();
  $('#info-card').hidden=true;
  toast('İçeridesiniz. WASD / ok tuşlarıyla yürüyün; sürükleyerek etrafa bakın.');
  $('#sections').classList.add('collapsed');$('#sections-toggle').setAttribute('aria-expanded','false');
}
function showInfo(room=roomById(state.room)){
  if(!room){toast('Bilgi için menüden veya kat planından bir mekân seçin.');return;}
  $('#info-title').textContent=room.name;$('#info-description').textContent=room.desc;
  $('#info-features').innerHTML=room.features.map(f=>`<li>${f}</li>`).join('');
  const src=sourceFor(room);$('#info-source').textContent=src.name;$('#info-source').href=src.url;
  $('#plan-panel').hidden=true;active('#plan-btn',false);
  $('#info-card').hidden=false;
}

function drawPlan(){
  const svg=$('#plan-svg');
  $('#plan-title').textContent=state.floor===0?'01 / PERFORMANS KATI':'02 / YAŞAM KATI';
  let content='<rect x="3" y="3" width="274" height="214" rx="3" fill="#faf9f5" stroke="#888b80" stroke-width="1.5"/><rect x="121" y="4" width="38" height="212" fill="#e8e8e0"/>';
  ROOMS.filter(r=>r.floor===state.floor).forEach(r=>{
    const left=r.pos[0]<0;const row=+r.no%3;
    const z=r.pos[2];const x=left?5:160;const py=z>3?141:z> -4?72:5;const h=z>3?74:67;
    const selected=r.id===state.room;
    content+=`<g class="plan-room" role="button" tabindex="0" aria-label="${r.name}" data-plan-room="${r.id}"><rect x="${x}" y="${py}" width="115" height="${h}" fill="${selected?'#d0f597':r.color}" fill-opacity="${selected?'.9':'.24'}" stroke="#a8aa9c" stroke-width="1"/><text x="${x+9}" y="${py+20}" font-size="10" fill="#252a20" font-family="Segoe UI, sans-serif" font-weight="650">${r.no} / ${r.short}</text><text x="${x+9}" y="${py+35}" font-size="9" fill="#686d61">${r.area} m²</text><circle cx="${x+96}" cy="${py+h-16}" r="4" fill="${selected?'#25391a':'#8d987c'}"/></g>`;
  });
  for(let i=0;i<13;i++)content+=`<path d="M124 ${6+i*4.9}h32" stroke="#a2a698" stroke-width=".8"/>`;
  content+='<text x="140" y="110" text-anchor="middle" font-size="8" fill="#6c7364" transform="rotate(-90 140 110)">ORTAK KORİDOR</text><path d="M130 218h20" stroke="#416528" stroke-width="4"/>';
  const px=(camera?.position.x+14)*10;const pz=(camera?.position.z+11)*10;
  if(state.view==='walk')content+=`<g id="plan-player" transform="translate(${px} ${pz})"><circle r="7" fill="#b5ef65" fill-opacity=".35"/><circle r="3.4" fill="#243d19" stroke="#fff" stroke-width="1.2"/><path id="plan-heading" d="M0 -11L-4 -5H4Z" fill="#3f6628" transform="rotate(${-yaw*180/Math.PI})"/></g>`;
  svg.innerHTML=content;
  svg.querySelectorAll('[data-plan-room]').forEach(el=>{el.addEventListener('click',()=>goRoom(el.dataset.planRoom));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();goRoom(el.dataset.planRoom);}});});
}
function updatePlayer(){
  const player=$('#plan-player');if(player)player.setAttribute('transform',`translate(${(camera.position.x+14)*10} ${(camera.position.z+11)*10})`);
  $('#plan-heading')?.setAttribute('transform',`rotate(${-yaw*180/Math.PI})`);
}
function togglePlan(){const panel=$('#plan-panel');panel.hidden=!panel.hidden;if(!panel.hidden)$('#info-card').hidden=true;active('#plan-btn',!panel.hidden);drawPlan();}

function setNight(enabled){
  state.night=enabled;document.body.classList.toggle('night',enabled);
  scene.background.set(enabled?'#18262d':'#eeeede');scene.fog.color.copy(scene.background);
  hemi.intensity=enabled?1.15:2.65;ambient.intensity=enabled?.6:.8;sun.intensity=enabled?.35:3.1;
  sun.color.set(enabled?'#8bb6ea':'#fff3d8');renderer.toneMappingExposure=enabled?1.35:1.15;
  house.setNight?.(enabled);active('#night-btn',enabled);
}
async function toggleSound(){
  try{
    if(!audioContext){
      audioContext=new (window.AudioContext||window.webkitAudioContext)();audioGain=audioContext.createGain();audioGain.gain.value=0;audioGain.connect(audioContext.destination);
      [130.81,196,261.63].forEach((freq,i)=>{const osc=audioContext.createOscillator();const gain=audioContext.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.value=.016/(i+1);osc.connect(gain);gain.connect(audioGain);osc.start();});
    }
    await audioContext.resume();state.sound=!state.sound;
    audioGain.gain.setTargetAtTime(state.sound?.8:0,audioContext.currentTime,.45);active('#sound-btn',state.sound);
    toast(state.sound?'Ortam sesi açık.':'Ortam sesi kapalı.');
  }catch{toast('Bu tarayıcıda ses başlatılamadı.');}
}
function toggleUI(){state.ui=!state.ui;document.body.classList.toggle('ui-hidden',!state.ui);$('#restore-ui').hidden=state.ui;active('#ui-btn',!state.ui);}
async function toggleFullscreen(){
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
  catch{toast('Tam ekran açılamadı. Tarayıcının F11 kısayolunu kullanabilirsiniz.');}
}
function photograph(){
  renderer.render(scene,camera);
  const data=renderer.domElement.toDataURL('image/png');
  $('#gallery-image').src=data;
  $('#gallery-download').href=data;$('#gallery-download').download=`AZES-espor-takim-evi-${roomById(state.room)?.short||({outside:'dis-mekan',orbit:'kat-gorunumu',walk:'gezinti'}[state.view])}-${state.night?'gece':'gunduz'}.png`;
  $('#gallery-dialog').showModal();
}
function startTour(){
  if(state.tour){stopTour(true);return;}
  state.tour=true;state.tourIndex=0;$('#tour-status').hidden=false;active('#tour-btn',true);$('#info-card').hidden=true;
  $('#sections').classList.add('collapsed');
  function step(){
    if(!state.tour)return;
    if(state.tourIndex===0){showOutside(false);$('#tour-step').textContent='01 / 14 · Bina ve çevre';}
    else if(state.tourIndex<=ROOMS.length){const r=ROOMS[state.tourIndex-1];goRoom(r.id,{user:false});$('#tour-step').textContent=`${String(state.tourIndex+1).padStart(2,'0')} / 14 · ${r.name}`;}
    else{showFloor(1,false);$('#tour-step').textContent='14 / 14 · Yaşam katına son bakış';}
    state.tourIndex++;
    if(state.tourIndex>13){tourTimer=setTimeout(()=>{stopTour();toast('Sunum tamamlandı. Şimdi kendi rotanızı keşfedin.');},7500);}
    else tourTimer=setTimeout(step,8500);
  }step();
}

function getFloorAt(pos){return pos.y>3.8?1:0;}
function blocked(x,z,floor){
  const radius=.27;
  if(x<-13.45||x>13.45||z<-10.45||z>10.45)return true;
  for(const c of house.colliders){if(c.floor!==undefined&&c.floor!==floor)continue;if(x>c.minX-radius&&x<c.maxX+radius&&z>c.minZ-radius&&z<c.maxZ+radius)return true;}
  for(const d of house.doors){
    if(d.floor!==floor||Math.abs(d.pivot.rotation.y-d.closed)>.15)continue;
    d.pivot.getWorldPosition(temp);
    if(Math.abs(x-temp.x)<.3&&z>temp.z-.1&&z<temp.z+2.1)return true;
  }
  return false;
}
function movePlayer(dt){
  let forward=(keys.has('w')||keys.has('arrowup')||keys.has('forward')?1:0)-(keys.has('s')||keys.has('arrowdown')||keys.has('back')?1:0);
  let side=(keys.has('d')||keys.has('arrowright')||keys.has('right')?1:0)-(keys.has('a')||keys.has('arrowleft')||keys.has('left')?1:0);
  if(!forward&&!side)return;
  if(state.tour)stopTour();
  const norm=Math.hypot(forward,side);forward/=norm;side/=norm;
  const speed=(keys.has('shift')?5.2:3.1)*dt;
  const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed;
  const dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed;
  const currentFloor=getFloorAt(camera.position);
  let nx=camera.position.x+dx,nz=camera.position.z+dz;
  const {stairStartZ,stairEndZ,stairWalkHalfWidth}=CIRCULATION;
  const inRamp=(x,z)=>Math.abs(x)<stairWalkHalfWidth&&z<stairStartZ-.05&&z>stairEndZ-.15;
  if(state.stairs&&camera.position.z>stairEndZ+.1&&camera.position.z<stairStartZ-.1&&Math.abs(nx)>=stairWalkHalfWidth)nx=THREE.MathUtils.clamp(nx,-stairWalkHalfWidth+.005,stairWalkHalfWidth-.005);
  // Enter the upper landing from the rear, not through the stairwell guard.
  if(currentFloor===1&&!state.stairs&&inRamp(nx,nz)&&camera.position.z>stairEndZ+.15){nx=camera.position.x;nz=camera.position.z;}
  if(!blocked(nx,camera.position.z,currentFloor))camera.position.x=nx;
  if(!blocked(camera.position.x,nz,currentFloor))camera.position.z=nz;
  if(inRamp(camera.position.x,camera.position.z)){
    state.stairs=true;
    camera.position.y=CAMERA_HEIGHT+THREE.MathUtils.clamp((stairStartZ-camera.position.z)/(stairStartZ-stairEndZ),0,1)*FLOOR_HEIGHT;
  }else{
    if(state.stairs){state.floor=camera.position.z<=stairEndZ+.1?1:0;state.stairs=false;}
    camera.position.y=CAMERA_HEIGHT+state.floor*FLOOR_HEIGHT;
  }
  if(!state.stairs&&currentFloor!==state.floor){state.floor=currentFloor;renderRooms();setVisibility();}
  const floorNow=getFloorAt(camera.position);
  if(state.stairs&&floorNow!==state.floor){state.floor=floorNow;renderRooms();setVisibility();}
  if(!state.stairs){
    const corridorHalf=camera.position.z < -3.1 ? CIRCULATION.rearHalfWidth : 2;
    const room=ROOMS.find(r=>r.floor===state.floor&&((camera.position.x<-corridorHalf&&r.pos[0]<0)||(camera.position.x>corridorHalf&&r.pos[0]>0))&&((camera.position.z>=3&&r.pos[2]>3)||(camera.position.z<3&&camera.position.z>=-4&&r.pos[2]>=-4&&r.pos[2]<3)||(camera.position.z<-4&&r.pos[2]<-4)));
    if((room?.id||null)!==state.room){state.room=room?.id||null;syncLocation();}
  }
  updatePlayer();
  document.body.dataset.camera=[camera.position.x,camera.position.y,camera.position.z].map(v=>v.toFixed(2)).join(',');
}
function toggleDoor(){
  let nearest=null,distance=3;
  house.doors.forEach(d=>{if(d.floor!==state.floor)return;d.pivot.getWorldPosition(temp);const dist=Math.hypot(temp.x-camera.position.x,temp.z-camera.position.z);if(dist<distance){distance=dist;nearest=d;}});
  if(!nearest){toast('Kapıyı kullanmak için kapıya yaklaşın.');return;}
  const isOpen=Math.abs(nearest.pivot.rotation.y-nearest.open)<.2;
  nearest.target=isOpen?nearest.closed:nearest.open;
  toast(isOpen?'Kapı kapanıyor.':'Kapı açılıyor.');
}
function handleCanvasPointer(){
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{
    if(state.view!=='walk')return;
    if(state.tour)stopTour();
    drag={x:e.clientX,y:e.clientY,total:0,id:e.pointerId};canvas.setPointerCapture(e.pointerId);$('#info-card').hidden=true;
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag||state.view!=='walk')return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.total+=Math.abs(dx)+Math.abs(dy);
    yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch-dy*.003,-1.25,1.25);
    camera.quaternion.setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ'));transition=null;
    updatePlayer();
    drag.x=e.clientX;drag.y=e.clientY;
  });
  canvas.addEventListener('pointerup',()=>{drag=null;});
  canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('dblclick',e=>{
    if(state.view!=='walk'){enterWalk();return;}
    const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects(house.floors[state.floor].children,true).find(h=>h.face&&h.face.normal.y>.9&&Math.abs(h.point.y-state.floor*4.2)<.22);
    if(hit&&!blocked(hit.point.x,hit.point.z,state.floor))setCamera([hit.point.x,state.floor*4.2+1.7,hit.point.z],[hit.point.x-Math.sin(yaw),state.floor*4.2+1.7+Math.sin(pitch),hit.point.z-Math.cos(yaw)],500);
  });
  canvas.addEventListener('wheel',e=>{
    if(state.view==='walk'){e.preventDefault();camera.fov=THREE.MathUtils.clamp(camera.fov+e.deltaY*.035,40,85);camera.updateProjectionMatrix();}
  },{passive:false});
  controls.addEventListener('start',()=>{if(state.tour)stopTour();transition=null;});
}

const thumbnails={};
function generateThumbnails(){
  const oldPos=camera.position.clone(),oldQ=camera.quaternion.clone();const oldFov=camera.fov;
  camera.fov=75;camera.updateProjectionMatrix();
  for(const room of ROOMS){
    camera.position.set(...room.pos);camera.lookAt(new THREE.Vector3(...room.target));renderer.render(scene,camera);
    const thumb=document.createElement('canvas');thumb.width=240;thumb.height=130;
    const ctx=thumb.getContext('2d');const cv=renderer.domElement;const cropW=cv.height*240/130;
    ctx.drawImage(cv,(cv.width-cropW)/2,0,cropW,cv.height,0,0,240,130);
    thumbnails[room.id]=thumb.toDataURL('image/jpeg',.7);
  }
  camera.position.copy(oldPos);camera.quaternion.copy(oldQ);camera.fov=oldFov;camera.updateProjectionMatrix();
  renderRooms();
}
let pinElements=[];
function createPins(){
  const container=document.createElement('div');container.id='spatial-pins';container.setAttribute('aria-label','Mekân noktaları');$('#viewport').append(container);
  for(const room of ROOMS){
    const button=document.createElement('button');button.className='spatial-pin';button.dataset.pin=room.id;button.innerHTML=`<i></i><span>${room.short}</span>`;button.title=room.name;button.setAttribute('aria-label',room.name+' bölümüne git');button.addEventListener('click',()=>goRoom(room.id));container.append(button);pinElements.push({el:button,room});
  }
  const entrance=document.createElement('button');entrance.className='spatial-pin entrance-pin';entrance.innerHTML='<i>↗</i><span>İçeri gir</span>';entrance.addEventListener('click',enterWalk);container.append(entrance);pinElements.push({el:entrance,entrance:true});
}
function updatePins(){
  const w=innerWidth,h=innerHeight;
  for(const pin of pinElements){
    const r=pin.room;let visible=state.ui&&!transition&&(pin.entrance?state.view==='outside':state.view==='orbit'&&r.floor===state.floor);
    if(visible){temp.set(...(pin.entrance?[0,1.8,11.3]:[r.pos[0],r.floor*4.2+.5,r.pos[2]]));temp.project(camera);visible=temp.z>-1&&temp.z<1&&Math.abs(temp.x)<.95&&Math.abs(temp.y)<.9;pin.el.style.left=`${(temp.x*.5+.5)*w}px`;pin.el.style.top=`${(-temp.y*.5+.5)*h}px`;}
    pin.el.hidden=!visible;
  }
}
function bindUI(){
  $('#sections-toggle').addEventListener('click',()=>{const p=$('#sections');p.classList.toggle('collapsed');$('#sections-toggle').setAttribute('aria-expanded',String(!p.classList.contains('collapsed')));});
  $$('[data-floor]').forEach(el=>el.addEventListener('click',()=>showFloor(+el.dataset.floor)));
  $('#outside-btn').addEventListener('click',()=>showOutside());$('#walk-btn').addEventListener('click',enterWalk);$('#orbit-btn').addEventListener('click',()=>showFloor(state.floor));
  $('#plan-btn').addEventListener('click',togglePlan);$('#plan-close').addEventListener('click',togglePlan);
  $('#info-btn').addEventListener('click',()=>showInfo());$('#info-close').addEventListener('click',()=>$('#info-card').hidden=true);
  $('#shot-btn').addEventListener('click',photograph);$('#gallery-close').addEventListener('click',()=>$('#gallery-dialog').close());
  $('#night-btn').addEventListener('click',()=>setNight(!state.night));$('#sound-btn').addEventListener('click',toggleSound);
  $('#fullscreen-btn').addEventListener('click',toggleFullscreen);$('#ui-btn').addEventListener('click',toggleUI);$('#restore-ui').addEventListener('click',toggleUI);
  $('#tour-btn').addEventListener('click',startTour);$('#tour-stop').addEventListener('click',()=>stopTour(true));
  $('#help-btn').addEventListener('click',()=>$('#help-dialog').showModal());$('#help-close').addEventListener('click',()=>$('#help-dialog').close());
  $('#about-btn').addEventListener('click',()=>$('#about-dialog').showModal());$('#about-close').addEventListener('click',()=>$('#about-dialog').close());
  if($('#research-dialog')){
    $$('a[href="REFERANS-INCELEME.html"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();$('#about-dialog').close();$('#research-dialog').showModal();}));
    $('#research-close').addEventListener('click',()=>$('#research-dialog').close());
  }
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,textarea,select')||$('dialog[open]'))return;
    const k=e.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowleft','arrowright','arrowdown','shift'].includes(k)){if(state.view==='walk'){keys.add(k);e.preventDefault();}}
    if(e.repeat)return;
    if(k==='m')togglePlan();if(k==='h')toggleUI();if(k==='f')toggleFullscreen();if(k==='e'&&state.view==='walk')toggleDoor();
    if(k==='escape'){stopTour();if(!state.ui)toggleUI();else if(state.view==='walk')showFloor(state.floor);}
  });
  document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden&&state.tour)stopTour();});
  $$('[data-move]').forEach(el=>{
    const release=()=>keys.delete(el.dataset.move);
    el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);keys.add(el.dataset.move);});
    el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);
  });
  window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
}
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-lastTime)/1000||0,.045);lastTime=now;
  if(transition){
    const t=transition.duration?Math.min((now-transition.start)/transition.duration,1):1;const k=t*t*(3-2*t);
    camera.position.lerpVectors(transition.from,transition.to,k);camera.quaternion.slerpQuaternions(transition.qFrom,transition.qTo,k);
    if(t===1){transition=null;finishLook();if(state.view!=='walk')controls.update();}
  }else if(state.view==='walk'){
    if(!$('dialog[open]'))movePlayer(dt);
    if(state.tour){yaw+=dt*.035;camera.quaternion.setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ'));}
  }else controls.update();
  house.doors.forEach(d=>{if(d.target!==undefined){d.pivot.rotation.y=THREE.MathUtils.damp(d.pivot.rotation.y,d.target,9,dt);if(Math.abs(d.pivot.rotation.y-d.target)<.001){d.pivot.rotation.y=d.target;delete d.target;}}});
  updatePins();renderer.render(scene,camera);
}

async function init(){
  try{
    scene=new THREE.Scene();scene.background=new THREE.Color('#eeeede');scene.fog=new THREE.Fog('#eeeede',65,180);
    const narrow=innerWidth<760;
    camera=new THREE.PerspectiveCamera(narrow?56:43,innerWidth/innerHeight,.08,250);camera.position.set(...(narrow?[52,35,54]:[38,25,39]));camera.lookAt(-1,2,0);
    renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.35:1.75));renderer.setSize(innerWidth,innerHeight);
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
    renderer.domElement.setAttribute('aria-label','İki katlı espor takım evi 3D görünümü');renderer.domElement.setAttribute('tabindex','0');$('#viewport').append(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();toast('3D görüntüsü kesildi. Sayfayı yenileyerek devam edebilirsiniz.');});
    hemi=new THREE.HemisphereLight('#e7f5ff','#a29c80',2.65);scene.add(hemi);ambient=new THREE.AmbientLight('#fff6e9',.8);scene.add(ambient);
    sun=new THREE.DirectionalLight('#fff3d8',3.1);sun.position.set(-15,32,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-32;sun.shadow.camera.right=32;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.camera.far=90;sun.shadow.normalBias=.035;scene.add(sun);
    house=buildHouse(THREE,scene);
    house.hotspots.forEach(h=>{const room=roomById(h.id);if(room)room.pos=h.position.toArray();});
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=8;controls.maxDistance=120;controls.maxPolarAngle=Math.PI*.48;controls.target.set(-1,2,0);controls.update();
    bindUI();handleCanvasPointer();createPins();setVisibility();renderRooms();
    if(matchMedia('(max-width:760px)').matches){$('#sections').classList.add('collapsed');$('#sections-toggle').setAttribute('aria-expanded','false');}
    $('#restore-ui').hidden=true;
    $('.brand').addEventListener('click',e=>{e.preventDefault();showOutside();});
    $('#research-links').innerHTML='<a href="https://www.mimari3d.com/tanitim/" target="_blank" rel="noopener noreferrer">Mimari3D · Referans etkileşimli tur ↗</a>'+Object.values(SOURCES).map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name} ↗</a>`).join('');
    renderer.render(scene,camera);
    $('#loading').classList.add('loaded');setTimeout(()=>$('#loading').hidden=true,650);
    document.body.dataset.ready='true';
    requestAnimationFrame(animate);
    // All images are rendered from this very model; the local file needs no CDN.
    setTimeout(()=>{generateThumbnails();const hash=decodeURIComponent(location.hash.slice(1));if(roomById(hash))goRoom(hash);},900);
  }catch(error){
    console.error(error);$('#loading').hidden=true;$('#error-panel').hidden=false;
    $('#error-panel').innerHTML='<h2>3D görünüm başlatılamadı</h2><p>Güncel Chrome, Edge veya Firefox ile açın ve tarayıcınızda donanım hızlandırmasının etkin olduğundan emin olun.</p><p>Bu sayfa internetsiz çalışır; kurulum gerekmez.</p><button onclick="location.reload()">Yeniden dene</button>';
  }
}
const services=initServices({goRoom,stopTour,clearMovement:()=>keys.clear()});
init();
