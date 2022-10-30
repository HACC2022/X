module.export({alignPropType:()=>alignPropType},true);let PropTypes;module.link('prop-types',{default(v){PropTypes=v}},0);
const alignDirection = PropTypes.oneOf(['start', 'end']);
const alignPropType = PropTypes.oneOfType([alignDirection, PropTypes.shape({
  sm: alignDirection
}), PropTypes.shape({
  md: alignDirection
}), PropTypes.shape({
  lg: alignDirection
}), PropTypes.shape({
  xl: alignDirection
}), PropTypes.shape({
  xxl: alignDirection
}), PropTypes.object]);