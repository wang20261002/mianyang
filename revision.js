(() => {
  const format = n => n.toLocaleString('zh-CN', {maximumFractionDigits:2});
  // 报建仓储152890.18含改造仓库1，按运营造价拆出37874.78，避免重复。
  const items = [
    {name:'仓储建筑',area:115015.40,rate:1800,note:'沿用最新面积台账，方案二另核'},
    {name:'汽修汽检改造',area:37874.78,rate:2000,note:'改造仓库1，暂沿用原单价'},
    {name:'配套办公',area:18221.94,rate:2000,note:'办公1、2各9,110.97㎡'},
    {name:'酒店',area:9110.97,rate:2200,note:'最新面积表'},
    {name:'道路及场地',area:30000,rate:450,note:'暂用原估算量，待B地块核量'},
    {name:'绿化及景观',area:8824.80,rate:450,note:'B用地×5.1%，暂按比例分摊'},
    {name:'坡道构筑物',area:11200,rate:1200,note:'暂用原估算量，待核量'}
  ];
  const section = document.querySelector('[data-title="工程造价估算"]');
  section.querySelector('.section-head h2').textContent='B地块工程投资估算';
  section.querySelector('.section-head p:not(.eyebrow)').textContent='南侧B地块173,035.38㎡，建筑180,223.09㎡。按建筑面积计费，双倍计容不增加工程计费面积。';
  section.querySelector('.cost-toolbar span').textContent='单价沿用原方案假设，可拖动调整；未作市场询价';
  section.querySelector('.cost-total>span').textContent='B地块已计工程费用';
  const note = section.querySelector('.small-note');
  note.className='cost-scope-note';
  note.textContent='范围：B地块，不含北侧ACD、一期海关中心及铁路货场。建筑分项合计180,223.09㎡。室外工程量为暂估，绿化按5.1%比例分摊，不代表实测。仓储及冻库单价暂沿用1,800元/㎡，制冷等专项设备另列。零碳专项待核定容量后输入，0表示尚未计入。汇总为工程费用，未含土地、工程建设其他费用、预备费及融资费用；方案二面积尚未另核，当前为共用面积基准。';
  const controls = document.getElementById('costControls');
  const extras = document.createElement('div');extras.className='cost-extras';
  extras.innerHTML='<label>零碳专项 <input id="carbonInvestment" type="number" min="0" step="10" value="0" aria-label="零碳专项投资万元"> 万元</label><label>冻库设备等专项 <input id="equipmentInvestment" type="number" min="0" step="10" value="0" aria-label="专项设备投资万元"> 万元</label>';
  section.querySelector('.cost-toolbar').after(extras);
  const detail=document.createElement('p');detail.className='cost-detail';section.querySelector('.cost-total small').after(detail);
  const rates=items.map(x=>x.rate);
  function update(){
    const values=items.map((x,i)=>({name:x.name,value:x.area*rates[i]}));
    const building=values.slice(0,4).reduce((s,x)=>s+x.value,0);
    const carbon=Math.max(0,Number(document.getElementById('carbonInvestment').value)||0)*10000;
    const equipment=Math.max(0,Number(document.getElementById('equipmentInvestment').value)||0)*10000;
    values.push({name:'零碳专项',value:carbon},{name:'专项设备',value:equipment});
    const sum=values.reduce((s,x)=>s+x.value,0);
    document.getElementById('costTotal').textContent=(sum/1e8).toFixed(2);
    detail.textContent='建筑分项 '+format(building/10000)+' 万元；合计 '+format(sum/10000)+' 万元';
    document.getElementById('costBars').innerHTML=values.sort((a,b)=>b.value-a.value).map(x=>'<div class="bar"><span>'+x.name+'</span><i style="width:'+(sum?x.value/sum*100:0)+'%"></i><b>'+format(x.value/10000)+'万</b></div>').join('');
  }
  items.forEach((x,i)=>{
    const row=document.createElement('div');row.className='cost-row';
    row.innerHTML='<label>'+x.name+'<small>'+format(x.area)+'㎡<br>'+x.note+'</small></label><input type="range" min="0" max="'+x.rate*2+'" step="50" value="'+x.rate+'" aria-label="'+x.name+'单方造价"><output>'+x.rate+' 元/㎡</output>';
    row.querySelector('input').addEventListener('input',e=>{rates[i]=Number(e.target.value);row.querySelector('output').textContent=rates[i]+' 元/㎡';update()});
    controls.appendChild(row);
  });
  extras.addEventListener('input',update);
  section.addEventListener('keydown',e=>{if(e.target.matches('input'))e.stopPropagation()});
  document.getElementById('resetCost').addEventListener('click',()=>{items.forEach((x,i)=>{rates[i]=x.rate;const row=controls.children[i];row.querySelector('input').value=x.rate;row.querySelector('output').textContent=x.rate+' 元/㎡'});extras.querySelectorAll('input').forEach(x=>x.value=0);update()});
  update();
  const strategy=document.querySelector('[data-title="B地块零碳策略"] .section-head p:not(.eyebrow)');
  strategy.textContent='B地块建筑180,223.09㎡，仓储152,890.18㎡、配套27,332.91㎡。按最新面积表组织负荷预测，冻库及汽修单独计量。';
  const plan=document.querySelector('[data-title="零碳总图措施"]');
  plan.querySelector('.section-head p:not(.eyebrow)').textContent='采用方案二1013总图。绿色虚线为B地块建设范围示意，北侧与铁路货场仅作背景。';
  const map=plan.querySelector('.carbon-plan-image');map.classList.add('scheme2-carbon');
  map.querySelector('img').src='assets/scheme2-masterplan.png';
  map.querySelector('img').alt='方案二B地块零碳建设范围示意';
  map.querySelector('svg').outerHTML='<svg class="carbon-map-overlay" viewBox="0 0 2048 1152" role="img" aria-label="方案二B地块零碳范围示意"><defs><mask id="scheme2-b-mask"><rect width="2048" height="1152" fill="white"/><path d="M570 599 L1925 126 L2000 233 L849 1081 L755 1042 Z" fill="black"/></mask></defs><rect width="2048" height="1152" fill="#102936" opacity=".58" mask="url(#scheme2-b-mask)"/><path d="M570 599 L1925 126 L2000 233 L849 1081 L755 1042 Z" fill="none" stroke="#87e0b7" stroke-width="5" stroke-dasharray="16 10"/><g class="carbon-boundary-label"><rect x="90" y="520" width="320" height="48"/><text x="105" y="550">北侧及一期：不纳入本次范围</text><rect x="1180" y="880" width="330" height="48"/><text x="1195" y="910">B地块：173,035.38㎡</text></g></svg>';
  plan.querySelector('.carbon-map-key').innerHTML='<span><i></i>B地块建设范围示意</span><span>屋顶光伏为建筑效果意向，边界须以DXF核对；储能、充换电及计量点位待专项落位。</span>';
  const notes=plan.querySelectorAll('.carbon-map-notes li');
  notes[0].querySelector('span').textContent='方案二屋顶已表达光伏意向。装机容量按B地块可用屋面、消防通道、荷载与遮挡核定，不采用全园效果图装机量。';
  notes[2].querySelector('b').textContent='03｜储能设施预留';
  notes[2].querySelector('span').textContent='方案二另行确认储能选址，校核变配电距离、消防与检修条件；不沿用方案一11号点位。';
  notes[3].querySelector('b').textContent='04｜充换电设施预留';
  notes[3].querySelector('span').textContent='按B地块运营车辆预测论证容量与选址，分期增容，并与冷库负荷协同。';
  notes[6].querySelector('span').textContent='接入全B地块用能与发电，平台机房位置随运营方案确定。';
  ['鸟瞰效果一','鸟瞰效果二','夜景鸟瞰二','故事板二','概念分析'].forEach(title=>{const c=document.querySelector('[data-title="'+title+'"] .effect-caption');if(c)c.textContent='方案一｜'+c.textContent});
  document.querySelector('[data-title="SU三维交互模型"] h2').textContent='方案一SU体块模型与单体指标';
  document.querySelector('[data-title="体块生成与总平面"] h2').textContent='方案一功能总图落位';
})();
