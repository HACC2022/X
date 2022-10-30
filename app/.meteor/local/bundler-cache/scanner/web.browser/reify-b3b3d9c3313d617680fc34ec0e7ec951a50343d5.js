let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix,useIsRTL;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v},useIsRTL(v){useIsRTL=v}},2);let getOverlayDirection;module.link('./helpers',{getOverlayDirection(v){getOverlayDirection=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},5);





const defaultProps = {
  placement: 'right'
};
const Tooltip = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  placement,
  className,
  style,
  children,
  arrowProps,
  popper: _,
  show: _2,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'tooltip');
  const isRTL = useIsRTL();
  const [primaryPlacement] = (placement == null ? void 0 : placement.split('-')) || [];
  const bsDirection = getOverlayDirection(primaryPlacement, isRTL);
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    style: style,
    role: "tooltip",
    "x-placement": primaryPlacement,
    className: classNames(className, bsPrefix, `bs-tooltip-${bsDirection}`),
    ...props,
    children: [/*#__PURE__*/_jsx("div", {
      className: "tooltip-arrow",
      ...arrowProps
    }), /*#__PURE__*/_jsx("div", {
      className: `${bsPrefix}-inner`,
      children: children
    })]
  });
});
Tooltip.defaultProps = defaultProps;
Tooltip.displayName = 'Tooltip';
module.exportDefault(Tooltip);