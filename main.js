import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { temperatureLocations, geoToLocal, getTemperatureColor, getDistrictColor, hongKongOutline } from './hk-geo.js';

// Scene setup
const canvas = document.getElementById('canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  canvas, 
  antialias: true,
  alpha: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0a0e17, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// CSS2D Renderer for labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('app').appendChild(labelRenderer.domElement);

// Camera position
camera.position.set(0, 30, 40);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI / 2.2;
controls.target.set(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(30, 50, 40);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 200;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0x22d3ee, 0.3);
fillLight.position.set(-20, 20, -30);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xfb923c, 0.2);
rimLight.position.set(0, 10, -40);
scene.add(rimLight);

// Store for district meshes
const districtMeshes = [];
const districtGroup = new THREE.Group();
scene.add(districtGroup);

// Earcut triangulation for complex polygons
function earcut(data, holeIndices, dim = 2) {
  const hasHoles = holeIndices && holeIndices.length;
  const outerLen = hasHoles ? holeIndices[0] * dim : data.length;
  let outerNode = linkedList(data, 0, outerLen, dim, true);

  const triangles = [];
  if (!outerNode || outerNode.next === outerNode.prev) return triangles;

  let minX, minY, maxX, maxY, x, y, invSize;

  if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

  if (data.length > 80 * dim) {
    minX = maxX = data[0];
    minY = maxY = data[1];
    for (let i = dim; i < outerLen; i += dim) {
      x = data[i];
      y = data[i + 1];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    invSize = Math.max(maxX - minX, maxY - minY);
    invSize = invSize !== 0 ? 1 / invSize : 0;
  }

  earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);
  return triangles;
}

function linkedList(data, start, end, dim, clockwise) {
  let last;
  if (clockwise === (signedArea(data, start, end, dim) > 0)) {
    for (let i = start; i < end; i += dim) {
      last = insertNode(i, data[i], data[i + 1], last);
    }
  } else {
    for (let i = end - dim; i >= start; i -= dim) {
      last = insertNode(i, data[i], data[i + 1], last);
    }
  }
  if (last && equals(last, last.next)) {
    removeNode(last);
    last = last.next;
  }
  if (last) {
    last.next.prev = last;
    last.prev.next = last;
  }
  return last;
}

function signedArea(data, start, end, dim) {
  let sum = 0;
  for (let i = start, j = end - dim; i < end; i += dim) {
    sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
    j = i;
  }
  return sum;
}

function insertNode(i, x, y, last) {
  const p = { i, x, y, prev: null, next: null, z: null, prevZ: null, nextZ: null, steiner: false };
  if (!last) {
    p.prev = p;
    p.next = p;
  } else {
    p.next = last.next;
    p.prev = last;
    last.next.prev = p;
    last.next = p;
  }
  return p;
}

function removeNode(p) {
  p.next.prev = p.prev;
  p.prev.next = p.next;
  if (p.prevZ) p.prevZ.nextZ = p.nextZ;
  if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function equals(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}

function eliminateHoles(data, holeIndices, outerNode, dim) {
  const queue = [];
  for (let i = 0, len = holeIndices.length; i < len; i++) {
    const start = holeIndices[i] * dim;
    const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
    const list = linkedList(data, start, end, dim, false);
    if (list === list.next) list.steiner = true;
    queue.push(getLeftmost(list));
  }
  queue.sort((a, b) => a.x - b.x);
  for (let i = 0; i < queue.length; i++) {
    outerNode = eliminateHole(queue[i], outerNode);
  }
  return outerNode;
}

function getLeftmost(start) {
  let p = start, leftmost = start;
  do {
    if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) leftmost = p;
    p = p.next;
  } while (p !== start);
  return leftmost;
}

function eliminateHole(hole, outerNode) {
  const bridge = findHoleBridge(hole, outerNode);
  if (!bridge) return outerNode;
  const bridgeReverse = splitPolygon(bridge, hole);
  filterPoints(bridgeReverse, bridgeReverse.next);
  return filterPoints(bridge, bridge.next);
}

function findHoleBridge(hole, outerNode) {
  let p = outerNode;
  const hx = hole.x, hy = hole.y;
  let qx = -Infinity, m;
  do {
    if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
      const x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
      if (x <= hx && x > qx) {
        qx = x;
        m = p.x < p.next.x ? p : p.next;
        if (x === hx) return m;
      }
    }
    p = p.next;
  } while (p !== outerNode);
  if (!m) return null;
  return m;
}

