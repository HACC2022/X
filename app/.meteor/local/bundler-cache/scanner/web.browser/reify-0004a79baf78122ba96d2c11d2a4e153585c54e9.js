module.export({default:()=>getTabTransitionComponent});let NoopTransition;module.link('@restart/ui/NoopTransition',{default(v){NoopTransition=v}},0);let Fade;module.link('./Fade',{default(v){Fade=v}},1);

function getTabTransitionComponent(transition) {
  if (typeof transition === 'boolean') {
    return transition ? Fade : NoopTransition;
  }

  return transition;
}