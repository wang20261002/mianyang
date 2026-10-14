(() => {
  const button = document.getElementById('landscapeToggle');
  if (!button) return;
  const isTouch = matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!isTouch) { button.hidden = true; return; }
  const update = () => {
    const landscape = matchMedia('(orientation: landscape)').matches;
    button.textContent = landscape ? '全屏' : '横屏';
    button.setAttribute('aria-label', landscape ? '进入全屏演示' : '进入横屏模式');
  };
  async function enterLandscape() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      await screen.orientation?.lock?.('landscape');
    } catch (err) {
      // iOS and some browsers only allow the physical rotation; the visible hint remains.
    }
    update();
  }
  button.addEventListener('click', enterLandscape);
  screen.orientation?.addEventListener?.('change', update);
  matchMedia('(orientation: landscape)').addEventListener?.('change', update);
  update();
})();
