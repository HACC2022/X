let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let Anchor;module.link('@restart/ui/Anchor',{default(v){Anchor=v}},2);let useNavItem;module.link('@restart/ui/NavItem',{useNavItem(v){useNavItem=v}},3);let makeEventKey;module.link('@restart/ui/SelectableContext',{makeEventKey(v){makeEventKey=v}},4);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},5);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},6);






const defaultProps = {
  disabled: false
};
const NavLink = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  as: Component = Anchor,
  active,
  eventKey,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'nav-link');
  const [navItemProps, meta] = useNavItem({
    key: makeEventKey(eventKey, props.href),
    active,
    ...props
  });
  return /*#__PURE__*/_jsx(Component, { ...props,
    ...navItemProps,
    ref: ref,
    className: classNames(className, bsPrefix, props.disabled && 'disabled', meta.isActive && 'active')
  });
});
NavLink.displayName = 'NavLink';
NavLink.defaultProps = defaultProps;
module.exportDefault(NavLink);