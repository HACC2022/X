let classNames;module.link('classnames',{default(v){classNames=v}},0);let all;module.link('prop-types-extra/lib/all',{default(v){all=v}},1);let React;module.link('react',{"*"(v){React=v}},2);let useContext;module.link('react',{useContext(v){useContext=v}},3);let useUncontrolled;module.link('uncontrollable',{useUncontrolled(v){useUncontrolled=v}},4);let BaseNav;module.link('@restart/ui/Nav',{default(v){BaseNav=v}},5);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},6);let NavbarContext;module.link('./NavbarContext',{default(v){NavbarContext=v}},7);let CardHeaderContext;module.link('./CardHeaderContext',{default(v){CardHeaderContext=v}},8);let NavItem;module.link('./NavItem',{default(v){NavItem=v}},9);let NavLink;module.link('./NavLink',{default(v){NavLink=v}},10);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},11);











const defaultProps = {
  justify: false,
  fill: false
};
const Nav = /*#__PURE__*/React.forwardRef((uncontrolledProps, ref) => {
  const {
    as = 'div',
    bsPrefix: initialBsPrefix,
    variant,
    fill,
    justify,
    navbar,
    navbarScroll,
    className,
    activeKey,
    ...props
  } = useUncontrolled(uncontrolledProps, {
    activeKey: 'onSelect'
  });
  const bsPrefix = useBootstrapPrefix(initialBsPrefix, 'nav');
  let navbarBsPrefix;
  let cardHeaderBsPrefix;
  let isNavbar = false;
  const navbarContext = useContext(NavbarContext);
  const cardHeaderContext = useContext(CardHeaderContext);

  if (navbarContext) {
    navbarBsPrefix = navbarContext.bsPrefix;
    isNavbar = navbar == null ? true : navbar;
  } else if (cardHeaderContext) {
    ({
      cardHeaderBsPrefix
    } = cardHeaderContext);
  }

  return /*#__PURE__*/_jsx(BaseNav, {
    as: as,
    ref: ref,
    activeKey: activeKey,
    className: classNames(className, {
      [bsPrefix]: !isNavbar,
      [`${navbarBsPrefix}-nav`]: isNavbar,
      [`${navbarBsPrefix}-nav-scroll`]: isNavbar && navbarScroll,
      [`${cardHeaderBsPrefix}-${variant}`]: !!cardHeaderBsPrefix,
      [`${bsPrefix}-${variant}`]: !!variant,
      [`${bsPrefix}-fill`]: fill,
      [`${bsPrefix}-justified`]: justify
    }),
    ...props
  });
});
Nav.displayName = 'Nav';
Nav.defaultProps = defaultProps;
module.exportDefault(Object.assign(Nav, {
  Item: NavItem,
  Link: NavLink
}));