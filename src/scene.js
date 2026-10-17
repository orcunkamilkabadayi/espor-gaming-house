/** Local, asset-free architectural model. All coordinates are metres. */
export const CIRCULATION = {rearHalfWidth:2.4, stairHalfWidth:.8, stairWalkHalfWidth:.51, stairStartZ:-3.1, stairEndZ:-9.1};
export function buildHouse(THREE, scene) {
  const building = new THREE.Group(); building.name = 'AZES / Espor Takım Evi'; scene.add(building);
  const exterior = new THREE.Group(); exterior.name = 'Bahçe ve giriş'; scene.add(exterior);
  const floors = [new THREE.Group(), new THREE.Group()];
  floors.forEach((g, i) => { g.name = i ? '01 / Yaşam ve toparlanma' : '00 / Performans'; g.position.y = i * 4.2; building.add(g); });
  const roof = new THREE.Group(); roof.name = 'Çatı'; building.add(roof);
  const colliders = [], doors = [], hotspots = [], animated = [], interiorLights = [], seating = [];
  const geometry = {
    box: new THREE.BoxGeometry(1, 1, 1), plane: new THREE.PlaneGeometry(1, 1),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 14), sphere: new THREE.SphereGeometry(1, 12, 8),
    cone: new THREE.ConeGeometry(1, 1, 10), torus: new THREE.TorusGeometry(1, .09, 8, 20),
  };
  function canvasTexture(draw, w = 512, h = 512) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  let seed = 38117;
  function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  const concrete = canvasTexture((c, w, h) => {
    c.fillStyle = '#c3c2b9'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 13000; i++) { const a = .015 + rand() * .045; c.fillStyle = `rgba(45,48,43,${a})`; c.fillRect(rand() * w, rand() * h, rand() * 3 + 1, 1); }
    c.strokeStyle = '#b1b1a9'; c.lineWidth = 1; c.strokeRect(2, 2, w - 4, h - 4);
    for (const x of [24, w - 24]) for (const y of [24, h - 24]) { c.beginPath(); c.arc(x, y, 2.5, 0, Math.PI * 2); c.fillStyle = '#999c92'; c.fill(); }
  }); concrete.wrapS = concrete.wrapT = THREE.RepeatWrapping; concrete.repeat.set(2, 2);
  const oak = canvasTexture((c, w, h) => {
    c.fillStyle = '#b18a60'; c.fillRect(0, 0, w, h);
    for (let p = 0; p < 8; p++) {
      c.fillStyle = `hsl(32,${28 + rand() * 9}%,${47 + rand() * 12}%)`; c.fillRect(p * 64, 0, 63, h);
      for (let j = 0; j < 75; j++) { c.strokeStyle = `rgba(62,37,15,${.04 + rand() * .13})`; c.beginPath(); const x = p * 64 + rand() * 62; c.moveTo(x, 0); c.bezierCurveTo(x + 8, 180, x - 8, 340, x, h); c.stroke(); }
      c.fillStyle = '#604e3b'; c.fillRect(p * 64, 0, 1, h); c.fillRect(p * 64, p % 2 ? 160 : 350, 64, 1);
    }
  }); oak.wrapS = oak.wrapT = THREE.RepeatWrapping; oak.repeat.set(2, 3);
  const tile = canvasTexture((c, w, h) => { c.fillStyle = '#d5d7cf'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b8beb6'; c.lineWidth = 2; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 128, 0); c.lineTo(i * 128, h); c.moveTo(0, i * 128); c.lineTo(w, i * 128); c.stroke(); } }); tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(3, 2);
  const carpet = canvasTexture((c, w, h) => { c.fillStyle = '#303b3a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 22000; i++) { c.fillStyle = rand() > .5 ? '#3a4544' : '#293231'; c.fillRect(rand() * w, rand() * h, 1, 2); } }); carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(3, 3);
  const materials = {
    wall: new THREE.MeshStandardMaterial({color: '#e4e3d9', map: concrete, roughness: .87}),
    concrete: new THREE.MeshStandardMaterial({map: concrete, roughness: .85}),
    oak: new THREE.MeshStandardMaterial({map: oak, color: '#d2b78f', roughness: .65}),
    graphite: new THREE.MeshStandardMaterial({color: '#1c2728', roughness: .6}),
    black: new THREE.MeshStandardMaterial({color: '#10191d', roughness: .45}),
    metal: new THREE.MeshStandardMaterial({color: '#7c8988', metalness: .75, roughness: .25}),
    white: new THREE.MeshStandardMaterial({color: '#eeeee5', roughness: .62}),
    fabric: new THREE.MeshStandardMaterial({color: '#b6b9a4', roughness: 1}),
    darkFabric: new THREE.MeshStandardMaterial({color: '#35474b', roughness: 1}),
    linen: new THREE.MeshStandardMaterial({color: '#eeede3', roughness: 1}),
    blueLinen: new THREE.MeshStandardMaterial({color: '#6b8a8d', roughness: 1}),
    lime: new THREE.MeshStandardMaterial({color: '#c7ef56', roughness: .45}),
    led: new THREE.MeshStandardMaterial({color: '#c4f45b', emissive: '#9cdb2b', emissiveIntensity: .85, roughness: .35}),
    cyan: new THREE.MeshStandardMaterial({color: '#73dae2', emissive: '#38a3b7', emissiveIntensity: .8}),
    warmLight: new THREE.MeshStandardMaterial({color: '#fff4d2', emissive: '#ffe5ac', emissiveIntensity: .65}),
    glass: new THREE.MeshStandardMaterial({color: '#b4d8db', transparent: true, opacity: .17, roughness: .08, metalness: .15, side: THREE.DoubleSide, depthWrite: false}),
    tinted: new THREE.MeshStandardMaterial({color: '#427175', transparent: true, opacity: .3, roughness: .12, metalness: .18, side: THREE.DoubleSide, depthWrite: false}),
    tile: new THREE.MeshStandardMaterial({map: tile, roughness: .38}),
    carpet: new THREE.MeshStandardMaterial({map: carpet, roughness: 1}),
    rubber: new THREE.MeshStandardMaterial({color: '#343c3a', roughness: 1}),
    grass: new THREE.MeshStandardMaterial({color: '#64794c', roughness: 1}),
    leaf: new THREE.MeshStandardMaterial({color: '#3b7151', roughness: .85}),
    soil: new THREE.MeshStandardMaterial({color: '#514739', roughness: 1}),
    gravel: new THREE.MeshStandardMaterial({color: '#8c9489', roughness: 1}),
    asphalt: new THREE.MeshStandardMaterial({color: '#46504d', roughness: 1}),
    gold: new THREE.MeshStandardMaterial({color: '#d9b764', metalness: .8, roughness: .24}),
  };
  const signCache = new Map();
  function mesh(parent, geo, mat, x, y, z, sx, sy, sz, ry = 0) {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.y = ry; m.receiveShadow = true; parent.add(m); return m;
  }
  const box = (p, m, x, y, z, w, h, d, ry = 0) => mesh(p, geometry.box, m, x, y, z, w, h, d, ry);
  const cyl = (p, m, x, y, z, r, h, ry = 0) => mesh(p, geometry.cylinder, m, x, y, z, r, h, r, ry);
  const sphere = (p, m, x, y, z, sx, sy = sx, sz = sx) => mesh(p, geometry.sphere, m, x, y, z, sx, sy, sz);
  function solid(p, mat, x, y, z, w, h, d, floor, ry = 0) {
    const m = box(p, mat, x, y, z, w, h, d, ry);
    if (floor !== undefined) { const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)); colliders.push({minX:x-(w*c+d*s)/2,maxX:x+(w*c+d*s)/2,minZ:z-(d*c+w*s)/2,maxZ:z+(d*c+w*s)/2,floor}); }
    return m;
  }
  function sign(p, text, x, y, z, w, h, ry = 0, color = '#dcf4a0', bg = '#142326') {
    const key = text + color + bg;
    if (!signCache.has(key)) {
      const texture = canvasTexture((c, cw, ch) => {
        c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.fillStyle = color;
        c.fillRect(28, ch * .25, 5, ch * .5);
        const lines = text.split('\n'); c.textBaseline = 'middle'; c.font = `600 ${lines.length > 1 ? 54 : 66}px Arial, sans-serif`;
        lines.forEach((l, i) => c.fillText(l, 62, ch * (.5 + (i - (lines.length - 1) / 2) * .32), cw - 105));
      }, 1024, 256);
      signCache.set(key, new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide}));
    }
    return mesh(p, geometry.plane, signCache.get(key), x, y, z, w, h, 1, ry);
  }
  const screenTextures = ['OYUNCU 01','TAKIM / CANLI','AZES / ANALİZ','YAYIN / CANLI'].map((title, idx) => canvasTexture((c, w, h) => {
    const grad = c.createLinearGradient(0, 0, w, h); grad.addColorStop(0, '#102b32'); grad.addColorStop(1, '#050f16'); c.fillStyle = grad; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#1f4147'; c.lineWidth = 1; for (let i = 0; i < 20; i++) { c.beginPath(); c.moveTo(i * 50, 40); c.lineTo(i * 50, h); c.stroke(); }
    for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(0, 65 + i * 50); c.lineTo(w, 65 + i * 50); c.stroke(); }
    c.fillStyle = '#c9f767'; c.fillRect(0, 0, w, 6); c.font = 'bold 25px Arial'; c.fillText(title, 30, 44); c.fillStyle = '#668e96'; c.font = '16px Arial'; c.fillText('PERFORMANS SİSTEMİ    •    05 ÇEVRİMİÇİ', 30, 76);
    if (idx === 2) {
      c.strokeStyle = '#7fa97a'; c.lineWidth = 4; c.strokeRect(76, 115, 400, 290); c.strokeRect(150, 170, 290, 150); c.strokeRect(255, 115, 90, 100);
      for (let i = 0; i < 10; i++) { c.fillStyle = i < 5 ? '#caf467' : '#78d3e0'; c.beginPath(); c.arc(110 + (i * 113) % 335, 160 + (i * 67) % 205, 9, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#a1c4c0'; c.font = '20px Arial'; ['14. TUR / İNCELEME','A PLANI','EKİPMAN  %83','TAKAS ORANI  %76'].forEach((t, i) => c.fillText(t, 540, 160 + i * 60));
    } else {
      c.strokeStyle = '#74d6de'; c.lineWidth = 4; c.beginPath(); c.moveTo(35, h - 85); for (let i = 0; i < 25; i++) c.lineTo(35 + i * 30, h - 110 - Math.sin(i * .8 + idx) * 55 - i * 5); c.stroke();
      c.fillStyle = '#caf467'; c.font = 'bold 62px Arial'; c.fillText(idx === 3 ? 'CANLI YAYIN' : 'HAZIR.', 42, 172);
      c.fillStyle = '#24464c'; for (let i = 0; i < 6; i++) c.fillRect(44 + i * 133, 221, 111, 72);
      c.fillStyle = '#a3c0bd'; c.font = '15px Arial'; c.fillText('ODAK   /   İSABET   /   TAKIM ÇALIŞMASI', 42, h - 27);
    }
  }, 900, 480));
  const screenMats = screenTextures.map(map => new THREE.MeshBasicMaterial({map, side: THREE.DoubleSide}));
  function screen(p, x, y, z, w = 1.2, h = .67, ry = 0, idx = 0, stand = true) {
    box(p, materials.black, x, y, z, w + .07, h + .07, .075, ry);
    const normal = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry));
    mesh(p, geometry.plane, screenMats[idx], x + normal.x * .041, y, z + normal.z * .041, w, h, 1, ry);
    if (stand) { cyl(p, materials.metal, x, y - h / 2 - .13, z, .035, .26); box(p, materials.black, x, y - h / 2 - .27, z + .04, .4, .035, .24, ry); }
  }
  function plant(p, x, z, size = 1, baseY = 0) {
    cyl(p, materials.white, x, baseY + .23 * size, z, .27 * size, .46 * size);
    cyl(p, materials.soil, x, baseY + .465 * size, z, .23 * size, .02);
    cyl(p, materials.oak, x, baseY + .95 * size, z, .035 * size, 1.0 * size);
    for (let i = 0; i < 7; i++) { const a = i * 2.4, yy = baseY + (.7 + i * .13) * size; const m = sphere(p, materials.leaf, x + Math.cos(a) * .25 * size, yy, z + Math.sin(a) * .25 * size, .14 * size, .32 * size, .11 * size); m.rotation.z = Math.cos(a) * .65; m.rotation.x = Math.sin(a) * .6; }
  }
  function chair(p, x, z, ry = 0, gaming = false, baseY = 0) {
    const g = new THREE.Group(); g.position.set(x, baseY, z); g.rotation.y = ry; p.add(g);
    cyl(g, materials.metal, 0, .25, 0, .045, .4);
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * .4; const leg = box(g, materials.graphite, Math.sin(a) * .16, .075, Math.cos(a) * .16, .055, .045, .39, a); sphere(g, materials.black, Math.sin(a) * .32, .055, Math.cos(a) * .32, .045); }
    box(g, gaming ? materials.graphite : materials.fabric, 0, .52, 0, .64, .14, .65);
    box(g, gaming ? materials.graphite : materials.fabric, 0, gaming ? 1.06 : .92, .30, .65, gaming ? .94 : .66, .13);
    if (gaming) {
      box(g, materials.lime, -.24, 1.1, .216, .075, .69, .025); box(g, materials.lime, .24, 1.1, .216, .075, .69, .025);
      box(g, materials.black, 0, 1.35, .20, .36, .17, .12);
    }
    for (const d of [-1, 1]) { box(g, materials.graphite, d * .39, .64, .02, .07, .36, .07); box(g, materials.black, d * .39, .81, -.04, .12, .07, .39); }
    colliders.push({minX:x-.45,maxX:x+.45,minZ:z-.45,maxZ:z+.45,floor:p===floors[1]?1:0});
    return g;
  }
  function seatAt(p,x,z,targetX,targetZ,gaming=false) {
    const seat=chair(p,x,z,Math.atan2(x-targetX,z-targetZ),gaming);
    seating.push({seat,target:new THREE.Vector3(targetX,p.position.y,targetZ)});
    return seat;
  }
  function desk(p, x, z, w, d, floor, ry = 0, y = .76) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g);
    box(g, materials.oak, 0, y, 0, w, .09, d);
    for (const a of [-1, 1]) for (const b of [-1, 1]) box(g, materials.graphite, a * (w / 2 - .13), y / 2, b * (d / 2 - .13), .065, y, .065);
    if (floor !== undefined) { const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)); colliders.push({minX:x-(w*c+d*s)/2,maxX:x+(w*c+d*s)/2,minZ:z-(d*c+w*s)/2,maxZ:z+(d*c+w*s)/2,floor}); }
    return g;
  }
  function keyboard(p, x, y, z, ry = 0) {
    box(p, materials.black, x, y, z, .49, .025, .18, ry);
    for (let row = 0; row < 3; row++) box(p, row === 0 ? materials.cyan : materials.metal, x, y + .016, z + (row - 1) * .045, .43, .005, .018, ry);
    sphere(p, materials.black, x + .38, y + .025, z, .045, .025, .075);
  }
  function pc(p, x, z, y = 0) {
    box(p, materials.graphite, x, y + .32, z, .31, .64, .52);
    box(p, materials.tinted, x + .16, y + .33, z, .012, .55, .43);
    for (let k = 0; k < 3; k++) { const ring = mesh(p, geometry.torus, k % 2 ? materials.cyan : materials.led, x, y + .15 + k * .17, z + .268, .07, .07, .07); }
    box(p, materials.led, x + .167, y + .34, z, .018, .47, .012);
  }
  function sofa(p, x, z, w = 3.1, ry = 0, floor) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g);
    box(g, materials.graphite, 0, .15, 0, w - .2, .2, .95); box(g, materials.fabric, 0, .37, 0, w - .52, .35, 1.04);
    box(g, materials.fabric, 0, .77, -.48, w - .52, .64, .24); for (const a of [-1, 1]) box(g, materials.darkFabric, a * (w / 2 - .12), .65, 0, .24, .5, 1.1);
    for (let i = 0; i < 3; i++) box(g, i === 1 ? materials.lime : materials.blueLinen, (i - 1) * w / 3, .7, -.27, .43, .38, .15, .15 * (i - 1));
    if (floor !== undefined) { const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)); colliders.push({minX:x-(w*c+1.1*s)/2,maxX:x+(w*c+1.1*s)/2,minZ:z-(1.1*c+w*s)/2,maxZ:z+(1.1*c+w*s)/2,floor}); }
  }
  function ceilingLight(p, x, z, w = 3.2, d = .13) {
    const panel = box(p, materials.warmLight, x, 3.52, z, w, .045, d); panel.userData.ceiling = true;
    const rail = box(p, materials.graphite, x, 3.57, z, w + .1, .06, d + .06); rail.userData.ceiling = true;
  }
  function roomSign(p, text, side, z) { sign(p, text, side * (z < -3.1 ? 2.255 : 1.855), 2.65, z, 1.36, .36, side < 0 ? Math.PI / 2 : -Math.PI / 2); }
  const roomNames = [['01  ANTRENMAN','02  ANALİZ','03  İÇERİK'],['04  TAKIM SALONU','05  BESLENME','06  TOPARLANMA'],['07  YAŞAM A','08  YAŞAM B','09  DUŞ / BAKIM'],['10  KOÇ / YÖNETİM','11  SESSİZ ODA','12  TERAS']];
  // Architectural shell: a 4 m circulation spine links six rooms on each level.
  floors.forEach((p, floor) => {
    if (!floor) box(p, materials.concrete, 0, -.17, 0, 28.5, .3, 22.5);
    else {
      box(p, materials.concrete, -8, -.16, 0, 12, .28, 22.4); box(p, materials.concrete, 8, -.16, 0, 12, .28, 22.4);
      box(p, materials.concrete, 0, -.16, 3.95, 4, .28, 14.1);
      box(p, materials.concrete, 0, -.16, -10.05, 4.8, .28, 1.9);
      for (const side of [-1,1]) box(p, materials.oak, side * 1.6, -.08, -6.1, 1.6, .16, 6.0);
    }
    box(p, materials.oak, 0, .005, 3.95, 3.8, .035, 14.1);
    for (const side of [-1, 1]) {
      // Corridor walls split at three real, walkable door openings.
      for (const [a, b] of [[-11,-8.12],[-5.88,-3.1],[-3.1,-1.12],[1.12,5.88],[8.12,11]]) solid(p, materials.wall, side * ((a+b)/2 < -3.1 ? CIRCULATION.rearHalfWidth : 2), 1.8, (a + b) / 2, .18, 3.6, b - a, floor);
      for (const z of [7, 0, -7]) {
        const wallX=side*(z < -3.1 ? CIRCULATION.rearHalfWidth : 2);
        box(p, materials.wall, wallX, 3.25, z, .18, .7, 2.24);
        const pivot = new THREE.Group(); pivot.position.set(wallX, 0, z - 1.06); p.add(pivot);
        box(pivot, materials.graphite, 0, 1.33, 1.06, .09, 2.66, 2.12);
        box(pivot, materials.tinted, -.052 * side, 1.43, 1.06, .012, 2.25, 1.83);
        box(pivot, materials.metal, -.11 * side, 1.1, 1.89, .16, .035, .26);
        const open = side * Math.PI * .46; pivot.rotation.y = open;
        doors.push({pivot, closed: 0, open, axis: 'y', floor, target: open, isOpen: true});
        for (const zz of [z - 1.13, z + 1.13]) box(p, materials.graphite, wallX, 1.35, zz, .23, 2.7, .065);
        box(p, materials.graphite, wallX, 2.71, z, .23, .065, 2.32);
      }
      for (const z of [3,-4]) solid(p, materials.wall, side * 8, 1.8, z, 12, 3.6, .18, floor);
      // Long side windows: concrete plinth, glazing, slender structure.
      solid(p, materials.wall, side * 14, .4, 0, .24, .8, 22, floor);
      box(p, materials.wall, side * 14, 3.43, 0, .24, .34, 22);
      box(p, materials.glass, side * 14, 2.08, 0, .045, 2.55, 22);
      colliders.push({minX:side * 14 - .14,maxX:side * 14 + .14,minZ:-11,maxZ:11,floor});
      for (const z of [-10.95,-7,-4,0,3,7,10.95]) box(p, materials.graphite, side * 14, 2.1, z, .25, 2.7, .075);
      for (const z of [11,-11]) {
        solid(p, materials.wall, side * 8, .4, z, 12, .8, .24, floor);
        box(p, materials.wall, side * 8, 3.43, z, 12, .34, .24);
        box(p, materials.glass, side * 8, 2.08, z, 12, 2.55, .045);
        colliders.push({minX:side < 0 ? -14 : 2,maxX:side < 0 ? -2 : 14,minZ:z-.14,maxZ:z+.14,floor});
        for (let x = side < 0 ? -14 : 2; x <= (side < 0 ? -2 : 14); x += 3) box(p, materials.graphite, x, 2.1, z, .065, 2.7, .25);
      }
      for (let i = 0; i < 3; i++) roomSign(p, roomNames[floor * 2 + (side > 0 ? 1 : 0)][i], side, [7,0,-7][i]);
    }
    // Upper floor terrace is open to sky; ceilings have independent cutaway tags.
    for (const [x, z, w, d] of [[-8,0,12,22],[8,floor ? 3.5 : 0,12,floor ? 15 : 22],[0,4,4,14]]) {
      const m = box(p, materials.white, x, 3.67, z, w, .12, d); m.userData.ceiling = true;
    }
    for (const z of [9.6,4.2,1.6,-2.5]) ceilingLight(p, 0, z, 1.25, .3);
    box(p, materials.led, -1.84, .09, 4, .035, .06, 13.8); box(p, materials.led, 1.84, .09, 4, .035, .06, 13.8);
    // The top central back landing and external entry glazing.
    if (floor) {
      box(p, materials.glass, 0, 1.9, 11, 4, 3.4, .055);
      colliders.push({minX:-2,maxX:2,minZ:10.88,maxZ:11.12,floor});
    } else {
      for (const side of [-1,1]) { box(p, materials.graphite, side * 1.75, 1.6, 11, .1, 3.2, .16); box(p, materials.glass, side * 1.35, 1.55, 11, .7, 3.0, .055); }
      box(p, materials.graphite, 0, 3.2, 11, 3.6, .18, .2); sign(p, 'AZES  /  HOŞ GELDİNİZ', 0, 2.88, 10.85, 2.1, .34, Math.PI);
    }
    solid(p, materials.wall, 0, 1.8, -11, 4, 3.6, .2, floor);
    sign(p, floor ? '01  /  İYİ YAŞA. DAHA İYİ OYNA.' : '00  /  BİR SONRAKİ SEVİYE İÇİN.', 0, 2.7, -10.87, 3.2, .55);
  });
  // Surface palette makes every activity zone legible in the dollhouse view.
  for (const [floor,x,z,w,d,mat] of [[0,-8,7,11.8,7.8,materials.carpet],[0,-8,-.5,11.8,6.8,materials.oak],[0,-8,-7.5,11.8,6.8,materials.carpet],[0,8,7,11.8,7.8,materials.oak],[0,8,-.5,11.8,6.8,materials.tile],[0,8,-7.5,11.8,6.8,materials.rubber],[1,-8,7,11.8,7.8,materials.oak],[1,-8,-.5,11.8,6.8,materials.oak],[1,-8,-7.5,11.8,6.8,materials.tile],[1,8,7,11.8,7.8,materials.oak],[1,8,-.5,11.8,6.8,materials.fabric],[1,8,-7.5,11.8,6.8,materials.oak]]) box(floors[floor], mat, x, .025, z, w, .045, d);
  // Straight stair, deliberately free of obstacle boxes: navigation follows its slope.
  for (let i = 0; i < 24; i++) {
    const h = (i + 1) * .175, z = CIRCULATION.stairStartZ - (i + .5) * .25;
    box(floors[0], materials.oak, 0, h - .1, z, 1.6, .2, .27);
    box(floors[0], materials.graphite, 0, h - .2, z + .11, 1.6, .2, .035);
    box(floors[0], materials.led, .63, h + .008, z + .08, .18, .015, .025);
  }
  for (const side of [-1,1]) {
    for (let i = 0; i <= 6; i++) { const z = CIRCULATION.stairStartZ - i; cyl(floors[0], materials.metal, side * .77, i * .7 + .52, z, .028, 1.04); }
    const rail = box(floors[0], materials.oak, side * .77, 3.1, -6.1, .07, .07, 7.32); rail.rotation.x = .61;
    const glass = box(floors[0], materials.glass, side * .77, 2.65, -6.1, .025, .78, 7.25); glass.rotation.x = .61;
    solid(floors[1], materials.glass, side * .8, .53, -6.1, .035, 1.06, 5.7, 1);
    box(floors[1], materials.metal, side * .8, 1.08, -6.1, .05, .045, 5.7);
  }
  solid(floors[1], materials.glass, 0, .53, -3.23, 1.6, 1.06, .035, 1);
  box(floors[1], materials.metal, 0, 1.08, -3.23, 1.65, .045, .05);
  sign(floors[0], '↑   YAŞAM / DİNLENME', 1.84, 2.8, -3.5, 1.95, .36, -Math.PI/2);
  // 01: six player workstations, with a separate dual-monitor coach station.
  const g = floors[0];
  [-12.5,-10.65,-8.8,-6.95,-5.1,-3.25].forEach((x,i) => {
    const st = desk(g,x,9.65,1.7,.83,0);
    screen(st,0,1.37,.19,1.10,.65,Math.PI,i % 2); keyboard(st,0,.82,-.17); pc(st,.65,0,.82);
    seatAt(g,x,8.35,x,9.65,true);
    sign(g,`0${i+1} / HAZIR`,x,2.97,10.84,1.6,.3,Math.PI);
  });
  { const st = desk(g,-11.6,4.38,2.8,.9,0); screen(st,-.52,1.4,-.2,1.15,.65,0,2); screen(st,.7,1.4,-.2,1.15,.65,0,1); keyboard(st,0,.83,.15); seatAt(g,-11.6,5.65,-11.6,4.38,true); pc(g,-10.7,4.4); }
  screen(g,-13.82,2.22,6.8,3.4,1.82,Math.PI/2,1,false);
  for (let i=0;i<6;i++) { const a = box(g,materials.graphite,-13.77,2.5,3.7+i*.55,.12,1.1,.25); }
  box(g,materials.led,-8,3.27,10.83,11.1,.045,.05); ceilingLight(g,-8,7,8,.15); ceilingLight(g,-8,5,8,.15); plant(g,-3,3.9,.8);
  solid(g,materials.graphite,-4.4,.96,4.25,.8,1.9,.68,0);
  box(g,materials.tinted,-4.4,1.1,4.602,.68,1.48,.025);
  for(let i=0;i<8;i++){box(g,materials.black,-4.4,.45+i*.155,4.63,.61,.11,.04);box(g,materials.led,-4.64,.46+i*.155,4.66,.035,.025,.015);}
  sign(g,'AĞ / KESİNTİSİZ GÜÇ',-4.4,2.13,4.65,1.15,.21);
  // 02: a dedicated review room with tactical wall and coach seating.
  screen(g,-9.1,2.17,-3.82,5.5,2.62,0,2,false);
  desk(g,-10,-.25,4.6,2,0,0,.77);
  for (let i=0;i<3;i++) { seatAt(g,-11.5+i*1.5,1.3,-11.5+i*1.5,-.25); seatAt(g,-11.5+i*1.5,-1.8,-11.5+i*1.5,-.25); }
  box(g,materials.graphite,-10,.83,-.25,1.25,.035,.72); screen(g,-10,1.06,-.25,.65,.37,0,2,false);
  sign(g,'İNCELE. UYARLA. KAZAN.',-13.82,2.6,-.4,4.3,.65,Math.PI/2); plant(g,-3.1,-3.0); ceilingLight(g,-8,.5,8,.17);
  box(g,materials.white,-4.1,1.48,-3.82,2.2,1.65,.075);
  for (let i=0;i<4;i++) box(g,i%2?materials.cyan:materials.lime,-4.7+i*.4,1.68-(i%2)*.37,-3.76,.22,.22,.025);
  // 03: creator room: acoustic booth, streaming desk, interview set and camera.
  for (let i=0;i<15;i++) box(g,i%2?materials.graphite:materials.darkFabric,-13.76,2.0,-10.55+i*.41,.18,2.8,.29);
  const st = desk(g,-11.0,-9.55,4.0,.96,0); screen(st,-.75,1.4,-.18,1.28,.72,0,3); screen(st,.65,1.4,-.18,1.28,.72,0,1); keyboard(st,0,.83,.16); pc(st,1.6,0,.82); seatAt(g,-11,-8.25,-11,-9.55,true);
  box(g,materials.graphite,-11,1.53,-9.57,.05,.03,.8); cyl(g,materials.metal,-11,1.7,-9.17,.035,.34); sphere(g,materials.black,-11,1.91,-9.17,.06,.12,.06);
  sofa(g,-4.4,-9.65,2.65,0,0); cyl(g,materials.oak,-5.4,.4,-8.2,.66,.09); cyl(g,materials.graphite,-5.4,.21,-8.2,.08,.4);
  sign(g,'AZES\nİÇERİK STÜDYOSU',-4.6,2.3,-10.84,3.8,.95,0); box(g,materials.cyan,-4.6,3.15,-10.8,4.5,.04,.04);
  const camera = new THREE.Group(); camera.position.set(-5.3,0,-5.5); camera.rotation.y=Math.PI; g.add(camera);
  for(const a of [0,2.1,4.2]) { const leg=box(camera,materials.metal,Math.sin(a)*.25,.65,Math.cos(a)*.25,.04,1.35,.04); leg.rotation.z=Math.cos(a)*.34; leg.rotation.x=Math.sin(a)*.34; }
  box(camera,materials.black,0,1.45,0,.42,.32,.32); cyl(camera,materials.black,0,1.45,.29,.15,.34).rotation.x=Math.PI/2; box(camera,materials.led,.25,1.57,0,.04,.04,.04);
  for(const [x,z,ry] of [[-3.1,-5.2,-.45],[-7.8,-10.0,.65]]) {
    cyl(g,materials.metal,x,1.1,z,.025,2.2); const light=box(g,materials.warmLight,x,2.3,z,.85,.66,.09,ry); light.rotation.x=-.18;
    for(const a of [0,2.1,4.2]) box(g,materials.black,x+Math.sin(a)*.24,.03,z+Math.cos(a)*.24,.045,.05,.55,a);
  }
  ceilingLight(g,-8,-7,8,.15);
  // 04: team lounge, trophy library and social lounge away from practice.
  sofa(g,10.25,8.75,5.0,0,0); sofa(g,12.75,6.1,2.7,-Math.PI/2,0);
  solid(g,materials.oak,10.2,.39,6.15,2.8,.15,1.25,0); for(const x of [9.3,11.1]) cyl(g,materials.graphite,x,.19,6.15,.035,.34);
  box(g,materials.fabric,9.8,.07,6.7,6.1,.04,4.7); screen(g,8.3,2.17,3.15,5.0,2.5,0,1,false);
  solid(g,materials.oak,8.3,.35,3.55,5.2,.6,.6,0); box(g,materials.led,8.3,.17,3.88,5,.025,.02);
  for(const x of [4.3,6,7.7]) { box(g,materials.oak,x,1.6,10.55,1.5,.08,.5); box(g,materials.graphite,x,1.58,10.8,1.5,1.45,.045); }
  for(let i=0;i<6;i++) { const x=3.9+i*.7; cyl(g,materials.gold,x,1.84,10.55,.12,.34); cyl(g,materials.graphite,x,1.66,10.55,.16,.06); const cup=mesh(g,geometry.cone,materials.gold,x,2.06,10.55,.22,.22,.22); cup.rotation.z=Math.PI; }
  sign(g,'TAKIM\nOYUNUN ÖTESİNDE',13.83,2.7,6.7,4.2,.85,-Math.PI/2); plant(g,13,10.2,1.25); plant(g,3.1,10,.9); ceilingLight(g,8,7,8,.15);
  // 05: nutrition: full kitchen, coffee/water station and shared dining.
  for(let i=0;i<5;i++) {
    const x=7.2+i*1.25; solid(g,materials.graphite,x,.47,-3.3,1.22,.93,1.15,0); box(g,materials.oak,x,.97,-3.3,1.26,.08,1.2);
    box(g,materials.white,x,2.3,-3.65,1.2,.8,.45); box(g,materials.led,x,1.87,-3.4,1.1,.025,.035); box(g,materials.metal,x,.55,-2.71,.4,.025,.035);
  }
  solid(g,materials.metal,3.55,1.15,-3.25,1.15,2.3,1.1,0); box(g,materials.graphite,3.55,1.45,-2.68,.94,.025,.02); box(g,materials.metal,3.98,1.35,-2.66,.04,.8,.04);
  box(g,materials.black,8.5,1.03,-3.3,1.1,.035,.73); for(const x of [8.25,8.75]) for(const z of [-3.5,-3.1]) cyl(g,materials.metal,x,1.055,z,.16,.012);
  box(g,materials.black,8.45,.51,-2.71,.87,.55,.025); box(g,materials.glass,8.45,.51,-2.69,.73,.39,.016);
  box(g,materials.metal,11.9,1.025,-3.3,.85,.03,.62); box(g,materials.black,11.9,1.043,-3.3,.65,.012,.43); cyl(g,materials.metal,11.9,1.22,-3.62,.025,.39); box(g,materials.metal,11.9,1.41,-3.51,.05,.035,.25);
  solid(g,materials.oak,10.45,.77,.25,4.65,.11,2.0,0); for(const x of [8.5,12.4]) for(const z of [-.45,.95]) box(g,materials.graphite,x,.37,z,.075,.7,.075);
  for(let i=0;i<3;i++){seatAt(g,9+i*1.4,1.9,9+i*1.4,.25);seatAt(g,9+i*1.4,-1.3,9+i*1.4,.25);cyl(g,materials.white,9+i*1.4,.84,.25,.2,.02);cyl(g,materials.glass,9.45+i*1.4,.92,.25,.055,.17);}
  cyl(g,materials.white,10.5,.91,.3,.28,.15); for(let i=0;i<5;i++) sphere(g,i%2?materials.lime:materials.gold,10.45+Math.sin(i*2)*.15,1.04,.3+Math.cos(i*2)*.15,.09);
  solid(g,materials.white,3.65,.6,1.9,1.8,1.2,.65,0); box(g,materials.black,3.6,1.51,1.9,.5,.6,.42); cyl(g,materials.metal,4.15,1.37,1.9,.14,.35);
  sign(g,'PERFORMANSINI BESLE',8.1,3.08,-3.85,7.3,.4); plant(g,13,2.05,.8); ceilingLight(g,8,-.2,8,.15);
  // 06: performance and recovery: strength, cardio, mobility and physio.
  box(g,materials.metal,13.78,1.95,-7.7,.035,2.7,5.2); box(g,materials.tinted,13.75,1.95,-7.7,.02,2.65,5.1);
  for(const x of [9.5,11.7]) {
    solid(g,materials.graphite,x,.15,-9.4,1.5,.27,2.6,0); box(g,materials.rubber,x,.30,-9.4,1.13,.025,2.25);
    for(const s of [-1,1]) { const bar=box(g,materials.metal,x+s*.58,.98,-10.0,.055,1.5,.055); bar.rotation.x=-.15; }
    box(g,materials.graphite,x,1.68,-10.15,1.3,.12,.38); screen(g,x,1.78,-10.12,.66,.33,0,0,false);
  }
  for(const x of [3.2,5.4]) { box(g,materials.graphite,x,1.4,-10.3,.1,2.8,.12); box(g,materials.graphite,x,.14,-9.4,.14,.16,2.0); }
  box(g,materials.graphite,4.3,2.74,-10.3,2.4,.12,.14); const bar=cyl(g,materials.metal,4.3,1.76,-10.05,.035,2.5); bar.rotation.z=Math.PI/2;
  for(const x of [3.25,3.45,5.15,5.35]) { const disk=cyl(g,materials.black,x,1.76,-10.05,.3,.09); disk.rotation.z=Math.PI/2; }
  solid(g,materials.graphite,4.3,.51,-8.7,.72,.12,2.0,0); for(const z of [-9.3,-8.1]) box(g,materials.metal,4.3,.25,z,.6,.44,.05);
  solid(g,materials.graphite,12.55,.65,-5.1,2,.12,.6,0); for(let i=0;i<5;i++) {
    const x=11.8+i*.37; const d=cyl(g,materials.metal,x,.82,-5.1,.025,.38); d.rotation.z=Math.PI/2;
    for(const xx of [x-.14,x+.14]) { const d2=cyl(g,materials.black,xx,.82,-5.1,.095,.075); d2.rotation.z=Math.PI/2; }
  }
  box(g,materials.blueLinen,7.8,.075,-5.5,1.2,.04,2.25); box(g,materials.lime,9.6,.075,-5.5,1.2,.04,2.25);
  solid(g,materials.white,3.75,.7,-5.4,2.2,.18,1.25,0); box(g,materials.blueLinen,3.75,.82,-5.4,2.0,.07,1.13); sign(g,'HAREKET / TOPARLANMA / TEKRAR',8.1,3.14,-10.85,7.5,.4); ceilingLight(g,8,-7.2,8,.15);
  // 07–08: six single beds, individual storage and calm desk corners.
  const u=floors[1];
  function bed(p,x,z,floor,n) {
    const half=n>3?1.1:1.325;
    solid(p,materials.oak,x,.28,z,1.9,.45,half*2,floor); box(p,materials.linen,x,.57,z,1.82,.25,half*2-.1);
    box(p,materials.oak,x,1.0,z+half+.055,2.08,1.45,.13); box(p,materials.blueLinen,x,.73,z-.25,1.84,.1,half*1.2);
    box(p,materials.linen,x,.75,z+half-.45,1.25,.18,.47); box(p,materials.lime,x,.79,z-.83,1.84,.035,.37);
    box(p,materials.oak,x+1.3,.42,z+.82,.58,.72,.65); cyl(p,materials.graphite,x+1.3,.95,z+.82,.025,.35); cyl(p,materials.warmLight,x+1.3,1.18,z+.82,.2,.23);
    sign(p,`OYUNCU ${n}`,x,1.91,z+half+.135,1.25,.24,Math.PI);
  }
  [-12,-8.3,-4.6].forEach((x,i)=> {bed(u,x,9.35,1,i+1);bed(u,x,1.5,1,i+4);});
  // Each sleeping alcove gains a privacy screen and a partially drawn curtain.
  for(const z of [9.35,1.5]){
    for(const x of [-10.15,-6.45])solid(u,materials.oak,x,1.18,z,.09,2.36,z<3?2.4:2.85,1);
    for(const x of [-12.7,-9,-5.3])box(u,materials.fabric,x,1.98,z+(z<3?1.155:1.38),1.15,2.5,.045);
  }
  for(const z of [4.05,-2.96]) {
    solid(u,materials.white,-11.4,1.25,z,4.15,2.5,.8,1); for(const x of [-12.7,-11.4,-10.1]) {box(u,materials.oak,x,1.25,z+.415,.028,2.35,.02);box(u,materials.metal,x+.25,1.3,z+.44,.035,.34,.035);}
    const dg=desk(u,-5.4,z+.18,3.5,.8,1); screen(dg,0,1.35,-.17,1.15,.65,0,0); keyboard(dg,0,.82,.15); seatAt(u,-5.4,z+1.34,-5.4,z+.18); plant(u,-13.1,z+1.3,.65);
  }
  ceilingLight(u,-8,6.7,8,.14); ceilingLight(u,-8,-1.2,8,.14);
  // 09: shower suites, WC enclosures, double vanity and a separate laundry wall.
  for(const x of [-12.4,-9.8]) {
    solid(u,materials.tile,x,.09,-9.3,2.3,.15,2.5,1); box(u,materials.glass,x+1.13,1.3,-9.3,.035,2.5,2.5); box(u,materials.glass,x,1.3,-8.05,2.3,2.5,.035);
    cyl(u,materials.metal,x,1.65,-10.65,.025,1.9); const head=cyl(u,materials.metal,x,2.55,-10.4,.18,.04); box(u,materials.metal,x,2.57,-10.55,.04,.04,.3);
  }
  for(const x of [-6.65,-4.1]) { solid(u,materials.wall,x+1.05,1.35,-9.35,.12,2.7,2.5,1); box(u,materials.white,x,.47,-9.85,.75,.75,1); sphere(u,materials.white,x,.46,-9.15,.42,.24,.62); box(u,materials.white,x,.73,-9.35,.72,.08,.9); }
  solid(u,materials.oak,-10.8,.8,-4.65,5.1,.18,1.0,1); box(u,materials.white,-10.8,.41,-4.65,4.9,.75,.88);
  for(const x of [-12.1,-9.55]) {cyl(u,materials.white,x,.95,-4.65,.43,.14);cyl(u,materials.metal,x,1.1,-4.94,.025,.35);box(u,materials.metal,x,1.25,-4.84,.04,.04,.23);box(u,materials.metal,x,1.94,-4.13,1.75,1.45,.045);}
  for(const x of [-5.7,-4.3]) {
    solid(u,materials.white,x,.63,-4.74,1.18,1.25,1.02,1); const ring=mesh(u,geometry.torus,materials.metal,x,.58,-5.26,.37,.37,.37); mesh(u,geometry.plane,materials.tinted,x,.58,-5.27,.61,.61,1,Math.PI);
    box(u,materials.graphite,x,1.08,-5.26,.9,.15,.025); box(u,materials.oak,x,1.4,-4.74,1.25,.08,1.05);
  }
  sign(u,'DİNLEN / YENİLEN',-7.9,3.08,-10.86,5.9,.4); ceilingLight(u,-8,-7,8,.18);
  // 10: head coach, administration and confidential one-to-one meetings.
  const cd=desk(u,10.6,9.25,4.5,1.1,1); screen(cd,-.65,1.46,.07,1.3,.73,Math.PI,2); screen(cd,.75,1.46,.07,1.3,.73,Math.PI,1); keyboard(cd,0,.83,-.25);
  seatAt(u,10.6,10.35,10.6,9.25,true); seatAt(u,9.7,7.8,9.7,9.25); seatAt(u,11.4,7.8,11.4,9.25);
  desk(u,5.15,4.95,3.4,1.25,1); seatAt(u,4.5,6.15,4.5,4.95);seatAt(u,5.9,6.15,5.9,4.95);seatAt(u,5.2,3.9,5.2,4.95);
  for(let i=0;i<4;i++) {box(u,materials.oak,13.48,.5+i*.68,7,.65,.07,5.0);for(let j=0;j<5;j++)box(u,j%2?materials.white:materials.lime,13.45,.8+i*.68,5.3+j*.76,.33,.5,.12);}
  sign(u,'KOÇ / TAKIM YÖNETİMİ',9.3,2.75,3.14,6.8,.55); plant(u,3.1,10,.9); ceilingLight(u,8,7,8,.15);
  // 11: restorative room, soft daylight and a quiet reading zone.
  sofa(u,11.3,-2.8,3.1,0,1); seatAt(u,12.4,.6,10.5,-.4); cyl(u,materials.oak,10.5,.46,-.4,.68,.1); cyl(u,materials.graphite,10.5,.23,-.4,.06,.43);
  box(u,materials.linen,5.5,.07,-.3,3.6,.06,4.7); box(u,materials.blueLinen,5.0,.14,-.4,1.1,.1,2.2); box(u,materials.fabric,6.5,.14,-.4,1.1,.1,2.2);
  sphere(u,materials.darkFabric,4.7,.3,1.9,.5,.26,.5); sphere(u,materials.darkFabric,6.4,.3,1.9,.5,.26,.5);
  for(let i=0;i<6;i++) {box(u,materials.oak,13.45,.4+i*.45,-1,.7,.06,4.2); for(let j=0;j<7;j++)box(u,j%3?materials.fabric:materials.blueLinen,13.4,.63+i*.45,-2.6+j*.5,.36,.37,.11);}
  sign(u,'NEFES AL. DİNLEN. YENİLEN.',8.2,2.92,-3.85,8.1,.48); plant(u,3.2,-3.05,1.25);plant(u,12.9,2.0,1.3);ceilingLight(u,8,0,8,.15);
  // 12: open air terrace: pergola, planter border and social tables.
  for(const x of [3.3,12.7]) for(const z of [-5,-10]) box(u,materials.oak,x,1.65,z,.16,3.3,.16);
  for(let i=0;i<12;i++) box(u,materials.oak,3.3+i*.855,3.35,-7.5,.1,.18,5.6);
  sofa(u,11.0,-9.75,3.2,0,1); sofa(u,12.8,-7.3,2.7,-Math.PI/2,1);
  solid(u,materials.oak,10.5,.42,-7.5,2.1,.12,1.1,1); cyl(u,materials.oak,8,.75,-5.6,.8,.1);cyl(u,materials.graphite,8,.36,-5.6,.06,.72);seatAt(u,6.8,-5.6,8,-5.6);seatAt(u,9.2,-5.6,8,-5.6);
  colliders.push({minX:7.2,maxX:8.8,minZ:-6.4,maxZ:-4.8,floor:1});
  for(const x of [4,6.5,9,11.5]) {solid(u,materials.graphite,x,.35,-10.35,2.25,.65,.65,1);for(const xx of [x-.6,x,x+.6])plant(u,xx,-10.35,.5,.66);}
  sign(u,'EKRANSIZ / BİRLİKTE',13.79,2.55,-7.5,4.3,.55,-Math.PI/2); plant(u,3.1,-9.1,1.2);
  // Roofs and external detailing are isolated for exploded/section views.
  box(roof,materials.graphite,-8,8.03,0,12.5,.38,22.8); box(roof,materials.graphite,8,8.03,3.5,12.5,.38,15.8);box(roof,materials.graphite,0,8.03,0,4.1,.38,22.8);
  box(roof,materials.concrete,-8,8.27,0,12.2,.12,22.4);box(roof,materials.concrete,8,8.27,3.5,12.2,.12,15.5);box(roof,materials.concrete,0,8.27,0,4,.12,22.4);
  for(let i=0;i<6;i++) for(let j=0;j<2;j++) {const panel=box(roof,materials.black,-12.2+i*1.65,8.44,-8+j*2.45,1.5,.07,2.1);panel.rotation.x=-.13;box(roof,materials.metal,-12.2+i*1.65,8.5,-8+j*2.45,.018,.01,2.05);}
  for(const x of [-14.13,14.13]) for(const z of [-11,3,11]) box(building,materials.graphite,x,3.94,z,.27,7.88,.3);
  for(const side of [-1,1]) {box(building,materials.graphite,side*8,4,11.15,12.3,.43,.45);box(building,materials.graphite,side*8,4,-11.15,12.3,.43,.45);}
  for(const x of [-13.1,-12.8,-12.5,-12.2,12.2,12.5,12.8,13.1]) box(building,materials.oak,x,4.05,11.28,.12,7.5,.24);
  box(building,materials.graphite,0,3.7,11.65,5.4,.27,2.2); box(building,materials.led,0,3.54,12.71,4.8,.035,.025);
  sign(building,'AZES',0,4.18,12.78,3.45,.65); sign(building,'E S P O R   /   T A K I M   E V İ',0,3.86,12.79,3.45,.19,0,'#eeeee8');
  // Landscape: native planting, accessible entry, visitor parking and garden loop.
  box(exterior,materials.grass,0,-.42,0,86,.3,75); box(exterior,materials.gravel,0,-.23,0,39,.09,29);
  box(exterior,materials.concrete,0,-.07,15.8,5.7,.12,10);box(exterior,materials.concrete,0,-.085,21,47,.1,3.4);
  box(exterior,materials.asphalt,24,-.10,8,9,.1,29);box(exterior,materials.asphalt,6,-.11,27,46,.1,7.5);
  for(let i=0;i<6;i++) {box(exterior,materials.white,24,-.038,-3+i*4.4,8.5,.018,.08);sign(exterior,`P ${i+1}`,28.1,.02,-1.2+i*4.4,1,.5,-Math.PI/2,'#d5e2c4','#46504d').rotation.x=-Math.PI/2;}
  function car(x,z,color) {
    const mat=new THREE.MeshStandardMaterial({color,roughness:.33,metalness:.45});box(exterior,mat,x,.47,z,3.9,.65,1.85);box(exterior,materials.tinted,x-.1,.99,z,2.05,.65,1.66);box(exterior,mat,x-.1,1.35,z,2.12,.1,1.72);
    for(const xx of [x-1.23,x+1.23]) for(const zz of [z-.9,z+.9]) {const tire=cyl(exterior,materials.black,xx,.28,zz,.36,.17);tire.rotation.x=Math.PI/2;const rim=cyl(exterior,materials.metal,xx,.28,zz+(zz>z?.1:-.1),.19,.035);rim.rotation.x=Math.PI/2;}
    for(const zz of [z-.59,z+.59]) {box(exterior,materials.warmLight,x-1.97,.59,zz,.025,.17,.32);box(exterior,materials.lime,x+1.97,.59,zz,.025,.14,.3);}
  }
  car(24,1,'#758887');car(24,10,'#d2d3c4');car(24,18.8,'#293b48');
  for(const side of [-1,1]) {
    box(exterior,materials.concrete,side*17,-.04,0,1.8,.08,24);
    for(const z of [-14,-5,4,14,22]) {
      const x=side*(z===22?18:20.5);cyl(exterior,materials.oak,x,1.1,z,.16,2.5);sphere(exterior,materials.leaf,x,3.1,z,1.85,2.1,1.85);sphere(exterior,materials.leaf,x+.9,3.2,z-.4,1.2,1.6,1.2);
    }
    for(const z of [-10,-4,3,10]) {box(exterior,materials.graphite,side*16.3,.2,z,1.15,.55,2.6);for(let i=0;i<3;i++)sphere(exterior,materials.leaf,side*16.3,.55,z-.8+i*.8,.5,.45,.5);}
    for(const z of [14,18.5,22]) {box(exterior,materials.graphite,side*3.5,.42,z,.12,.9,.12);box(exterior,materials.warmLight,side*3.5,.82,z,.16,.12,.16);}
  }
  for(const x of [-9,9]) {box(exterior,materials.oak,x,.47,16.4,4,.13,.65);for(const xx of [x-1.6,x+1.6])box(exterior,materials.graphite,xx,.22,16.4,.16,.45,.65);}
  box(exterior,materials.graphite,-8,.62,21,4.8,1.4,.36);sign(exterior,'AZES\nPERFORMANS. BİRLİKTE.',-8,.78,21.2,4.3,1.05);
  // Interior illumination: emissive strips plus six inexpensive area stand-ins.
  [[-8,7],[-8,-.5],[-8,-7.5],[8,7],[8,-.5],[8,-7.5]].forEach(([x,z])=> {const l=new THREE.PointLight('#fff1d5',8,15,1.5);l.position.set(x,3.1,z);l.castShadow=false;g.add(l);interiorLights.push(l);});
  const points=[['scrim',-7,1.7,7],['analysis',-6.5,1.7,0],['studio',-7,1.7,-7],['lounge',7,1.7,7],['nutrition',7,1.7,0],['gym',7,1.7,-7],['sleep-a',-7,5.9,7],['sleep-b',-7,5.9,-1.2],['bath',-7.5,5.9,-6.7],['coach',7,5.9,7],['quiet',8,5.9,0],['terrace',7,5.9,-7]];
  points.forEach(([id,x,y,z])=>hotspots.push({id,position:new THREE.Vector3(x,y,z)}));
  function setNight(night) {
    interiorLights.forEach(l=>{l.intensity=night?16:8;});
    materials.led.emissiveIntensity=night?1.6:.85;materials.warmLight.emissiveIntensity=night?1.15:.65;materials.cyan.emissiveIntensity=night?1.3:.8;
    materials.glass.opacity=night?.22:.17;
  }
  // Hundreds of repeated pieces share one draw call per geometry/material.
  // Hinged doors remain independent objects; ceilings remain independently hideable.
  function packStatic(parent, recursive = true, exclusions = new Set()) {
    parent.updateMatrixWorld(true);
    const inverse = parent.matrixWorld.clone().invert(), batches = new Map(), originals = [];
    function visit(object) {
      if (exclusions.has(object)) return;
      if (object.isMesh && !object.isInstancedMesh) {
        const key = object.geometry.uuid + '/' + object.material.uuid + '/' + !!object.userData.ceiling;
        if (!batches.has(key)) batches.set(key, []);
        batches.get(key).push(object); originals.push(object);
      }
      if (recursive || object === parent) for (const child of object.children) visit(child);
    }
    visit(parent);
    for (const batch of batches.values()) {
      if (batch.length < 3) continue;
      const instanced = new THREE.InstancedMesh(batch[0].geometry,batch[0].material,batch.length);
      instanced.name = `Detail batch / ${batch.length}`; instanced.userData.ceiling = !!batch[0].userData.ceiling;
      instanced.receiveShadow = true; instanced.castShadow = !batch[0].material.transparent;
      batch.forEach((m,i)=>{instanced.setMatrixAt(i,inverse.clone().multiply(m.matrixWorld));m.parent.remove(m);});
      instanced.instanceMatrix.needsUpdate=true;instanced.computeBoundingSphere();parent.add(instanced);
    }
  }
  floors.forEach(p=>packStatic(p,true,new Set(doors.map(d=>d.pivot))));
  packStatic(roof);packStatic(exterior);packStatic(building,false,new Set([...floors,roof]));
  building.updateMatrixWorld(true);exterior.updateMatrixWorld(true);
  return {building,floors,roof,exterior,colliders,doors,hotspots,animated,materials,setNight,seating,circulation:CIRCULATION};
}

