(() => {
  const rows=window.ZERO_CARBON_INPUT.rows;
  const metrics=window.PROJECT_METRICS;
  const customsRows=[
    {id:'E1a',name:'已建海关监管仓库',base:2160.71,gfa:2160.71,far:2957.13,category:'已建仓储'},
    {id:'E1附属',name:'已建海关卡口及设备等',base:1502.11,gfa:2445.29,far:1815.05,category:'已建配套'}
  ];
  const allRows=[...rows,...customsRows];
  const f=(n,d=2)=>n.toLocaleString('zh-CN',{minimumFractionDigits:d,maximumFractionDigits:d});
  const northIds=['11','12-南','12-北','10'];
  const north=r=>northIds.includes(r.id);
  const sum=(list,key)=>list.reduce((s,r)=>s+r[key],0);
  const select=ids=>allRows.filter(r=>ids.includes(r.id));
  const cold=select(['10','12-北']),office=select(['11','04','05','03','06']);
  // 以基底作屋顶投影代理量；按屋面用途分别预扣消防、设备、检修与遮挡。
  const roofs=allRows.map(r=>({...r,zone:r.id.startsWith('E1')?'海关中心':north(r)?'北侧ACD':'南侧B',coverage:r.id==='E1a'?.8:r.id==='E1附属'?.5:['10','12-北'].includes(r.id)?.6:r.category==='配套'?.5:.8}));
  roofs.forEach(r=>{r.panelArea=r.base*r.coverage;r.kw=r.panelArea*.22;r.kwh=r.kw*900});
  const pv={base:sum(roofs,'base'),panel_area:sum(roofs,'panelArea'),kw:sum(roofs,'kw'),kwh:sum(roofs,'kwh'),hours_assumption:900,module_kw_m2:.22};
  const energyGroups=[
    {name:'普通及保税仓储',ids:['07-2','07-3','07-4','12-南'],intensity:25,saving:.10},
    {name:'汽配汽修汽检',ids:['07-1'],intensity:60,saving:.10},
    {name:'冻库1、冻库2',ids:['10','12-北'],intensity:250,saving:.15},
    {name:'办公及安保宿舍',ids:['11','04','05','03'],intensity:60,saving:.15},
    {name:'酒店',ids:['06'],intensity:100,saving:.15},
    {name:'档案馆',ids:['02'],intensity:50,saving:.10},
    {name:'地面金库',ids:['01'],intensity:40,saving:.10},
    {name:'已建海关监管中心',ids:['E1a','E1附属'],intensity:60,saving:.10}
  ];
  energyGroups.forEach(g=>{g.rows=select(g.ids);g.area=sum(g.rows,'gfa');g.baseline=g.area*g.intensity;g.reduction=g.baseline*g.saving;g.demand=g.baseline-g.reduction});
  const charging=1680*3*365; // 充电装机1.68MW，暂按3个等效满负荷小时/日
  const publicKwh=200000;
  const baseline=sum(energyGroups,'baseline')+charging+publicKwh;
  const reduction=sum(energyGroups,'reduction'),demand=baseline-reduction;
  // 年度占位情景，不推断逐时消纳；储能损耗归入净自用假设，未另计储能节能收益。
  const selfUse=Math.min(pv.kwh*.70,demand),exportKwh=pv.kwh-selfUse,grid=demand-selfUse;
  const factor=.55,avoided=(reduction+selfUse)*factor/1000;
  const energy={groups:energyGroups,charging,publicKwh,baseline,reduction,demand,selfUse,exportKwh,grid,selfUseAssumption:.70,emissionFactor:factor,avoided};
  const coldArea=sum(cold,'gfa'),officeArea=sum(office,'gfa');
  const costs=[
    ['南北屋顶光伏',f(pv.kw/1000)+'MWp × 3.50元/Wp',pv.kw*3500/10000,pv.kw*50/10000,'清洗、巡检和小修；50元/kWp·年假设'],
    ['储能系统（容量待核）','2MW/4MWh × 1,200元/kWh',480,16,'维护40元/kWh·年；不含购电、电池更换'],
    ['南区共用充电设备','20台120kW×12万＋30台360kW×35万',1290,64.5,'南区一期共50枪，维护按设备费5%'],
    ['南区换电站预留','全园一期共2座站体及接口',600,30,'南区预留估算，不含换电电池资产'],
    ['充换电配电及场地','约2,500kVA接口预留＋土建线缆',150,3,'仅充换电增容，非全园变配电总费用'],
    ['南北办公酒店节能增量',f(officeArea)+'㎡ × 80元/㎡',officeArea*80/10000,officeArea*80/10000*.03,'高效照明控制等相对常规建安增量，维护3%'],
    ['北区冻库节能增量',f(coldArea)+'㎡ × 200元/㎡',coldArea*200/10000,coldArea*200/10000*.03,'相对常规制冷的控制优化、变频增量暂估；不重计保温和整套机组'],
    ['海关中心节能改造','4,606.00㎡ × 80元/㎡',4606*80/10000,4606*80/10000*.03,'已建照明、空调控制及计量改造；不含主体重建'],
    ['全园计量与能碳平台','48回路×1.5万＋共用平台机房90万',162,23.8,'统一平台、南北、海关及制冷分项计量，含运维人员分摊假设']
  ];
  const direct=costs.reduce((s,r)=>s+r[2],0),reserve=direct*.1,total=direct+reserve,annual=costs.reduce((s,r)=>s+r[3],0);
  window.CARBON_ESTIMATE={costs,direct,reserve,total,annual,pv,roofs,energy,coldArea,officeArea,scope:'南北地块'};
  const strategy=document.querySelector('[data-title="南北地块零碳策略"]');
  strategy.querySelector('h2').textContent='南北统筹：先降耗，再供绿电，持续核算';
  strategy.querySelector('.section-head p:not(.eyebrow)').textContent='南侧B＋北侧ACD用地228,228.02㎡；全园建筑（含已建海关）'+f(sum(allRows,'gfa'))+'㎡，其中北区冻库'+f(coldArea)+'㎡。南北整体规划、分区计量、分类控制、统一管理。';
  const strategyText=[
    ['统一边界与分区基线','南北地块统一建账，按仓储、冻库、办公酒店、汽车服务及海关中心分别计量。已建海关监管中心4,606.00㎡纳入北区能源及改造统计；铁路货场不在本轮园区核算边界。'],
    ['南北屋顶光伏＋绿电补充','仓储屋面暂按80%、冻库60%、配套50%可铺比例，预扣设备、消防及检修空间；全园约'+f(pv.kw/1000)+'MWp，900小时情景年发电'+f(pv.kwh/10000)+'万kWh。'],
    ['北区冻库与全园建筑节能','两栋冻库优化门区、冷桥和高效制冷控制；余热回收、蓄冷列为深化选项。全园LED、分区控制与设备变频，制冷剂泄漏管理另列。'],
    ['储能与持续用能协同','2MW/4MWh保留为待校核起始方案。依据冻库24小时运行、光伏出力与充电曲线确定容量及分布；不得用年发电量替代逐时匹配。'],
    ['南区绿色物流与充换电','南区一期共50枪＋2座换电预留，服务全园物流车辆；电动叉车、装卸预约和短倒组织协同，园外运输减排单列。'],
    ['统一平台与年度核查','共用能碳平台，暂列48个重点计量回路；南北分区、海关中心、冻库制冷及发电独立计量。以实际能源账单、绿电凭证及适用排放因子核查。']
  ];
  strategy.querySelectorAll('.carbon-evaluation article').forEach((a,i)=>{a.querySelector('h3').textContent=strategyText[i][0];a.querySelector('p').textContent=strategyText[i][1]});
  strategy.querySelector('.carbon-conclusion').textContent='建设路径：南北统一设计 → 分区分期实施 → 实测能源平衡 → 绿电补足与年度核查。当前为方案测算，不能据此认定已达到零碳。';
  const plan=document.querySelector('[data-title="零碳总图措施"]');
  plan.querySelector('h2').textContent='南北地块零碳实施措施';
  plan.querySelector('.section-head p:not(.eyebrow)').textContent='零碳园区范围按方案二总平面图南北地块用地红线表达；军供站为已建现状建筑，不纳入园区范围；设施编号为布置意向，非施工定位。';
  const map=plan.querySelector('.carbon-plan-image');map.classList.add('scheme2-carbon');map.querySelector('img').src='assets/scheme2-masterplan.png';map.querySelector('img').alt='方案二南北地块零碳统筹设计示意';
  const pins=[['01',1100,590],['01',475,275],['02',395,140],['03',1870,160],['04',1810,220],['05',860,990],['06',690,610],['07',700,300]];
  map.querySelector('svg').outerHTML='<svg class="carbon-map-overlay" viewBox="0 0 2048 1152" role="img" aria-label="南北两区零碳设施意向">'+pins.map(([id,x,y])=>'<g class="carbon-pin carbon-pin-provisional" transform="translate('+x+' '+y+')"><circle r="24"/><text y="8">'+id+'</text></g>').join('')+'</svg>';
  plan.querySelector('.carbon-map-key').innerHTML='<span>绿色：南侧B；蓝色：北侧ACD，均纳入整体设计。分区线须以DXF复核。</span><span>橙色编号为措施意向；海关中心为北区已建子项，纳入能耗及节能改造；已建主体不重复计费。铁路货场不计入。</span>';
  const notes=[
    ['01｜南北可利用屋顶光伏','南北及海关屋顶分别建账，合计铺板约'+f(pv.panel_area)+'㎡、装机'+f(pv.kw/1000)+'MWp；冻库屋顶预扣制冷设备及消防检修占用。'],
    ['02｜北区两栋冻库节能','冻库1、冻库2合计建筑面积'+f(coldArea)+'㎡；制冷变频、门区及分区控制。余热回收、蓄冷适用性待专项评估。'],
    ['03｜全园储能待核方案','暂保留2MW/4MWh，意向位置需校核配电、消防和检修；以两区逐时负荷确定最终规模。'],
    ['04｜南区充换电设施','南区一期布置50枪及2座换电预留；统一服务全园物流车辆，北区不重复建设充换电设施。'],
    ['05｜全园绿色物流组织','南北装卸预约、电动叉车及短倒统筹；跨边界运输单列，铁路货场本体不在本轮专项工程费用内。'],
    ['06｜南北配套建筑节能','办公、安保宿舍及倒班宿舍（酒店二次改造）合计'+f(officeArea)+'㎡；照明、空调控制及分项计量，常规装修机电留在建安费。'],
    ['07｜北区能碳平台','北区红线内布置能碳管理节点，接入北区用能与发电；军供站为已建现状建筑，不纳入零碳园区范围。']
  ];
  plan.querySelectorAll('.carbon-map-notes li').forEach((li,i)=>{li.querySelector('b').textContent=notes[i][0];li.querySelector('span').textContent=notes[i][1]});
  const cost=document.querySelector('[data-title="工程造价估算"]');
  cost.querySelector('.section-head p:not(.eyebrow)').textContent='南北两区共用面积与零碳专项，两套按钮仅切换建筑计价口径；冻库常规保温制冷与零碳节能增量分列。';
  const tabbar=document.createElement('div');tabbar.className='estimate-tabs';tabbar.setAttribute('role','tablist');tabbar.setAttribute('aria-label','工程与零碳测算');
  const engineering=document.createElement('div');engineering.className='estimate-panel';[...cost.children].filter(x=>x!==cost.querySelector('.section-head')).forEach(x=>engineering.appendChild(x));cost.appendChild(engineering);cost.querySelector('.section-head').after(tabbar);
  const table=(heads,body)=>'<table class="estimate-table"><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table>';
  const tr=(cells,cls='')=>'<tr class="'+cls+'">'+cells.map(c=>'<td>'+c+'</td>').join('')+'</tr>';
  const caption=t=>'<p class="estimate-caption">'+t+'</p>';
  const makePanel=html=>{const p=document.createElement('div');p.className='estimate-panel';p.hidden=true;p.innerHTML=html;cost.appendChild(p);return p};
  const investment=makePanel(table(['专项','规模与单价假设','万元'],costs.map(r=>tr([r[0],r[1],f(r[2])])).join('')+tr(['专项预备费','上述小计×10%',f(reserve)])+tr(['南北零碳专项合计','两套工程估算共用',f(total)],'total'))+caption('冻库常规建筑及保温3,000元/㎡、制冷系统1,400元/㎡已列入工程费用；本专项仅列200元/㎡节能增量，需与设备招标清单核对去重。常规仓储LED与机电节能纳入建安，不重复新增专项费用。余热回收、蓄冷尚未定型，费用及额外收益暂不计。')+caption('全部设备容量、单价和维护费用为方案占位假设，非询价。光伏3.50元/Wp含常规系统及接入；150万元仅计充换电配电。未含屋面加固、大范围外网、全园变配电增容、绿电采购、换电电池资产及融资；实施前另行论证。'));
  const operation=makePanel(table(['运维项','万元/年','费用范围'],costs.map(r=>tr([r[0],f(r[3]),r[4]])).join('')+tr(['专项年度运维合计',f(annual),'南北共用专项'],'total'))+caption('只计新增零碳设施运维，不代表全园物业和物流运营成本；不含购电、绿电溢价、电池更换、大修、折旧及冻库常规制冷维护。平台仅计一套。'));
  const evidence=makePanel(table(['分区及编号','功能','屋顶代理面积㎡','可铺比例','铺板㎡','装机kWp'],roofs.map(r=>tr([r.zone+' '+r.id,r.name,f(r.base),f(r.coverage*100,0)+'%',f(r.panelArea),f(r.kw)])).join('')+['南侧B','北侧ACD','海关中心'].map(z=>{const rs=roofs.filter(r=>r.zone===z);return tr([z+'小计','',f(sum(rs,'base')),'',f(sum(rs,'panelArea')),f(sum(rs,'kw'))])}).join('')+tr(['全园合计','',f(pv.base),'',f(pv.panel_area),f(pv.kw)],'total'))+caption('屋顶代理面积取本轮DXF基底；非实测净屋面。配套的0.8系数仅用于建筑面积，不再用于屋顶投影。仓储可铺80%、冻库60%、配套50%已概略预扣设备、消防检修及遮挡，尚未逐屋面排布；0.22kWp/㎡、900等效小时均为方案假设，最终复核荷载、消防与逐时辐照。海关已建基底3,662.82㎡纳入屋顶代理量，其中监管仓库2,160.71㎡、其他建筑1,502.11㎡；按既有屋面结构、设备和消防条件复核。铁路背景屋顶不计。'));
  const balance=makePanel(table(['用能分项','建筑面积㎡','基线kWh/㎡·年','基线万kWh/年','节能率','节能后万kWh/年'],energyGroups.map(g=>tr([g.name,f(g.area),g.intensity,f(g.baseline/10000),g.saving*100+'%',f(g.demand/10000)])).join('')+tr(['全园车辆充电','按1.68MW×3h/日×365日','—',f(charging/10000),'暂不计',f(charging/10000)])+tr(['室外照明等公用','暂列','—',f(publicKwh/10000),'暂不计',f(publicKwh/10000)])+tr(['全园合计',f(sum(allRows,'gfa')),'—',f(baseline/10000),'',f(demand/10000)],'total'))+table(['能源平衡占位情景','万kWh/年'],[
    ['节能量',reduction],['光伏总发电',pv.kwh],['光伏净自用（发电量70%假设）',selfUse],['余电外送',exportKwh],['节能后园区用电',demand],['仍需外购电／可进一步采购绿电',grid]
  ].map(([n,v])=>tr([n,f(v/10000)])).join(''))+caption('建筑用电强度与节能率均为方案情景，非实测或标准限值；冻库按建筑面积250kWh/㎡·年暂估，实际需按温区、库容、周转量及设备效率复核。建筑强度含各自室内辅助用电，室外公用另列；车辆电能按园区充电表计入，园外运输不重复。')+caption('年度光伏发电相当于节能后用电的'+f(pv.kwh/demand*100)+'%，不等于自给率；70%净自用情景下自供比例'+f(selfUse/demand*100)+'%。未做8760小时模拟，不认定当前光伏规模可全部消纳；储能损耗在净自用假设中概略处理，储能不另计“节电量”。')+caption('按占位电力因子0.55kgCO₂/kWh，节能＋光伏自用避免排放约'+f(avoided)+'吨CO₂/年，剩余购电排放约'+f(grid*factor/1000)+'吨CO₂/年。该因子尚未核实适用年份及区域，不用于申报；外送减排未抵扣园区排放。此表只计运行用电，尚未覆盖燃料、制冷剂及其他适用排放，不能据此判定零碳达标。'));
  const panes=[engineering,investment,operation,evidence,balance];
  ['工程投资','南北零碳明细','年度运维','光伏量取依据','全园能源平衡'].forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.id='carbon-tab-'+i;b.setAttribute('aria-controls','carbon-panel-'+i);b.setAttribute('aria-selected',String(i===0));panes[i].id='carbon-panel-'+i;panes[i].setAttribute('role','tabpanel');panes[i].setAttribute('aria-labelledby',b.id);b.textContent=name;b.onclick=()=>{panes.forEach((p,j)=>p.hidden=i!==j);[...tabbar.children].forEach((t,j)=>t.setAttribute('aria-selected',String(i===j)))};tabbar.appendChild(b)});
  const carbonInput=document.getElementById('carbonInvestment');carbonInput.step='0.01';
  function resetCarbon(){carbonInput.value=total.toFixed(2);carbonInput.dispatchEvent(new Event('input',{bubbles:true}))}
  resetCarbon();document.getElementById('resetCost').addEventListener('click',resetCarbon);
  cost.querySelector('.cost-scope-note').textContent='用地228,228.02㎡，整体建筑'+f(metrics.overall.gfa)+'㎡，其中新建'+f(metrics.newGfa)+'㎡、已建海关4,606.00㎡。两套新建工程费均按实际建筑面积计算，已建主体不重复计价；海关新增节能改造、屋顶光伏和计量接入列入零碳专项。全园零碳专项'+f(total)+'万元（含10%专项预备费）同步计入两套方案。冻库常规保温、制冷与节能增量分列。道路80,000㎡、坡道11,200㎡为暂列；新增绿化'+f(metrics.newGreen)+'㎡按新增建设用地5%控制，海关已建绿地不重复计价。未含铁路货场、土地、建设其他费、融资、全项目预备费及未列专项；本表为工程费用估算。';
  const policy=document.querySelector('[data-title="零碳建设目标"]');
  policy.querySelector('.section-head p:not(.eyebrow)').textContent='南侧B＋北侧ACD统一设计｜228,228.02㎡，约22.82公顷';
  policy.querySelector('.carbon-focus').innerHTML='<h3>本项目｜南北整体设计、分区核算</h3><p>南北用地共228,228.02㎡，北侧ACD已包含海关用地19,583.79㎡。新建建筑225,117.65㎡与已建海关4,606.00㎡统一纳入能源核算；已建主体不重复计费，节能改造纳入专项。铁路货场不计入本轮边界。</p><p>国家级主体资格与管理责任需另行论证，不把本建设项目直接等同于可申报主体。</p><p>本轮为运行用电方案情景，尚未完成综合能耗与全口径排放核算，不能直接套用政策档位或认定达标。</p>';
  document.querySelector('[data-title="国内零碳案例"] .carbon-conclusion').textContent='案例投资须统一范围；本项目按南北地块整体能源负荷、可用屋顶与分期建设测算，不直接套用案例规模或认证结论。';
  document.querySelector('[data-title="方案二概念分析"] .small-note').textContent='原设计推演图保留；图中12MW、减碳量及35%绿化率为历史概念标注，本次南北整体测算以屋顶及能源台账为准。';
  const conclusion=document.querySelector('[data-title="方案结论"]');
  const add=document.createElement('p');add.className='carbon-conclusion';add.textContent='南北零碳整体设计：光伏约'+f(pv.kw/1000)+'MWp，专项约'+f(total)+'万元；冻库高效制冷增量单列，统一能碳平台。下一步复核面积、逐时消纳、配电容量及绿电采购，形成可核查的零碳建设路径。';conclusion.appendChild(add);
})();
