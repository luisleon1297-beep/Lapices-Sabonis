import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
export function createPenPreview(container) {
const state={texto:'Tu nombre',fuente:'cursive',color:'#252a29',colorTexto:'#eadba5',diseno:'ninguno',cantidad:1};
const fontFamilies={Arial:'Arial, sans-serif',Georgia:'Georgia, serif',cursive:'\"Segoe Script\", \"Sabonis Manuscrita\", cursive',monospace:'\"Courier New\", monospace'};
let sending=false, capturing=false, backgroundLoaded=false;
const cart=[];
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
const chrome=new THREE.MeshPhysicalMaterial({color:0xdfe3e2,metalness:1,roughness:.11,envMapIntensity:1.4});
const material=new THREE.MeshPhysicalMaterial({color:state.color,roughness:.3,metalness:.18,clearcoat:1,clearcoatRoughness:.18});
const group=new THREE.Group();group.rotation.z=-Math.PI/2;group.position.y=.52;scene.add(group);
function cylinder(top,bottom,height,y,mat=chrome){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,80),mat);mesh.position.y=y;group.add(mesh);return mesh;}
// Bolígrafo ejecutivo: punta de acero, agarre negro, doble anillo, cuerpo y clip.
cylinder(.295,.275,2.1,-2.0,material);
cylinder(.285,.035,.94,-3.52);
cylinder(.045,.012,.16,-4.03,chrome);
cylinder(.303,.303,.18,-.91);
cylinder(.307,.307,.06,-.73);
cylinder(.292,.303,3.78,1.19,material);
cylinder(.303,.303,.10,3.13);
cylinder(.218,.218,.68,3.52);
cylinder(.231,.231,.1,3.88);
const clip=new THREE.Mesh(new THREE.CapsuleGeometry(.055,2.0,8,24),chrome);clip.position.set(-.405,2.14,.13);group.add(clip);
const bridge=new THREE.Mesh(new THREE.BoxGeometry(.19,.10,.12),chrome);bridge.position.set(-.32,3.17,.13);group.add(bridge);
const clipEnd=new THREE.Mesh(new THREE.SphereGeometry(.058,24,16),chrome);clipEnd.scale.set(.9,1.25,1);clipEnd.position.set(-.405,1.08,.13);group.add(clipEnd);
// Grabado sobre la cara frontal del cuerpo derecho.
const textCanvas=document.createElement('canvas');textCanvas.width=256;textCanvas.height=2048;
const ctx=textCanvas.getContext('2d');const texture=new THREE.CanvasTexture(textCanvas);texture.colorSpace=THREE.SRGBColorSpace;
const label=new THREE.Mesh(new THREE.CylinderGeometry(.309,.309,2.9,128,1,true,-.72,1.44),new THREE.MeshBasicMaterial({map:texture,toneMapped:false,transparent:true,side:THREE.DoubleSide,depthWrite:false}));label.position.y=1.18;group.add(label);
function draw(){
 ctx.clearRect(0,0,256,2048);ctx.save();ctx.translate(128,1024);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=state.colorTexto;
 let size=state.fuente==='cursive'?164:130;const text=state.texto.trim()||'Tu nombre';
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
function animate(){requestAnimationFrame(animate);if(!sending&&!capturing)controls.update();renderer.render(scene,camera);}animate();

return { update(design){state.texto=design.text||'Tu nombre';state.fuente=({script:'cursive',serif:'Georgia',sans:'Arial',mono:'monospace'})[design.font];state.color=design.body;state.colorTexto=design.ink;draw();},async capture(){capturing=true;controls.enabled=false;try{if(document.fonts)await document.fonts.ready;draw();renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');}finally{capturing=false;controls.enabled=true;}} };
}
