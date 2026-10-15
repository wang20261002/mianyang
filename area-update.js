(() => {
  const replacements = [
    ['173,035.38', '153,072.63'],
    ['173035.38', '153072.63'],
    ['245,460.29', '228,228.02'],
    ['245460.29', '225497.54']
  ];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    let value = node.nodeValue;
    replacements.forEach(([from, to]) => { value = value.split(from).join(to); });
    node.nodeValue = value;
  });
})();
