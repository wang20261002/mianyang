(() => {
  const rows=window.ZERO_CARBON_INPUT.rows;
  const sum=(rs,k='gfa')=>rs.reduce((s,r)=>s+r[k],0);
  const f=n=>n.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
  const customs={land:19583.79,gfa:4606,far:4772.18,base:3662.82,green:1297.09,livingLand:1137.30,livingGfa:2761.83,above:4021.96,underground:584.04};
  const northRows=rows.filter(r=>['11','12-南','12-北','10'].includes(r.id));
  const southRows=rows.filter(r=>!northRows.includes(r));
  const southLand=153072.63,northLand=75155.39,land=southLand+northLand;
  const newNorthLand=northLand-customs.land,newLand=land-customs.land;
  const living=rs=>rs.filter(r=>r.category==='配套');
  const livingTarget=(sum(rows)+customs.gfa)*.1499;
  const livingDelta=livingTarget-(sum(living(rows))+customs.livingGfa);
  if(livingDelta>0){['04','05','06'].forEach(id=>{const r=rows.find(x=>x.id===id);if(r){r.gfa+=livingDelta/3;r.far+=livingDelta/3;}});}
  const make=(rs,area,old=false)=>({land:area,gfa:sum(rs)+(old?customs.gfa:0),far:sum(rs,'far')+(old?customs.far:0),base:sum(rs,'base')+(old?customs.base:0),green:(area-(old?customs.land:0))*.05+(old?customs.green:0),livingGfa:sum(living(rs))+(old?customs.livingGfa:0)});
  const south=make(southRows,southLand),north=make(northRows,northLand,true),overall=make(rows,land,true);
  const doubles=rows.filter(r=>r.far>r.gfa*1.5);
  window.PROJECT_METRICS={rows,customs,south,north,overall,southRows,northRows,land,newLand,newNorthLand,newGfa:sum(rows),newFar:sum(rows,'far'),doubles,newGreen:newLand*.05};
  window.renderProjectMetrics=()=>{
    const el=document.querySelector('[data-title="综合经济技术指标"]');
    el.classList.add('economic-slide');
    el.querySelector('h2').textContent='方案二综合经济技术指标';
    el.querySelector('.section-head p:not(.eyebrow)').textContent='南侧B＋北侧ACD（含已建海关监管中心）｜整体、分区、双倍计容及建筑明细';
    el.querySelectorAll('.economic-tabs,.economic-panel').forEach(x=>x.remove());
    const tr=(cs,total=false)=>'<tr'+(total?' class="economic-total"':'')+'>'+cs.map(c=>'<td>'+c+'</td>').join('')+'</tr>';
    const table=(heads,body)=>'<div class="metrics-table-wrap"><table class="economic-table"><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table></div>';
    const note=t=>'<div class="economic-note">'+t+'</div>';
    const metricRows=(m,isCustoms=false)=>[
      ['用地面积',f(m.land),'㎡',isCustoms?'北侧ACD内已建用地':''],
      ['建筑基底面积',f(m.base),'㎡',''],['总建筑面积',f(m.gfa),'㎡','实际建筑面积'],['计容建筑面积',f(m.far),'㎡','含双倍计容部分'],
      ['容积率',f(m.far/m.land),'','计容建筑面积／用地面积'],['建筑密度',f(m.base/m.land*100),'%','建筑基底面积／用地面积'],
      ['绿地面积',f(m.green),'㎡',isCustoms?'已建指标':'新增建设用地按5%设计控制；已建海关采用原指标'],
      ['绿地率',f(m.green/m.land*100),'%',isCustoms?'已建指标':'设计控制值'],
      ['生活配套建筑面积',f(m.livingGfa),'㎡','已包含在总建筑面积内'],
      ['生活配套建筑面积占比',f(m.livingGfa/m.gfa*100),'%','按实际建筑面积统计'],
      ['生活配套用地'+(isCustoms?'面积':'控制上限'),f(isCustoms?customs.livingLand:m.land*.07),'㎡',isCustoms?'已建指标':'总用地7%；非实测配套用地面积']
    ].map(cs=>tr(cs)).join('');
    const cat=[
      ['普通仓储',['07-1','07-2','07-3','07-4','01','02'],'含二次改造：汽配汽修汽检、汽车美容、地面金库、档案馆；07-4双倍计容'],
      ['保税仓储',['12-南'],'双倍计容'],['冻库',['10','12-北'],'冻库1、冻库2；双倍计容'],
      ['配套办公及倒班宿舍',['11','04','05','03'],''],['配套倒班宿舍',['06'],'二次改造酒店']
    ];
    const functions=table(['报规报建功能','建筑面积（㎡）','计容面积（㎡）','备注'],cat.map(([name,ids,n])=>{const rs=rows.filter(r=>ids.includes(r.id));return tr([name,f(sum(rs)),f(sum(rs,'far')),n])}).join('')+tr(['已建海关监管中心',f(customs.gfa),f(customs.far),'其中生活配套2,761.83㎡；监管仓库含双倍计容部分'])+tr(['合计',f(overall.gfa),f(overall.far),''],true));
    const overallHtml=table(['整体指标','数值','单位','备注'],metricRows(overall))+ '<h3>报规报建功能面积</h3>'+functions+note('北侧ACD用地75,155.39㎡已包含海关监管中心19,583.79㎡。新增建筑按方案二面积统计；海关中心采用已建综合技术经济指标。报建功能按仓储及配套分类，二次改造业态不另加面积。');
    const partFunctions=(rs,old=false)=>table(['功能','建筑面积（㎡）','计容面积（㎡）','备注'],cat.flatMap(([name,ids,n])=>{const matched=rs.filter(r=>ids.includes(r.id));return matched.length?[tr([name,f(sum(matched)),f(sum(matched,'far')),n])]:[]}).join('')+(old?tr(['已建海关监管中心',f(customs.gfa),f(customs.far),'含生活配套2,761.83㎡；详见海关中心子表']):''));
    const zoneHtml='<h3>南侧B地块</h3>'+table(['指标','数值','单位','备注'],metricRows(south))+partFunctions(southRows)+'<h3>北侧ACD地块（含海关中心）</h3>'+table(['指标','数值','单位','备注'],metricRows(north))+partFunctions(northRows,true)+note('北侧ACD：新增建设用地55,571.60㎡＋海关中心19,583.79㎡；新增建筑43,297.08㎡＋海关中心4,606.00㎡。')+'<h3>已建海关监管中心（北侧ACD子项）</h3>'+table(['指标','数值','单位','备注'],metricRows({...customs,livingGfa:customs.livingGfa},true)+tr(['地上建筑面积',f(customs.above),'㎡',''])+tr(['地下建筑面积',f(customs.underground),'㎡','设备用房，不计容'])+tr(['生活配套用地占比','5.81','%','海关中心用地口径'])+tr(['配套设施建筑容积率','2.43','','海关原指标']))+note('海关中心为北侧ACD的已建子项，不与北侧ACD重复求和。生活配套建筑2,761.83㎡为原指标中的功能分类子项，不与建筑单体面积相加。新增生活配套用地按总用地7%控制，独立用地边界以报建总图核量为准。');
    const doubleHtml=table(['所属地块','模型编号／功能','实际建筑面积（㎡）','计容方式','计容面积（㎡）','增计面积（㎡）'],doubles.map(r=>tr([northRows.includes(r)?'北侧ACD':'南侧B',r.id+'／'+r.name,f(r.gfa),'×2',f(r.far),f(r.far-r.gfa)])).join('')+tr(['新增建筑小计','',f(sum(doubles)),'',f(sum(doubles,'far')),f(sum(doubles,'far')-sum(doubles))],true)+tr(['北侧ACD·海关中心','E1a／监管仓库','2,160.71','部分×2','2,957.13','796.42'])+tr(['合计','',f(sum(doubles)+2160.71),'',f(sum(doubles,'far')+2957.13),f(sum(doubles,'far')-sum(doubles)+796.42)],true))+note('双倍计容增加的面积仅计入计容建筑面积，不增加实际建筑面积及工程计价面积。海关监管仓库按已建指标：建筑面积2,160.71㎡、计容面积2,957.13㎡，增计796.42㎡；海关其他单体按原核定计容值统计。');
    const remark=r=>['07-1','01','02'].includes(r.id)?'仓储；二次改造：'+r.name.replace('综合仓储（','').replace('）',''):r.far>r.gfa*1.5?'双倍计容':'';
    const details=table(['所属地块','方案二模型编号','功能','层数','建筑面积（㎡）','计容面积（㎡）','备注'],[...southRows,...northRows].map(r=>tr([northRows.includes(r)?'北侧ACD':'南侧B',r.id,r.name,r.floors,f(r.gfa),f(r.far),remark(r)])).join('')+tr(['新增建筑合计','','','',f(sum(rows)),f(sum(rows,'far')),''],true)+tr(['北侧ACD·海关中心','E1a','监管仓库','—','2,160.71','2,957.13','部分双倍计容'])+tr(['北侧ACD·海关中心','E1e','卡口1、卡口2','—','1,713.83','1,670.25','海关原指标合计'])+tr(['北侧ACD·海关中心','E1d','设备用房（地上及地下）','—','731.46','144.80','地上147.42㎡；地下584.04㎡'])+tr(['海关中心合计','','','',f(customs.gfa),f(customs.far),'其中生活配套2,761.83㎡，不另加'],true)+tr(['全园合计','','','',f(overall.gfa),f(overall.far),''],true))+note('建筑编号使用方案二网页SU模型的体块标识：12-南为保税仓库，12-北为冻库2，10为冻库1。E1e为两处卡口合并统计；海关生活配套面积采用原指标分类，不再作为独立单体重复累计。面积显示保留两位小数，合计按未取整值计算。');
    const bar=document.createElement('div');bar.className='economic-tabs metrics-tabs';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','方案二指标分类');el.appendChild(bar);
    const panels=[overallHtml,zoneHtml,doubleHtml,details].map((html,i)=>{const p=document.createElement('div');p.id='metrics-panel-'+i;p.className='economic-panel metrics-panel';p.setAttribute('role','tabpanel');p.hidden=i!==0;p.innerHTML=html;el.appendChild(p);return p});
    ['整体指标','分区指标','双倍计容专项','建筑面积明细'].forEach((name,i)=>{const b=document.createElement('button');b.textContent=name;b.type='button';b.id='metrics-tab-'+i;b.setAttribute('role','tab');b.setAttribute('aria-controls',panels[i].id);b.setAttribute('aria-selected',String(i===0));b.tabIndex=i===0?0:-1;panels[i].setAttribute('aria-labelledby',b.id);b.onclick=()=>{panels.forEach((p,j)=>p.hidden=j!==i);[...bar.children].forEach((x,j)=>{x.setAttribute('aria-selected',String(j===i));x.tabIndex=j===i?0:-1})};bar.appendChild(b)});
    bar.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();const buttons=[...bar.children],current=buttons.indexOf(document.activeElement),i=e.key==='Home'?0:e.key==='End'?3:(current+(e.key==='ArrowRight'?1:3))%4;buttons[i].click();buttons[i].focus()});
    const style=document.createElement('style');style.textContent='.metrics-panel{max-height:calc(100vh - 290px);overflow:auto;padding:0 4px 14px}.metrics-table-wrap{overflow-x:auto;margin-bottom:15px}.metrics-panel .economic-table{min-width:760px}.metrics-panel .economic-table td:last-child{white-space:normal;min-width:190px}.metrics-panel .economic-table th{white-space:nowrap}.metrics-panel h3{margin-top:10px}.metrics-panel .economic-table td{padding:7px 10px}@media(max-width:850px){.metrics-panel{max-height:calc(100dvh - 300px);min-height:180px}}';document.head.appendChild(style);
  };
})();
