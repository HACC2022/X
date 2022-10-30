let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},2);let Dropdown;module.link('./Dropdown',{default(v){Dropdown=v}},3);let NavLink;module.link('./NavLink',{default(v){NavLink=v}},4);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},5);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},6);






const NavDropdown = /*#__PURE__*/React.forwardRef(({
  id,
  title,
  children,
  bsPrefix,
  className,
  rootCloseEvent,
  menuRole,
  disabled,
  active,
  renderMenuOnMount,
  menuVariant,
  ...props
}, ref) => {
  /* NavItem has no additional logic, it's purely presentational. Can set nav item class here to support "as" */
  const navItemPrefix = useBootstrapPrefix(undefined, 'nav-item');
  return /*#__PURE__*/_jsxs(Dropdown, {
    ref: ref,
    ...props,
    className: classNames(className, navItemPrefix),
    children: [/*#__PURE__*/_jsx(Dropdown.Toggle, {
      id: id,
      eventKey: null,
      active: active,
      disabled: disabled,
      childBsPrefix: bsPrefix,
      as: NavLink,
      children: title
    }), /*#__PURE__*/_jsx(Dropdown.Menu, {
      role: menuRole,
      renderOnMount: renderMenuOnMount,
      rootCloseEvent: rootCloseEvent,
      variant: menuVariant,
      children: children
    })]
  });
});
NavDropdown.displayName = 'NavDropdown';
module.exportDefault(Object.assign(NavDropdown, {
  Item: Dropdown.Item,
  ItemText: Dropdown.ItemText,
  Divider: Dropdown.Divider,
  Header: Dropdown.Header
}));