function splitPolygon(a, b) {
  const a2 = { i: a.i, x: a.x, y: a.y, prev: null, next: null, z: null, prevZ: null, nextZ: null, steiner: false };
  const b2 = { i: b.i, x: b.x, y: b.y, prev: null, next: null, z: null, prevZ: null, nextZ: null, steiner: false };
  const an = a.next, bp = b.prev;
  a.next = b;
  b.prev = a;
  a2.next = an;
  an.prev = a2;
  b2.next = a2;
  a2.prev = b2;
  bp.next = b2;
  b2.prev = bp;
  return b2;
}

function filterPoints(start, end) {
  if (!end) end = start;
  let p = start, again;
  do {
    again = false;
    if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
      removeNode(p);
      p = end = p.prev;
      if (p === p.next) break;
      again = true;
    } else {
      p = p.next;
    }
  } while (again || p !== end);
  return end;
}

function area(p, q, r) {
  return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
  if (!ear) return;
  if (!pass && invSize) indexCurve(ear, minX, minY, invSize);
  let stop = ear;
  while (ear.prev !== ear.next) {
    const prev = ear.prev, next = ear.next;
    if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
      triangles.push(prev.i / dim, ear.i / dim, next.i / dim);
      removeNode(ear);
      ear = next.next;
      stop = next.next;
      continue;
    }
    ear = next;
    if (ear === stop) {
      if (!pass) {
        earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
      } else if (pass === 1) {
        ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
        earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
      } else if (pass === 2) {
        splitEarcut(ear, triangles, dim, minX, minY, invSize);
      }
      break;
    }
  }
}

function isEar(ear) {
  const a = ear.prev, b = ear, c = ear.next;
  if (area(a, b, c) >= 0) return false;
  let p = ear.next.next;
  while (p !== ear.prev) {
    if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
    p = p.next;
  }
  return true;
}

