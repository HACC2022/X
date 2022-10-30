module.export({default:()=>transitionEndListener});let css;module.link('dom-helpers/css',{default(v){css=v}},0);let transitionEnd;module.link('dom-helpers/transitionEnd',{default(v){transitionEnd=v}},1);


function parseDuration(node, property) {
  const str = css(node, property) || '';
  const mult = str.indexOf('ms') === -1 ? 1000 : 1;
  return parseFloat(str) * mult;
}

function transitionEndListener(element, handler) {
  const duration = parseDuration(element, 'transitionDuration');
  const delay = parseDuration(element, 'transitionDelay');
  const remove = transitionEnd(element, e => {
    if (e.target === element) {
      remove();
      handler(e);
    }
  }, duration + delay);
}