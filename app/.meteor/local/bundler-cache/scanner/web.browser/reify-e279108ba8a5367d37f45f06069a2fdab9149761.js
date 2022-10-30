let classNames;module.link('classnames',{default(v){classNames=v}},0);let css;module.link('dom-helpers/css',{default(v){css=v}},1);let React,useMemo;module.link('react',{default(v){React=v},useMemo(v){useMemo=v}},2);let ENTERED,ENTERING,EXITED,EXITING;module.link('react-transition-group/Transition',{ENTERED(v){ENTERED=v},ENTERING(v){ENTERING=v},EXITED(v){EXITED=v},EXITING(v){EXITING=v}},3);let transitionEndListener;module.link('./transitionEndListener',{default(v){transitionEndListener=v}},4);let createChainedFunction;module.link('./createChainedFunction',{default(v){createChainedFunction=v}},5);let triggerBrowserReflow;module.link('./triggerBrowserReflow',{default(v){triggerBrowserReflow=v}},6);let TransitionWrapper;module.link('./TransitionWrapper',{default(v){TransitionWrapper=v}},7);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},8);








const MARGINS = {
  height: ['marginTop', 'marginBottom'],
  width: ['marginLeft', 'marginRight']
};

function getDefaultDimensionValue(dimension, elem) {
  const offset = `offset${dimension[0].toUpperCase()}${dimension.slice(1)}`;
  const value = elem[offset];
  const margins = MARGINS[dimension];
  return value + // @ts-ignore
  parseInt(css(elem, margins[0]), 10) + // @ts-ignore
  parseInt(css(elem, margins[1]), 10);
}

const collapseStyles = {
  [EXITED]: 'collapse',
  [EXITING]: 'collapsing',
  [ENTERING]: 'collapsing',
  [ENTERED]: 'collapse show'
};
const defaultProps = {
  in: false,
  timeout: 300,
  mountOnEnter: false,
  unmountOnExit: false,
  appear: false,
  getDimensionValue: getDefaultDimensionValue
};
const Collapse = /*#__PURE__*/React.forwardRef(({
  onEnter,
  onEntering,
  onEntered,
  onExit,
  onExiting,
  className,
  children,
  dimension = 'height',
  getDimensionValue = getDefaultDimensionValue,
  ...props
}, ref) => {
  /* Compute dimension */
  const computedDimension = typeof dimension === 'function' ? dimension() : dimension;
  /* -- Expanding -- */

  const handleEnter = useMemo(() => createChainedFunction(elem => {
    elem.style[computedDimension] = '0';
  }, onEnter), [computedDimension, onEnter]);
  const handleEntering = useMemo(() => createChainedFunction(elem => {
    const scroll = `scroll${computedDimension[0].toUpperCase()}${computedDimension.slice(1)}`;
    elem.style[computedDimension] = `${elem[scroll]}px`;
  }, onEntering), [computedDimension, onEntering]);
  const handleEntered = useMemo(() => createChainedFunction(elem => {
    elem.style[computedDimension] = null;
  }, onEntered), [computedDimension, onEntered]);
  /* -- Collapsing -- */

  const handleExit = useMemo(() => createChainedFunction(elem => {
    elem.style[computedDimension] = `${getDimensionValue(computedDimension, elem)}px`;
    triggerBrowserReflow(elem);
  }, onExit), [onExit, getDimensionValue, computedDimension]);
  const handleExiting = useMemo(() => createChainedFunction(elem => {
    elem.style[computedDimension] = null;
  }, onExiting), [computedDimension, onExiting]);
  return /*#__PURE__*/_jsx(TransitionWrapper, {
    ref: ref,
    addEndListener: transitionEndListener,
    ...props,
    "aria-expanded": props.role ? props.in : null,
    onEnter: handleEnter,
    onEntering: handleEntering,
    onEntered: handleEntered,
    onExit: handleExit,
    onExiting: handleExiting,
    childRef: children.ref,
    children: (state, innerProps) => /*#__PURE__*/React.cloneElement(children, { ...innerProps,
      className: classNames(className, children.props.className, collapseStyles[state], computedDimension === 'width' && 'collapse-horizontal')
    })
  });
}); // @ts-ignore

// @ts-ignore
Collapse.defaultProps = defaultProps;
module.exportDefault(Collapse);