function isEarHashed(ear, minX, minY, invSize) {
  const a = ear.prev, b = ear, c = ear.next;
  if (area(a, b, c) >= 0) return false;
  const minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x);
  const minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y);
  const maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x);
  const maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);
  const minZ = zOrder(minTX, minTY, minX, minY, invSize);
  const maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);
  let p = ear.prevZ, n = ear.nextZ;
  while (p && p.z >= minZ && n && n.z <= maxZ) {
    if (p !== ear.prev && p !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
    p = p.prevZ;
    if (n !== ear.prev && n !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
    n = n.nextZ;
  }
  while (p && p.z >= minZ) {
    if (p !== ear.prev && p !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
    p = p.prevZ;
  }
  while (n && n.z <= maxZ) {
    if (n !== ear.prev && n !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
    n = n.nextZ;
  }
  return true;
}

function indexCurve(start, minX, minY, invSize) {
  let p = start;
  do {
    if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, invSize);
    p.prevZ = p.prev;
    p.nextZ = p.next;
    p = p.next;
  } while (p !== start);
  p.prevZ.nextZ = null;
  p.prevZ = null;
  sortLinked(p);
}

function sortLinked(list) {
  let numMerges, pSize, qSize, e, p, q, tail;
  let inSize = 1;
  do {
    p = list;
    list = null;
    tail = null;
    numMerges = 0;
    while (p) {
      numMerges++;
      q = p;
      pSize = 0;
      for (let i = 0; i < inSize; i++) {
        pSize++;
        q = q.nextZ;
        if (!q) break;
      }
      qSize = inSize;
      while (pSize > 0 || (qSize > 0 && q)) {
        if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
          e = p;
          p = p.nextZ;
          pSize--;
        } else {
          e = q;
          q = q.nextZ;
          qSize--;
        }
        if (tail) tail.nextZ = e;
        else list = e;
        e.prevZ = tail;
        tail = e;
      }
      p = q;
    }
    tail.nextZ = null;
    inSize *= 2;
  } while (numMerges > 1);
  return list;
}

function zOrder(x, y, minX, minY, invSize) {
  x = 32767 * (x - minX) * invSize;
  y = 32767 * (y - minY) * invSize;
  x = (x | (x << 8)) & 0x00FF00FF;
  x = (x | (x << 4)) & 0x0F0F0F0F;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;
  y = (y | (y << 8)) & 0x00FF00FF;
  y = (y | (y << 4)) & 0x0F0F0F0F;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;
  return x | (y << 1);
}

function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
  return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
         (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
         (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

function cureLocalIntersections(start, triangles, dim) {
  let p = start;
  do {
    const a = p.prev, b = p.next.next;
    if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
      triangles.push(a.i / dim, p.i / dim, b.i / dim);
      removeNode(p);
      removeNode(p.next);
      p = start = b;
    }
    p = p.next;
  } while (p !== start);
  return filterPoints(p);
}

function intersects(p1, q1, p2, q2) {
  const o1 = sign(area(p1, q1, p2));
  const o2 = sign(area(p1, q1, q2));
  const o3 = sign(area(p2, q2, p1));
  const o4 = sign(area(p2, q2, q1));
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}

function sign(num) {
  return num > 0 ? 1 : num < 0 ? -1 : 0;
}

function onSegment(p, q, r) {
  return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
         q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

function locallyInside(a, b) {
  return area(a.prev, a, a.next) < 0 ?
    area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
    area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

function splitEarcut(start, triangles, dim, minX, minY, invSize) {
  let a = start;
  do {
    let b = a.next.next;
    while (b !== a.prev) {
      if (a.i !== b.i && isValidDiagonal(a, b)) {
        let c = splitPolygon(a, b);
        a = filterPoints(a, a.next);
        c = filterPoints(c, c.next);
        earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
        earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
        return;
      }
      b = b.next;
    }
    a = a.next;
  } while (a !== start);
}

function isValidDiagonal(a, b) {
  return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
         (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) &&
          (area(a.prev, a, b.prev) || area(a, b.prev, b)) || equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0);
}

function intersectsPolygon(a, b) {
  let p = a;
  do {
    if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) return true;
    p = p.next;
  } while (p !== a);
  return false;
}

function middleInside(a, b) {
  let p = a, inside = false;
  const px = (a.x + b.x) / 2, py = (a.y + b.y) / 2;
  do {
    if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y && (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x)) inside = !inside;
    p = p.next;
  } while (p !== a);
  return inside;
}

// Create geometry from GeoJSON coordinates
function createDistrictGeometry(coordinates, properties) {
  const shapes = [];
  
  // Handle MultiPolygon and Polygon
  const polygons = coordinates[0] && typeof coordinates[0][0] === 'number' 
    ? [coordinates] // Polygon
    : coordinates;  // MultiPolygon
  
  polygons.forEach(polygon => {
    if (!polygon || !polygon[0]) return;
    
    const outerRing = polygon[0];
    const holes = polygon.slice(1);
    
    // Flatten coordinates for earcut
    const flatCoords = [];
    const holeIndices = [];
    
    // Add outer ring
    outerRing.forEach(coord => {
      const { x, y } = geoToLocal(coord[0], coord[1]);
      flatCoords.push(x, y);
    });
    
    // Add holes
    holes.forEach(hole => {
      holeIndices.push(flatCoords.length / 2);
      hole.forEach(coord => {
        const { x, y } = geoToLocal(coord[0], coord[1]);
        flatCoords.push(x, y);
      });
    });
    
    // Triangulate
    const triangleIndices = earcut(flatCoords, holeIndices.length ? holeIndices : null, 2);
    
    if (triangleIndices.length < 3) return;
    
    // Create geometry
    const vertices = [];
    const indices = [];
    
    for (let i = 0; i < flatCoords.length; i += 2) {
      vertices.push(flatCoords[i], 0, -flatCoords[i + 1]);
    }
    
    for (let i = 0; i < triangleIndices.length; i++) {
      indices.push(triangleIndices[i]);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    shapes.push(geometry);
  });
  
  // Merge geometries if multiple
  if (shapes.length === 0) return null;
  if (shapes.length === 1) return shapes[0];
  
  // Simple merge
  return shapes[0];
}

// Create extruded district with edges
function createExtrudedDistrict(coordinates, properties, height = 1) {
  const polygons = coordinates[0] && typeof coordinates[0][0] === 'number' 
    ? [coordinates] 
    : coordinates;
  
  const group = new THREE.Group();
  const color = getDistrictColor(properties.name || properties.Name || properties.ENAME);
  
  polygons.forEach(polygon => {
    if (!polygon || !polygon[0] || polygon[0].length < 3) return;
    
    try {
      const shape = new THREE.Shape();
      const outerRing = polygon[0];
      
      // Create shape from coordinates
      outerRing.forEach((coord, idx) => {
        const { x, y } = geoToLocal(coord[0], coord[1]);
        if (idx === 0) {
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      });
      
      // Add holes
      polygon.slice(1).forEach(hole => {
        if (hole.length < 3) return;
        const holePath = new THREE.Path();
        hole.forEach((coord, idx) => {
          const { x, y } = geoToLocal(coord[0], coord[1]);
          if (idx === 0) {
            holePath.moveTo(x, y);
          } else {
            holePath.lineTo(x, y);
          }
        });
        shape.holes.push(holePath);
      });
      
      const extrudeSettings = {
        steps: 1,
        depth: height,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 2
      };
      
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.rotateX(-Math.PI / 2);
      
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.35,
        roughness: 0.55,
        flatShading: false
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Add subtle edge lines
      const edges = new THREE.EdgesGeometry(geometry, 20);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        opacity: 0.15, 
        transparent: true 
      });
      const line = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(line);
      
      group.add(mesh);
    } catch (e) {
      console.warn('Failed to create district:', properties.name, e);
    }
  });
  
  group.userData = { 
    name: properties.name || properties.Name || properties.ENAME,
    name_zh: properties.name_zh || properties.CNAME || ''
  };
  
  return group;
}

// Load Hong Kong map from local accurate outline data
async function loadHongKongMap() {
  console.log('Loading Hong Kong map...');
  
  // Use local accurate outline data
  const geojson = hongKongOutline;
  
  // Height variations for different regions
  const heightMap = {
    "New Territories & Kowloon": 1.2,
    "Hong Kong Island": 1.0,
    "Lantau Island": 0.9,
    "Lamma Island": 0.5,
    "Cheung Chau": 0.4,
    "Peng Chau": 0.35
  };
  
  // Process features
  geojson.features.forEach((feature, index) => {
    const coords = feature.geometry.type === 'MultiPolygon' 
      ? feature.geometry.coordinates 
      : [feature.geometry.coordinates];
    
    const height = heightMap[feature.properties.name] || 0.6;
    
    const district = createExtrudedDistrict(
      coords,
      feature.properties,
      height
    );
    
    if (district.children.length > 0) {
      districtMeshes.push(district);
      districtGroup.add(district);
    }
  });
  
  // Center the map
  const box = new THREE.Box3().setFromObject(districtGroup);
  const center = box.getCenter(new THREE.Vector3());
  districtGroup.position.sub(center);
  districtGroup.position.y = 0;
  
  console.log('Created', districtMeshes.length, 'regions');
}

// Fallback map if fetch fails
function createFallbackMap() {
  const districts = [
    { name: "Hong Kong Island", coords: [[114.14,22.25],[114.28,22.26],[114.28,22.22],[114.14,22.22]] },
    { name: "Kowloon", coords: [[114.14,22.30],[114.22,22.33],[114.22,22.30],[114.14,22.29]] },
    { name: "New Territories", coords: [[113.90,22.38],[114.35,22.46],[114.35,22.35],[113.90,22.35]] },
    { name: "Lantau", coords: [[113.88,22.20],[114.10,22.28],[114.10,22.20],[113.88,22.18]] }
  ];
  
  districts.forEach(d => {
    const shape = new THREE.Shape();
    d.coords.forEach((c, i) => {
      const { x, y } = geoToLocal(c[0], c[1]);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05 });
    geometry.rotateX(-Math.PI / 2);
    
    const material = new THREE.MeshStandardMaterial({ color: getDistrictColor(d.name), metalness: 0.3, roughness: 0.6 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { name: d.name };
    districtGroup.add(mesh);
    districtMeshes.push(mesh);
  });
}

// Temperature markers
const temperatureMarkers = [];
const markerGroup = new THREE.Group();

function createTemperatureMarker(location) {
  const group = new THREE.Group();
  const { x, y } = geoToLocal(location.coordinates[0], location.coordinates[1]);
  
  const tempColor = getTemperatureColor(location.temperature);
  const color = new THREE.Color(tempColor.r, tempColor.g, tempColor.b);
  const hexColor = '#' + color.getHexString();
  
  // Pin stem
  const pinGeometry = new THREE.CylinderGeometry(0.12, 0.2, 2.5, 12);
  const pinMaterial = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.5,
    roughness: 0.3,
    emissive: color,
    emissiveIntensity: 0.2
  });
  const pin = new THREE.Mesh(pinGeometry, pinMaterial);
  pin.position.y = 1.25;
  pin.castShadow = true;
  group.add(pin);
  
  // Temperature sphere
  const sphereGeometry = new THREE.SphereGeometry(0.5, 24, 24);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.4,
    roughness: 0.2,
    emissive: color,
    emissiveIntensity: 0.4
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.y = 3;
  sphere.castShadow = true;
  group.add(sphere);
  
  // Glow
  const glowGeometry = new THREE.SphereGeometry(0.75, 24, 24);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.15
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.y = 3;
  group.add(glow);
  
  // Base ring
  const ringGeometry = new THREE.RingGeometry(0.25, 0.6, 24);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.65;
  group.add(ring);
  
  // Create label element
  const labelDiv = document.createElement('div');
  labelDiv.className = 'marker-label';
  labelDiv.innerHTML = `
    <div class="label-name">${location.name_zh}</div>
    <div class="label-temp" style="color: ${hexColor}">${location.temperature}°C</div>
  `;
  
  const label = new CSS2DObject(labelDiv);
  label.position.set(0, 4.5, 0);
  group.add(label);
  
  group.position.set(x, 0.6, -y);
  group.userData = { location, ring, glow, sphere, label };
  
  return group;
}

// Create temperature markers after map loads
function createTemperatureMarkers() {
  temperatureLocations.forEach(location => {
    const marker = createTemperatureMarker(location);
    temperatureMarkers.push(marker);
    markerGroup.add(marker);
  });
  scene.add(markerGroup);
}

// Ocean plane
const waterGeometry = new THREE.PlaneGeometry(150, 150);
const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x0c1929,
  metalness: 0.9,
  roughness: 0.1,
  transparent: true,
  opacity: 0.95
});
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.15;
water.receiveShadow = true;
scene.add(water);

