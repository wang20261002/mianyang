(() => {
  // 全篇索引使用当前实际页面顺序，后续增删页无需维护页码。
  const pages=[...document.querySelectorAll('#deck>.slide')],nav=document.querySelector('.nav-actions');
  const trigger=document.createElement('button');trigger.className='deck-index-button';trigger.textContent='全篇索引';trigger.setAttribute('aria-expanded','false');nav.prepend(trigger);
  const panel=document.createElement('aside');panel.className='deck-index';panel.hidden=true;panel.innerHTML='<div class="deck-index-head"><strong>全篇索引</strong><button type="button">关闭</button></div><div class="deck-index-list"></div>';document.body.appendChild(panel);
  function close(){panel.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus()}
  trigger.onclick=()=>{panel.hidden=!panel.hidden;trigger.setAttribute('aria-expanded',String(!panel.hidden));panel.querySelectorAll('.deck-index-list button').forEach((b,i)=>{b.classList.toggle('current',pages[i].classList.contains('active'));b.setAttribute('aria-current',pages[i].classList.contains('active')?'page':'false')})};
  panel.querySelector('.deck-index-head button').onclick=close;
  pages.forEach((p,i)=>{const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0')+'  '+p.dataset.title;b.onclick=()=>{show(i);close()};panel.querySelector('.deck-index-list').appendChild(b)});
  document.addEventListener('keydown',e=>{if(!panel.hidden){if(e.key==='Escape')close();e.stopPropagation()}},true);
  const concept=document.querySelector('[data-title="方案二概念分析"]');concept.querySelector('.small-note').textContent='原设计推演图完整展示。图中12MW、发电量、减碳量和35%绿化率为原图概念标注，本次测算以DXF量取及最新面积表为准。';
  const master=document.querySelector('[data-title="方案二总平面"] .effect-full');
  master.innerHTML='<div class="ppt-plan-figure"><img src="assets/scheme2-masterplan-ppt.png" alt="新PPT总平面完整图，含红线、1至14功能编号与说明及入口箭头"><svg viewBox="0 0 2048 1152" role="img" aria-label="指北针"><g transform="translate(1800 555) rotate(-3.89)"><rect x="-44" y="-95" width="88" height="142" rx="4" fill="#0b2034cc"/><text x="0" y="-66" text-anchor="middle" fill="white" font-size="30" font-family="Arial">N</text><path d="M0 -48 L-17 20 L0 6 L17 20 Z" fill="white" stroke="#102c40" stroke-width="2"/></g></svg></div>';
  const pv=window.ZERO_CARBON_INPUT.pv,f=(n,d=2)=>n.toLocaleString('zh-CN',{minimumFractionDigits:d,maximumFractionDigits:d});
  const modelInfo=document.getElementById('scheme2ModelInfo'),modelWrapper=document.createElement('div');modelWrapper.className='model-query-wrap';modelInfo.before(modelWrapper);
  const buildingSelector=document.createElement('select');buildingSelector.setAttribute('aria-label','按建筑编号查询');buildingSelector.innerHTML='<option value="">按建筑编号查询</option>'+Object.entries(window.SCHEME2_DATA.info).map(([id,d])=>'<option value="'+id+'">'+id+' '+d[0]+'</option>').join('');modelWrapper.append(buildingSelector,modelInfo);buildingSelector.addEventListener('change',()=>window.SCHEME2_MOUNT?.select(buildingSelector.value));
})();
