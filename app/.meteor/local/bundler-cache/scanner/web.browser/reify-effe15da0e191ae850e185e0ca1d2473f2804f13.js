let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix,useBootstrapBreakpoints,useBootstrapMinBreakpoint;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v},useBootstrapBreakpoints(v){useBootstrapBreakpoints=v},useBootstrapMinBreakpoint(v){useBootstrapMinBreakpoint=v}},2);let createUtilityClassName,responsivePropType;module.link('./createUtilityClasses',{default(v){createUtilityClassName=v},responsivePropType(v){responsivePropType=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);




const Stack = /*#__PURE__*/React.forwardRef(({
  as: Component = 'div',
  bsPrefix,
  className,
  direction,
  gap,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, direction === 'horizontal' ? 'hstack' : 'vstack');
  const breakpoints = useBootstrapBreakpoints();
  const minBreakpoint = useBootstrapMinBreakpoint();
  return /*#__PURE__*/_jsx(Component, { ...props,
    ref: ref,
    className: classNames(className, bsPrefix, ...createUtilityClassName({
      gap,
      breakpoints,
      minBreakpoint
    }))
  });
});
Stack.displayName = 'Stack';
module.exportDefault(Stack);