// Grid
const gridHelper = new THREE.GridHelper(80, 40, 0x1e3a5f, 0x0f172a);
gridHelper.position.y = -0.1;
scene.add(gridHelper);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');
let hoveredMarker = null;

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  const markerObjects = temperatureMarkers.flatMap(m => m.children);
  const intersects = raycaster.intersectObjects(markerObjects, true);
  
  if (intersects.length > 0) {
    let current = intersects[0].object;
    while (current.parent && !current.userData.location) {
      current = current.parent;
    }
    
    if (current.userData.location && hoveredMarker !== current) {
      hoveredMarker = current;
      const location = current.userData.location;
      
      tooltip.innerHTML = `
        <div class="location-name">${location.name_zh} ${location.name}</div>
        <div class="temperature">${location.temperature}°C</div>
        <div class="humidity">Humidity: ${location.humidity}%</div>
      `;
      tooltip.classList.add('visible');
    }
    
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.top = `${event.clientY + 15}px`;
    document.body.style.cursor = 'pointer';
  } else {
    if (hoveredMarker) {
      hoveredMarker = null;
      tooltip.classList.remove('visible');
      document.body.style.cursor = 'default';
    }
  }
}

window.addEventListener('mousemove', onMouseMove);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation
let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.016;
  
  controls.update();
  
  // Animate markers
  temperatureMarkers.forEach((marker, index) => {
    const { ring, glow, sphere } = marker.userData;
    if (!ring) return;
    
    const phase = time * 2 + index * 0.5;
    const scale = 1 + Math.sin(phase) * 0.2;
    ring.scale.set(scale, scale, 1);
    ring.material.opacity = 0.35 + Math.sin(phase) * 0.15;
    glow.scale.setScalar(1 + Math.sin(phase * 0.8) * 0.12);
    glow.material.opacity = 0.12 + Math.sin(phase * 0.8) * 0.08;
    sphere.position.y = 3 + Math.sin(phase * 0.5) * 0.08;
  });
  
  water.material.opacity = 0.9 + Math.sin(time * 0.5) * 0.05;
  
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// Initialize
async function init() {
  await loadHongKongMap();
  createTemperatureMarkers();
  
  // Adjust marker positions to match map center
  const box = new THREE.Box3().setFromObject(districtGroup);
  const center = box.getCenter(new THREE.Vector3());
  markerGroup.position.x = districtGroup.position.x;
  markerGroup.position.z = districtGroup.position.z;
  
  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
    animate();
  }, 500);
}

init();
