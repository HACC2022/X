let React;module.link('react',{"*"(v){React=v}},0);let useContext;module.link('react',{useContext(v){useContext=v}},1);let Collapse;module.link('./Collapse',{default(v){Collapse=v}},2);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},3);let NavbarContext;module.link('./NavbarContext',{default(v){NavbarContext=v}},4);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},5);





const NavbarCollapse = /*#__PURE__*/React.forwardRef(({
  children,
  bsPrefix,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'navbar-collapse');
  const context = useContext(NavbarContext);
  return /*#__PURE__*/_jsx(Collapse, {
    in: !!(context && context.expanded),
    ...props,
    children: /*#__PURE__*/_jsx("div", {
      ref: ref,
      className: bsPrefix,
      children: children
    })
  });
});
NavbarCollapse.displayName = 'NavbarCollapse';
module.exportDefault(NavbarCollapse);