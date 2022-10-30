let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix,useIsRTL;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v},useIsRTL(v){useIsRTL=v}},2);let PopoverHeader;module.link('./PopoverHeader',{default(v){PopoverHeader=v}},3);let PopoverBody;module.link('./PopoverBody',{default(v){PopoverBody=v}},4);let getOverlayDirection;module.link('./helpers',{getOverlayDirection(v){getOverlayDirection=v}},5);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},6);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},7);







const defaultProps = {
  placement: 'right'
};
const Popover = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  placement,
  className,
  style,
  children,
  body,
  arrowProps,
  popper: _,
  show: _1,
  ...props
}, ref) => {
  const decoratedBsPrefix = useBootstrapPrefix(bsPrefix, 'popover');
  const isRTL = useIsRTL();
  const [primaryPlacement] = (placement == null ? void 0 : placement.split('-')) || [];
  const bsDirection = getOverlayDirection(primaryPlacement, isRTL);
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    role: "tooltip",
    style: style,
    "x-placement": primaryPlacement,
    className: classNames(className, decoratedBsPrefix, primaryPlacement && `bs-popover-${bsDirection}`),
    ...props,
    children: [/*#__PURE__*/_jsx("div", {
      className: "popover-arrow",
      ...arrowProps
    }), body ? /*#__PURE__*/_jsx(PopoverBody, {
      children: children
    }) : children]
  });
});
Popover.defaultProps = defaultProps;
module.exportDefault(Object.assign(Popover, {
  Header: PopoverHeader,
  Body: PopoverBody,
  // Default popover offset.
  // https://github.com/twbs/bootstrap/blob/5c32767e0e0dbac2d934bcdee03719a65d3f1187/js/src/popover.js#L28
  POPPER_OFFSET: [0, 8]
}));