let React;module.link('react',{"*"(v){React=v}},0);let useContext;module.link('react',{useContext(v){useContext=v}},1);let Offcanvas;module.link('./Offcanvas',{default(v){Offcanvas=v}},2);let NavbarContext;module.link('./NavbarContext',{default(v){NavbarContext=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);




const NavbarOffcanvas = /*#__PURE__*/React.forwardRef((props, ref) => {
  const context = useContext(NavbarContext);
  return /*#__PURE__*/_jsx(Offcanvas, {
    ref: ref,
    show: !!(context != null && context.expanded),
    ...props,
    renderStaticNode: true
  });
});
NavbarOffcanvas.displayName = 'NavbarOffcanvas';
module.exportDefault(NavbarOffcanvas);