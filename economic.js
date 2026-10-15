(function(){
  function select(i,focus=false){
    const tabs=[...document.querySelectorAll('.economic-tabs [role="tab"]')];
    tabs.forEach((tab,n)=>{
      tab.setAttribute('aria-selected',String(i===n));
      tab.tabIndex=i===n?0:-1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden=i!==n;
    });
    if(focus)tabs[i].focus();
  }
  document.querySelector('.economic-tabs').addEventListener('click',event=>{
    const tabs=[...document.querySelectorAll('.economic-tabs [role="tab"]')];
    const i=tabs.indexOf(event.target.closest('[role="tab"]'));
    if(i>=0)select(i);
  });
  document.querySelector('.economic-tabs').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End',' '].includes(event.key))return;
    const tabs=[...document.querySelectorAll('.economic-tabs [role="tab"]')];
    const i=tabs.indexOf(event.target.closest('[role="tab"]'));
    if(i<0)return;
    event.preventDefault();event.stopPropagation();
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:event.key==='ArrowRight'?(i+1)%tabs.length:i;
    select(next,true);
  });
})();
