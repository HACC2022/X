module.export({BsPrefixComponent:()=>BsPrefixComponent,getOverlayDirection:()=>getOverlayDirection});let React;module.link('react',{"*"(v){React=v}},0);
class BsPrefixComponent extends React.Component {} // Need to use this instead of typeof Component to get proper type checking.

function getOverlayDirection(placement, isRTL) {
  let bsDirection = placement;

  if (placement === 'left') {
    bsDirection = isRTL ? 'end' : 'start';
  } else if (placement === 'right') {
    bsDirection = isRTL ? 'start' : 'end';
  }

  return bsDirection;
}