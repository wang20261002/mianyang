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
  const district=document.getElementById('economic-panel-3');
  [...district.querySelectorAll('table:first-of-type tr')].find(r=>r.cells[0]?.textContent==='建筑占地面积')?.querySelectorAll('td').forEach((c,i)=>{if(i===1||i===2)c.textContent=''});
  const districtNote=document.createElement('p');districtNote.className='economic-note';districtNote.textContent='本分区表保留最新面积台账。方案二已将冻库调整至北区，并将金库、档案、安保调整至南区，分区建筑面积台账需同步复核；SU查询与光伏估算采用本轮确认的1012模型及DXF，不将旧分区面积用于屋顶量取。';district.prepend(districtNote);
  const pv=window.ZERO_CARBON_INPUT.pv,f=(n,d=2)=>n.toLocaleString('zh-CN',{minimumFractionDigits:d,maximumFractionDigits:d});
  const modelInfo=document.getElementById('scheme2ModelInfo'),modelWrapper=document.createElement('div');modelWrapper.className='model-query-wrap';modelInfo.before(modelWrapper);
  const buildingSelector=document.createElement('select');buildingSelector.setAttribute('aria-label','按建筑编号查询');buildingSelector.innerHTML='<option value="">按建筑编号查询</option>'+Object.entries(window.SCHEME2_DATA.info).map(([id,d])=>'<option value="'+id+'">'+id+' '+d[0]+'</option>').join('');modelWrapper.append(buildingSelector,modelInfo);buildingSelector.addEventListener('change',()=>window.SCHEME2_MOUNT?.select(buildingSelector.value));
  const inputRows=window.ZERO_CARBON_INPUT.rows;
  const strategy=document.querySelector('[data-title="B地块零碳策略"]');
  strategy.querySelector('.section-head p:not(.eyebrow)').textContent='按方案二B地块仓储、配套办公酒店及场内物流组织建设，北区冻库不计入B地块专项。';
  const articles=strategy.querySelectorAll('.carbon-evaluation article');
  articles[0].querySelector('p').textContent='按B地块红线建账，分项计量综合仓储、办公酒店、充换电及光储系统，拟设置20个重点计量回路。';
  articles[2].querySelector('h3').textContent='综合仓储与建筑节能';
  articles[2].querySelector('p').textContent='采用LED、分区控制和设备变频，优化装卸门区与围护热工。北区冻库独立建设核算，退出B地块零碳范围。';
  articles[3].querySelector('p').textContent='初步预留2MW/4MWh储能，结合充电及办公负荷削峰调节，位于总图9号设施区；容量须按逐时负荷复核。';
  const plan=document.querySelector('[data-title="零碳总图措施"]');
  plan.querySelector('.section-head p:not(.eyebrow)').textContent='采用方案二总图布局示意';
  const map=plan.querySelector('.carbon-plan-image');map.querySelector('img').src='assets/scheme2-masterplan-ppt.png';
  const pins=[['01',1105,618],['02',1410,440],['03',1960,112],['04',1870,165],['05',837,985],['06',809,902],['07',736,790]];
  const pinSvg=pins.map(([id,x,y])=>'<g class="carbon-pin carbon-pin-provisional" transform="translate('+x+' '+y+')"><circle r="24"/><text y="8">'+id+'</text></g>').join('');
  map.querySelector('svg').outerHTML='<svg class="carbon-map-overlay" viewBox="0 0 2048 1152" role="img" aria-label="方案二B地块光伏、储能、充换电与能碳机房意向点位"><defs><mask id="b-scope"><rect width="2048" height="1152" fill="white"/><path d="M583 644 L809 545 L834 594 L2048 38 L2048 75 L834 1013 Z" fill="black"/></mask></defs><rect width="2048" height="1152" fill="#102936" opacity=".42" mask="url(#b-scope)"/>'+pinSvg+'</svg>';
  plan.querySelector('.carbon-map-key').innerHTML='<span>橙色点位为专项选址意向，编号对应右侧措施；底图红线及功能编号沿用新总图。</span><span>北区冻库排除。点位须按消防间距、变配电及运营交通深化。</span>';
  const notes=plan.querySelectorAll('.carbon-map-notes li');
  const content=[
    ['01｜仓储屋顶光伏约'+f(pv.kw/1000)+'MWp','四处仓储基底合计'+f(pv.base)+'㎡×0.8＝铺板'+f(pv.panel_area)+'㎡；按0.22kWp/㎡，年发电约'+f(pv.kwh/10000)+'万kWh（900h假设）。'],
    ['02｜综合仓储节能','LED、分区照明、装卸门区及设备变频。冻库位于北区，本专项不设置冻库节能点位。'],
    ['03｜储能2MW/4MWh意向','点位选在9号设施区，拟预留约500㎡，靠近8号充换电区，消防及防洪条件待校核。'],
    ['04｜充电装机1.68MW＋换电预留','建议8台120kW双枪快充＋2台360kW双枪大功率充电，共20枪；另预留1座换电站约400㎡，换电功率及电池规格随车型定。'],
    ['05｜绿色物流组织','B地块装卸预约、电动叉车与短倒，优化内部道路和充电通行，铁路货场建设排除在专项外。'],
    ['06｜办公酒店节能与计量','沿用台账27,332.91㎡，按60kWh/㎡·年基线约164.00万kWh；节电15%约24.60万kWh/年，初估负荷2.19MW（80W/㎡），均为方案假设。'],
    ['07｜B地块能碳管理机房','拟在4号办公首层预留约60㎡，接入约20个重点回路和光伏、储能、充电数据。机房最终位置随运营方案确定。']
  ];
  content.forEach(([title,text],i)=>{notes[i].querySelector('b').textContent=title;notes[i].querySelector('span').textContent=text});
  const roofDetails=pv.handles.map(h=>{const r=inputRows.find(x=>x.handle===h);return '<tr><td>'+r.id+' '+r.name+'</td><td>'+h+'</td><td>'+f(r.base)+'</td><td>'+f(r.base*.8)+'</td></tr>'}).join('');
  const costs=[
    ['屋顶光伏',f(pv.kw/1000)+'MWp × 3.50元/Wp',pv.kw*3500/10000,pv.kw*50/10000,'清洗、巡检、监控及小修，50元/kWp·年假设'],
    ['储能系统','2MW/4MWh × 1,200元/kWh',480,16,'巡检维护40元/kWh·年假设，不含充电购电及电池更换'],
    ['充电设备','8台120kW×12万＋2台360kW×35万',166,8.30,'设备投资5%/年维护假设'],
    ['换电站预留','1座站体、接口及预留基础',300,15,'按5%维护占位估算；不含换电电池资产'],
    ['充换电配电及场地','约2,500kVA预留＋土建线缆',150,3,'2%/年维护假设'],
    ['办公酒店节能增量','27,332.91㎡×80元/㎡',218.66328,6.56,'高效照明/控制等增量，约3%/年维护'],
    ['计量与能碳平台','20回路×1.5万＋平台机房90万',120,18,'校验、数据平台服务及运维人员分摊假设']
  ];
  const direct=costs.reduce((s,r)=>s+r[2],0),reserve=direct*.1,total=direct+reserve,annual=costs.reduce((s,r)=>s+r[3],0);
  window.CARBON_ESTIMATE={costs,direct,reserve,total,annual,pv};
  const cost=document.querySelector('[data-title="工程造价估算"]');
  cost.querySelector('.section-head p:not(.eyebrow)').textContent='B地块用地173,035.38㎡。建筑工程按既有面积台账180,223.09㎡作参照，方案二重组待复核；零碳专项按总图量取规模估算。';
  const tabbar=document.createElement('div');tabbar.className='estimate-tabs';tabbar.setAttribute('role','tablist');tabbar.innerHTML='<button role="tab" aria-selected="true">工程投资</button><button role="tab" aria-selected="false">零碳投资明细</button><button role="tab" aria-selected="false">年度运维</button><button role="tab" aria-selected="false">光伏量取依据</button>';
  cost.querySelector('.section-head').after(tabbar);
  const engineering=document.createElement('div');engineering.className='estimate-panel';
  [...cost.children].filter(x=>x!==cost.querySelector('.section-head')&&x!==tabbar).forEach(x=>engineering.appendChild(x));cost.appendChild(engineering);
  const makePanel=html=>{const p=document.createElement('div');p.className='estimate-panel';p.hidden=true;p.innerHTML=html;cost.appendChild(p);return p};
  const investment=makePanel('<table class="estimate-table"><thead><tr><th>专项</th><th>规模与单价假设</th><th>万元</th></tr></thead><tbody>'+costs.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+f(r[2])+'</td></tr>').join('')+'<tr><td>方案阶段专项预备费</td><td>上述小计×10%</td><td>'+f(reserve)+'</td></tr><tr class="total"><td>零碳专项合计</td><td>已接入工程投资总额</td><td>'+f(total)+'</td></tr></tbody></table><p class="estimate-caption">光伏按本项目规模假设3.50元/Wp，参照天津远程2024年披露项目2,640万元/6.754MW，约3.91元/W。其余设备和维护单价为方案估算假设，非询价。10%专项预备费只对上述专项计算。光伏单价含常规接入配电，150万元仅计充换电增容，避免重复。</p><p class="estimate-caption"><a href="https://www.teda.gov.cn/contents/14/30355.html" target="_blank" rel="noopener">天津经开区官方案例（2024-01-29）</a>；不含屋面加固、大范围外网改造、换电电池购置、融资及税务测算。</p>');
  const operation=makePanel('<table class="estimate-table"><thead><tr><th>运维项</th><th>万元/年</th><th>初步费用范围</th></tr></thead><tbody>'+costs.map(r=>'<tr><td>'+r[0]+'</td><td>'+f(r[3])+'</td><td>'+r[4]+'</td></tr>').join('')+'<tr class="total"><td>零碳专项年度运维合计</td><td>'+f(annual)+'</td><td>方案阶段常年支出估算</td></tr></tbody></table><p class="estimate-caption">本表为新增零碳设施运维，不是全园物业、物流人工或能耗总支出。未含购电、电池更换、大修和设备折旧，平台人员分摊已计入18万元/年。光伏与储能常规维护分别按50元/kWp·年、40元/kWh·年假设，后续以运维报价校核。</p>');
  const evidence=makePanel('<table class="estimate-table"><thead><tr><th>功能/建筑</th><th>轮廓编号</th><th>基底㎡</th><th>×0.8铺板㎡</th></tr></thead><tbody>'+roofDetails+'<tr class="total"><td>南区四处综合仓储合计</td><td>J-建筑图层</td><td>'+f(pv.base)+'</td><td>'+f(pv.panel_area)+'</td></tr></tbody></table><p class="estimate-caption">总图量取单位为米，曲线离散容差0.001m。仓储基底按四条边界量取，未闭合轮廓以首尾连线闭合。铺板面积＝基底×0.8，装机＝铺板×0.22kWp/㎡＝'+f(pv.kw/1000)+'MWp。屋面投影与基底存在差异，最终需校核荷载、消防退距和遮挡。</p><p class="estimate-caption">0.22kWp/㎡为方案选型假设，可参考<a href="https://static.longi.com/Hi_MO_6_Explorer_LR_5_72_HTH_560_575_M_V03_DG_a74dacd587.pdf" target="_blank" rel="noopener">隆基组件参数：570W、2278×1134mm</a>（约0.221kWp/㎡）；900等效小时为暂定情景，尚未进行绵阳逐时辐照模拟。</p>');
  const panes=[engineering,investment,operation,evidence];
  [...tabbar.children].forEach((b,i)=>b.onclick=()=>{panes.forEach((p,j)=>p.hidden=i!==j);[...tabbar.children].forEach((t,j)=>t.setAttribute('aria-selected',String(i===j)))});
  const carbonInput=document.getElementById('carbonInvestment'),equipmentInput=document.getElementById('equipmentInvestment');carbonInput.step='0.01';
  function setEstimate(){carbonInput.value=total.toFixed(2);equipmentInput.value=0;carbonInput.dispatchEvent(new Event('input',{bubbles:true}))}
  setEstimate();document.getElementById('resetCost').addEventListener('click',setEstimate);
  equipmentInput.closest('label').hidden=true;
  const scope=cost.querySelector('.cost-scope-note');scope.textContent='工程建筑分项暂沿用已确认的最新面积台账，含旧版仓储归类；方案二功能已重组，分区建筑面积需复核。零碳专项'+f(total)+'万元已计入（内含10%专项预备费），年度运维'+f(annual)+'万元另列，不计入一次性投资。室外量暂估，单价为方案假设，未含土地、其他建设费用、融资与全项目预备费。北区冻库设备退出B地块零碳设备项。';
})();
