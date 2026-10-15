(() => {
  const rows=window.ZERO_CARBON_INPUT.rows;
  const f=n=>n.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
  const select=ids=>rows.filter(r=>ids.includes(r.id));
  const sum=(rs,key='gfa')=>rs.reduce((s,r)=>s+r[key],0);
  const groups=[
    {name:'普通综合仓储',ids:['07-2','07-3','07-4'],rate:2200,range:'1,900–2,600',note:'含常规土建、机电消防；不含汽修设备、货架和自动化；双倍计容按实际建筑面积计价'},
    {name:'保税仓库',ids:['12-南'],rate:2200,range:'1,900–2,600',note:'同普通仓储；不含海关监管专用设备；双倍计容按实际建筑面积计价'},
    {name:'冻库建筑及保温',ids:['10','12-北'],rate:3000,range:'2,600–3,600',note:'按约−18℃冷冻库；含土建、保温地坪、冷库门及常规机电消防'},
    {name:'办公及安保宿舍',ids:['11','04','05','03'],rate:3000,range:'2,600–3,500',note:'含一般装修、常规机电消防'},
    {name:'配套倒班宿舍',ids:['06'],rate:3000,range:'2,600–3,500',note:'报规报建按倒班宿舍；二次改造酒店，按方案阶段建安暂估'},
    {name:'汽配汽修汽检（含汽车美容）',ids:['07-1'],rate:2000,functionalRate:3200,range:'商业口径2,600–3,500',note:'统一仓储口径不含二次改造费用；功能口径按商业用房土建、一般装修及常规机电消防，不含举升、检测、维修等经营设备'},
    {name:'档案馆',ids:['02'],rate:2000,functionalRate:3600,range:'2,800–3,800',note:'统一仓储口径不含二次改造费用；功能口径含常规土建机电消防，不含密集架、专用恒温恒湿及数字化系统'},
    {name:'地面金库',ids:['01'],rate:2000,functionalRate:4500,range:'3,500–5,000',note:'统一仓储口径不含二次改造费用；功能口径含主体及一般防护暂估，不含库门、安防及金融专业设备'}
  ];
  groups.forEach(g=>{g.rows=select(g.ids);g.area=sum(g.rows);g.far=sum(g.rows,'far')});
  const cold=groups[2],totalArea=sum(rows),totalFar=sum(rows,'far');
  window.renderProjectMetrics();
  const items=[...groups.map(g=>({...g,kind:'building'})),
    {name:'冻库制冷系统',area:cold.area,rate:1400,range:'1,200–1,900',note:'按冻库建筑面积；含制冷机组、末端、管道及控制；不含货架，实际库容待核',kind:'equipment'},
    {name:'道路及硬化场地',area:80000,rate:450,range:'350–550',note:'南北两区暂列80,000㎡，非量取；含面层基层及常规场内排水',kind:'outdoor'},
    {name:'绿化及景观',area:window.PROJECT_METRICS.newGreen,rate:300,range:'200–450',note:'新增建设用地按5%设计控制；不含海关已建绿地1,297.09㎡',kind:'outdoor'},
    {name:'坡道及交通构筑物',area:11200,rate:2500,range:'2,000–3,200',note:'暂列11,200㎡坡道结构投影，不含于建筑面积；待专项核量',kind:'outdoor'}
  ];
  const section=document.querySelector('[data-title="工程造价估算"]');
  section.querySelector('h2').textContent='南北地块工程费用估算对比';
  section.querySelector('.cost-toolbar span').textContent='四川地区方案阶段经验建议价｜含税建安暂估、非实时信息价或询价｜拖动可调整';
  section.querySelector('.cost-total>span').textContent='南北两区已列工程费用（非项目总投资）';
  const note=section.querySelector('.small-note');note.className='cost-scope-note';
  const extras=document.createElement('div');extras.className='cost-extras';extras.innerHTML='<label>南北地块零碳专项 <input id="carbonInvestment" type="number" min="0" step="0.01" value="0" aria-label="南北地块零碳专项投资万元"> 万元</label><label>其他补充专项 <input id="equipmentInvestment" type="number" min="0" step="10" value="0" aria-label="补充专项投资万元"> 万元</label>';section.querySelector('.cost-toolbar').after(extras);
  const controls=document.getElementById('costControls'),rates=items.map(x=>x.rate);
  const presets=[{id:'warehouse',name:'统一仓储口径',rates:items.map(x=>x.rate)},{id:'functional',name:'按功能分别计价',rates:items.map(x=>x.functionalRate||x.rate)}];
  let selected=0,modified=false;
  const presetBar=document.createElement('div');presetBar.className='cost-presets';presetBar.setAttribute('role','group');presetBar.setAttribute('aria-label','工程费用默认值');
  presetBar.innerHTML=presets.map((x,i)=>'<button type="button" aria-pressed="'+(i===0)+'">'+x.name+'</button>').join('');
  const status=document.createElement('p');status.className='cost-preset-status';status.setAttribute('aria-live','polite');
  extras.before(presetBar,status);
  const style=document.createElement('style');style.textContent='.cost-presets{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0}.cost-presets button{padding:10px 20px;border:1px solid #5a8097;border-radius:5px;background:transparent;color:#d2e8ee;cursor:pointer}.cost-presets button[aria-pressed="true"]{background:#157f98;border-color:#70e2eb;color:white;font-weight:bold}.cost-preset-status{font-size:12px;line-height:1.6;color:#bcd2dc;margin:8px 0 12px}.cost-bars .bar{grid-template-columns:150px 1fr 90px}.combined-rate-details{overflow-x:auto}';document.head.appendChild(style);
  const detail=document.createElement('p');detail.className='cost-detail';section.querySelector('.cost-total small').after(detail);
  const rateTable=document.createElement('details');rateTable.className='combined-rate-details';rateTable.innerHTML='<summary>查看工程量、单价建议区间及计价范围</summary><table class="estimate-table"><thead><tr><th>子项</th><th>工程量㎡</th><th>当前价元/㎡</th><th>经验区间元/㎡</th><th>计价范围/假设</th></tr></thead><tbody>'+items.map(x=>'<tr><td>'+x.name+'</td><td>'+f(x.area)+'</td><td>'+x.rate+'</td><td>'+x.range+'</td><td>'+x.note+'</td></tr>').join('')+'</tbody></table><p>冻库建筑及保温3,000＋制冷1,400＝4,400元/㎡；均按建筑面积，不按双倍计容面积计费。建议区间只用于本次合理性讨论，未引用已核实的四川造价信息或招标结算案例。</p>';rateTable.querySelector('p').textContent='冻库建筑及保温3,000＋制冷1,400＝4,400元/㎡；按实际建筑面积计费。单价为四川地区方案阶段经验暂估，最终以专项设计及造价咨询成果核定。已建海关主体不重复计入新建费用，新增零碳改造列入专项。';note.before(rateTable);
  function update(){
    presetBar.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));
    status.textContent=presets[selected].name+(modified?'（已手动调整）':'（默认单价）')+'｜两套均含南北地块，冻库1、冻库2均位于北侧ACD地块。统一仓储口径：汽配汽修汽检、地面金库、档案馆均按仓储计价，不含二次改造费用。点击按钮恢复对应默认单价。';
    rateTable.querySelectorAll('tbody tr').forEach((tr,i)=>tr.cells[2].textContent=rates[i]);
    const difference=items.reduce((v,x,i)=>v+x.area*(presets[1].rates[i]-presets[0].rates[i]),0);
    const values=items.map((x,i)=>({name:x.name,value:x.area*rates[i],kind:x.kind}));
    const carbon=Math.max(0,Number(document.getElementById('carbonInvestment').value)||0)*10000;
    const extra=Math.max(0,Number(document.getElementById('equipmentInvestment').value)||0)*10000;
    const base=values.reduce((s,x)=>s+x.value,0),total=base+carbon+extra;
    const building=values.filter(x=>x.kind==='building').reduce((s,x)=>s+x.value,0);
    detail.textContent='两套默认工程费用差额 '+f(difference/10000)+' 万元；建筑 '+f(building/10000)+' 万元；工程小计 '+f(base/10000)+' 万元；含南北地块零碳合计 '+f(total/10000)+' 万元';
    document.getElementById('costTotal').textContent=(total/1e8).toFixed(2);
    values.push({name:'南北地块零碳专项',value:carbon});if(extra)values.push({name:'补充专项',value:extra});
    document.getElementById('costBars').innerHTML=values.sort((a,b)=>b.value-a.value).map(x=>'<div class="bar"><span>'+x.name+'</span><i style="width:'+(total?x.value/total*100:0)+'%"></i><b>'+f(x.value/10000)+'万</b></div>').join('');
    window.COMBINED_ESTIMATE={preset:presets[selected].id,modified,defaultDifference:difference,items,rates:[...rates],building,base,carbon,total,totalArea,totalFar,wholeArea:window.PROJECT_METRICS.overall.gfa,wholeFar:window.PROJECT_METRICS.overall.far,existingArea:4606,coldArea:cold.area,coldFar:cold.far};
  }
  items.forEach((x,i)=>{const row=document.createElement('div');row.className='cost-row';row.innerHTML='<label>'+x.name+'<small>'+f(x.area)+'㎡</small></label><input type="range" min="0" max="'+Math.max(x.rate,x.functionalRate||0)*2+'" step="50" value="'+x.rate+'" aria-label="'+x.name+'单方造价"><output>'+x.rate+' 元/㎡</output>';row.querySelector('input').addEventListener('input',e=>{modified=true;rates[i]=Number(e.target.value);row.querySelector('output').textContent=rates[i]+' 元/㎡';update()});controls.appendChild(row)});
  extras.addEventListener('input',update);section.addEventListener('keydown',e=>{if(e.target.matches('input'))e.stopPropagation()});
  function applyPreset(index){selected=index;modified=false;items.forEach((x,i)=>{rates[i]=presets[index].rates[i];controls.children[i].querySelector('input').value=rates[i];controls.children[i].querySelector('output').textContent=rates[i]+' 元/㎡'});update()}
  presetBar.querySelectorAll('button').forEach((b,i)=>b.addEventListener('click',()=>applyPreset(i)));
  document.getElementById('resetCost')?.remove();
  update();
})();
