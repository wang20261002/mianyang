(function(){
const info={A1:['安保办公及宿舍','3层','1,916.82㎡','1,916.82㎡'],A2:['北侧配套办公','3层','1,916.82㎡','1,916.82㎡'],W1:['南侧保税仓库','2层','23,088.63㎡','46,177.27㎡'],W2:['北侧保税仓库','2层','7,787.54㎡','15,575.09㎡'],W3:['南侧合并仓库','2层','54,474.87㎡','54,474.87㎡'],W4:['东侧仓库','2层','38,496.92㎡','38,496.92㎡'],W5:['汽配汽检汽修','2层','37,874.78㎡','37,874.78㎡'],W6:['西侧新增仓库','2层','10,895.34㎡','10,895.34㎡'],W7:['冻库','1层','11,148.27㎡','22,296.54㎡'],W8:['金库','2层','1,368.76㎡','1,368.76㎡'],W9:['档案库','3层','5,281.59㎡','5,281.59㎡'],A3:['南侧配套办公①','5层','6,549.12㎡','6,549.12㎡'],A4:['南侧配套办公②','5层','6,549.12㎡','6,549.12㎡'],A5:['酒店运营功能','5层','6,549.12㎡','6,549.12㎡']};
const colors={warehouse:0x2b9dc1,office:0xed7aa8,secure:0xf3c541,hotel:0xed9f26,auto:0xe74c3c,gray:0x9aa4ad};
function loadModelData(){
  const data=window.SU_COMPLETE_DATA;
  if(!Array.isArray(data?.parts)||!data.parts.length||!Array.isArray(data.images))return Promise.reject(Error('离线SU模型数据文件缺失或不完整'));
  return Promise.resolve(data);
}
info.W6[0]='汽配汽检汽修';
function category(id){if(/^W[1-47]$/.test(id))return'warehouse';if(/^A[1-4]$/.test(id))return'office';if(/^(W8|W9)$/.test(id))return'secure';if(id==='A5')return'hotel';if(id==='W5'||id==='W6')return'auto';return'gray'}
function parseGlb(ab){const dv=new DataView(ab);if(dv.getUint32(0,true)!==0x46546c67)throw Error('invalid GLB');let o=12,j=null,bin=null;while(o<dv.byteLength){const n=dv.getUint32(o,true),t=dv.getUint32(o+4,true),b=ab.slice(o+8,o+8+n);if(t===0x4e4f534a)j=JSON.parse(new TextDecoder().decode(b).replace(/\0+$/,''));if(t===0x004e4942)bin=b;o+=8+n}function read(ai){const a=j.accessors[ai],v=j.bufferViews[a.bufferView],n=a.type==='VEC3'?3:1,C=a.componentType===5126?Float32Array:Uint32Array,x=new C(bin,(v.byteOffset||0)+(a.byteOffset||0),a.count*n),out=[];for(let i=0;i<x.length;i+=n)out.push(n===3?[x[i],x[i+1],x[i+2]]:x[i]);return out}return j.nodes.filter(n=>n.mesh!==undefined).map(n=>{const p=j.meshes[n.mesh].primitives[0];return{id:n.extras?.id||n.name,positions:read(p.attributes.POSITION)}})}
function create(mountId,statusId,infoId){
  const mount=document.getElementById(mountId);if(!mount)return null;
  mount.querySelector('.traffic-overlay')?.remove();mount.querySelector('.traffic-legend')?.remove();mount.querySelector('#modelPopup')?.remove();
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,20000),renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);mount.appendChild(renderer.domElement);camera.up.set(0,1,0);
  scene.add(new THREE.HemisphereLight(0xdaf6f7,0x14283b,1.5));const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-180,320,-80);scene.add(sun);
  const root=new THREE.Group();scene.add(root);const target=new THREE.Vector3(0,0,0);let yaw=.38,pitch=.62,distance=300,drag=false,dragMode='orbit',lastX=0,lastY=0,downX=0,downY=0,mode='normal';const meshes=[];
  function resize(){const r=mount.getBoundingClientRect();if(r.width<2||r.height<2)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(mount);window.addEventListener('resize',resize);
  function cam(){const cp=Math.cos(pitch);camera.position.set(target.x+Math.cos(yaw)*cp*distance,target.y+Math.sin(pitch)*distance,target.z+Math.sin(yaw)*cp*distance);camera.lookAt(target)}
  function reset(){yaw=.38;pitch=.62;distance=300;target.set(0,0,0);cam()}
  function apply(){meshes.forEach(m=>{m.material.color.copy(m.userData.baseColor);m.material.opacity=m.userData.dim?.22:1;m.material.transparent=!!m.userData.dim})}
  function addSatellitePlane(images,center,scale){images.forEach(image=>{const texture=new THREE.TextureLoader().load(image.dataUrl);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());const positions=image.corners.flatMap(p=>[(p[0]-center.x)*scale,(p[2]-center.z)*scale,(p[1]-center.y)*scale]);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));geometry.setIndex([0,2,1,0,3,2]);const plane=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2}));root.add(plane)})}
  function build(data){const parts=data.parts,all=[];parts.filter(p=>info[p.id]).forEach(p=>p.positions.forEach(v=>all.push(v)));const bb=new THREE.Box3().setFromBufferAttribute(new THREE.Float32BufferAttribute(all.flat(),3)),center=bb.getCenter(new THREE.Vector3()),rawSize=bb.getSize(new THREE.Vector3()),scale=210/Math.max(rawSize.x,rawSize.y);let minZ=Infinity;
    parts.forEach(p=>{const arr=new Float32Array(p.positions.flat());for(let i=0;i<arr.length;i+=3){const north=arr[i+1],height=arr[i+2];arr[i]=(arr[i]-center.x)*scale;arr[i+1]=(height-center.z)*scale;arr[i+2]=(north-center.y)*scale}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));const idx=[];for(let i=0;i<arr.length/3;i+=3)idx.push(i,i+2,i+1);g.setIndex(idx);g.computeVertexNormals();let baseColor=p.color?new THREE.Color().setRGB(...p.color.slice(0,3)):new THREE.Color(colors[category(p.id)]||colors.gray);if(p.id==='W5'||p.id==='W6')baseColor=new THREE.Color(colors.auto);const m=new THREE.MeshStandardMaterial({color:baseColor,roughness:.85,metalness:0,side:THREE.DoubleSide});const mesh=new THREE.Mesh(g,m);mesh.userData={id:p.id,baseColor,queryable:!!info[p.id]&&!/连接桥|护栏|支柱|连廊/.test(p.name||'')};root.add(mesh);meshes.push(mesh)});
    (data.lines||[]).forEach(p=>{const positions=p.positions.flatMap(v=>[(v[0]-center.x)*scale,(v[2]-center.z)*scale+.015,(v[1]-center.y)*scale]);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const color=new THREE.Color().setRGB(...(p.color||[.52,.6,.63]).slice(0,3));const material=new THREE.LineBasicMaterial({color,transparent:true,opacity:.76,depthWrite:false});root.add(new THREE.LineSegments(geometry,material))});
    addSatellitePlane(data.images,center,scale);reset();apply();resize();setTimeout(resize,250);const st=document.getElementById(statusId);if(st)st.textContent='左键旋转 · 滚轮缩放 · 右键/Shift平移'
  }
  function pick(e){const r=renderer.domElement.getBoundingClientRect(),p=new THREE.Vector2(1-(e.clientX-r.left)/r.width*2,-(e.clientY-r.top)/r.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(p,camera);const hit=ray.intersectObjects(meshes.filter(m=>m.userData.queryable),false)[0];if(!hit)return;const id=hit.object.userData.id,d=info[id];if(!d)return;const el=infoId&&document.getElementById(infoId);if(el)el.innerHTML='<strong>'+id+'｜'+d[0]+'</strong><span>层数：'+d[1]+'<br>建筑面积：'+d[2]+'<br>计容面积：'+d[3]+'<br>数据来源：1007体量F1.skp。</span>'}
  mount.addEventListener('contextmenu',e=>e.preventDefault());
  mount.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag=true;dragMode=(e.button===0&&!e.shiftKey)?'orbit':'pan';downX=lastX=e.clientX;downY=lastY=e.clientY;mount.setPointerCapture?.(e.pointerId)});
  mount.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(dragMode==='orbit'){yaw-=dx*.008;pitch=Math.max(-1.15,Math.min(1.15,pitch+dy*.006))}else{const dir=camera.getWorldDirection(new THREE.Vector3()),right=dir.clone().cross(camera.up).normalize(),up=right.clone().cross(dir).normalize(),s=distance*.0018;target.addScaledVector(right,dx*s).addScaledVector(up,dy*s)}lastX=e.clientX;lastY=e.clientY;cam()});
  mount.addEventListener('pointerup',e=>{drag=false;if(Math.hypot(e.clientX-downX,e.clientY-downY)<5&&e.button===0)pick(e)});
  mount.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(70,Math.min(650,distance*(e.deltaY>0?1.08:.92)));cam()},{passive:false});
  mount.querySelectorAll('.model-toggles button[data-mode]').forEach(b=>b.addEventListener('click',()=>{mount.querySelectorAll('.model-toggles button').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.mode;apply()}));mount.querySelector('#modelReset')?.addEventListener('click',reset);
  function highlight(zone){const sets={privacy:['W8','W9','A1','A2'],bonded:['W1','W2'],city:['A3','A4','A5','W5'],logistics:['W3','W4','W6','W7']},ids=sets[zone]||[];meshes.forEach(m=>m.userData.dim=ids.length&&!ids.includes(m.userData.id));apply()}
  function animate(){requestAnimationFrame(animate);renderer.render(scene,camera)}animate();reset();
  function load(){
    mount.querySelector('.model-retry')?.remove();
    const st=document.getElementById(statusId);if(st)st.textContent='正在加载SU体量…';
    loadModelData().then(build).catch(error=>{
      if(st)st.textContent='SU模型加载失败，请点击重试';
      console.error('SU模型加载失败',error);
      const retry=document.createElement('button');retry.className='model-retry';retry.textContent='重新加载SU模型';
      retry.style.cssText='position:absolute;z-index:10;left:50%;top:50%;transform:translate(-50%,-50%);padding:12px 20px;border:1px solid #7eeaf1;border-radius:4px;background:#12344c;color:#fff;cursor:pointer';
      retry.addEventListener('click',()=>{root.traverse(object=>{object.geometry?.dispose();if(object.material){object.material.map?.dispose();object.material.dispose()}});root.clear();meshes.length=0;load()});mount.appendChild(retry);
    });
  }
  load();
  return{highlight,reset}
}
window.SU_MOUNTS={layout:create('layout3dCanvas','layoutStatus',null),main:create('modelCanvas','modelStatus','modelInfo')};
})();
