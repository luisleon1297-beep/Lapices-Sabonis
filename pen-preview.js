import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
export function createPenPreview(container) {
const state={texto:'Tu nombre',fuente:'cursive',color:'#252a29',colorTexto:'#eadba5',diseno:'ninguno',cantidad:1};
const fontFamilies={Arial:'Arial, sans-serif',Georgia:'Georgia, serif',cursive:'\"Segoe Script\", \"Sabonis Manuscrita\", cursive',monospace:'\"Courier New\", monospace'};
let capturing=false;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(26,1,.1,150);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
container.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x4f514c,2));
const keyLight=new THREE.DirectionalLight(0xffffff,3.2);keyLight.position.set(-2,5,7);scene.add(keyLight);
const fillLight=new THREE.DirectionalLight(0xffffff,1.2);fillLight.position.set(4,1,-4);scene.add(fillLight);
// Paneles de iluminación reflejados en el metal pulido del modelo.
const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;
const ec=envCanvas.getContext('2d');ec.fillStyle='#767975';ec.fillRect(0,0,1024,512);
ec.fillStyle='#f9faf7';ec.fillRect(40,20,240,380);ec.fillRect(550,40,150,350);
ec.fillStyle='#222523';ec.fillRect(370,0,70,512);ec.fillRect(870,0,100,512);
const environment=new THREE.CanvasTexture(envCanvas);environment.mapping=THREE.EquirectangularReflectionMapping;environment.colorSpace=THREE.SRGBColorSpace;scene.environment=environment;
// Modelo cerrado de la referencia: tapa corta, cuerpo largo y terminaciones doradas.
const gold=new THREE.MeshPhysicalMaterial({color:0xe5b84b,metalness:1,roughness:.17,envMapIntensity:1.25});
const material=new THREE.MeshPhysicalMaterial({color:state.color,roughness:.14,metalness:.08,clearcoat:1,clearcoatRoughness:.10});
const group=new THREE.Group();group.rotation.z=-Math.PI/2;scene.add(group);
function cylinder(top,bottom,height,y,mat=gold){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,96),mat);mesh.position.y=y;group.add(mesh);return mesh;}
function profile(points,mat){const geometry=new THREE.LatheGeometry(points.map(([radius,y])=>new THREE.Vector2(radius,y)),96);const mesh=new THREE.Mesh(geometry,mat);group.add(mesh);return mesh;}
// Tapa a la izquierda; el clip y el grabado comparten la cara frontal visible.
profile([[0,-4.02],[.13,-4.01],[.25,-3.93],[.31,-3.78],[.35,-3.65],[.365,-3.38],[.365,-.62],[.352,-.49],[0,-.49]],material);
profile([[0,-4.18],[.12,-4.17],[.23,-4.09],[.28,-3.99],[.30,-3.83],[.29,-3.72],[0,-3.72]],gold);
for(const y of [-4.03,-3.97,-3.91,-3.85]) cylinder(.301,.301,.018,y,gold);
cylinder(.365,.365,.19,-.48,gold);
// Barril largo suavemente afinado, sin punta de escritura expuesta.
profile([[0,-.38],[.344,-.38],[.35,-.26],[.345,.2],[.332,1.25],[.305,2.45],[.267,3.45],[.237,3.84],[.22,3.94],[0,3.94]],material);
profile([[0,3.81],[.23,3.81],[.231,3.95],[.18,4.10],[.09,4.17],[0,4.18]],gold);
for(const y of [3.92,3.98,4.04]) cylinder(.226-(y-3.92)*.35,.226-(y-3.92)*.35,.018,y,gold);
// Clip ancho con arco bajo y punta redondeada, como el de la fotografía.
const clipShape=new THREE.Shape();
clipShape.moveTo(-.34,-3.60);clipShape.bezierCurveTo(-.47,-3.43,-.50,-3.13,-.50,-2.65);
clipShape.bezierCurveTo(-.50,-2.1,-.49,-1.46,-.43,-1.06);
clipShape.quadraticCurveTo(-.385,-.90,-.36,-1.06);
clipShape.bezierCurveTo(-.43,-1.82,-.43,-2.76,-.39,-3.20);clipShape.quadraticCurveTo(-.36,-3.43,-.30,-3.52);clipShape.closePath();
const clip=new THREE.Mesh(new THREE.ExtrudeGeometry(clipShape,{depth:.10,bevelEnabled:true,bevelThickness:.025,bevelSize:.018,bevelSegments:4,curveSegments:32}),gold);clip.position.z=.08;group.add(clip);
// Grabado únicamente en la cara frontal de la tapa, debajo del clip.
const textCanvas=document.createElement('canvas');textCanvas.width=512;textCanvas.height=2048;
const ctx=textCanvas.getContext('2d');const texture=new THREE.CanvasTexture(textCanvas);texture.colorSpace=THREE.SRGBColorSpace;
const label=new THREE.Mesh(new THREE.CylinderGeometry(.371,.371,2.48,128,1,true,-.82,1.64),new THREE.MeshBasicMaterial({map:texture,toneMapped:false,transparent:true,side:THREE.DoubleSide,depthWrite:false}));label.position.y=-2.12;group.add(label);
function draw(){
 ctx.clearRect(0,0,512,2048);ctx.save();ctx.translate(256,1024);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=state.colorTexto;
 let size=state.fuente==='cursive'?320:265;const text=state.texto.trim()||'Tu nombre';
 do{ctx.font=`${state.fuente==='cursive'?'italic ':''}${size}px ${fontFamilies[state.fuente]}`;if(ctx.measureText(text).width<=1880)break;size-=4;}while(size>36);
 ctx.fillText(text,0,state.diseno==='ninguno'?0:-29);
 const decoration={estrellas:'✦   ✦',corazones:'♥   ♥',flores:'✿   ✿',puntos:'•   •'}[state.diseno];
 if(decoration){ctx.font='52px serif';ctx.fillText(decoration,0,85);}ctx.restore();texture.needsUpdate=true;material.color.set(state.color);
 
}
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=7;controls.maxDistance=80;controls.target.set(0,0,0);
renderer.setClearColor('#e9eee6',1);
function resize(){
 const box=container,w=Math.max(1,box.clientWidth),h=Math.max(1,box.clientHeight);camera.aspect=w/h;group.position.y=0;
 camera.position.set(0,0,Math.max(10.5,4.55/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect)));camera.updateProjectionMatrix();renderer.setSize(w,h);

}
new ResizeObserver(resize).observe(container);resize();
function animate(){requestAnimationFrame(animate);if(!capturing)controls.update();renderer.render(scene,camera);}animate();

return { update(design){state.texto=design.text||'Tu nombre';state.fuente=({script:'cursive',serif:'Georgia',sans:'Arial',mono:'monospace'})[design.font];state.color=design.body;state.colorTexto=design.ink;draw();},async capture(){capturing=true;controls.enabled=false;try{if(document.fonts)await document.fonts.ready;draw();renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}finally{capturing=false;controls.enabled=true;}} };
}
