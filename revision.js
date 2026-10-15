(() => {
  ['鸟瞰效果一','鸟瞰效果二','夜景鸟瞰二','故事板二','概念分析'].forEach(title=>{const c=document.querySelector('[data-title="'+title+'"] .effect-caption');if(c)c.textContent='方案一｜'+c.textContent});
  document.querySelector('[data-title="SU三维交互模型"] h2').textContent='方案一SU体块模型与单体指标';
  document.querySelector('[data-title="体块生成与总平面"] h2').textContent='方案一功能总图落位';
})();
