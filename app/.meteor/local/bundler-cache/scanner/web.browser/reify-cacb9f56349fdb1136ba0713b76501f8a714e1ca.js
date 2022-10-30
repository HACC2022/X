let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useMemo;module.link('react',{useMemo(v){useMemo=v}},2);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},3);let CardHeaderContext;module.link('./CardHeaderContext',{default(v){CardHeaderContext=v}},4);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},5);





const CardHeader = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'div',
  ...props
}, ref) => {
  const prefix = useBootstrapPrefix(bsPrefix, 'card-header');
  const contextValue = useMemo(() => ({
    cardHeaderBsPrefix: prefix
  }), [prefix]);
  return /*#__PURE__*/_jsx(CardHeaderContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(Component, {
      ref: ref,
      ...props,
      className: classNames(className, prefix)
    })
  });
});
CardHeader.displayName = 'CardHeader';
module.exportDefault(CardHeader);