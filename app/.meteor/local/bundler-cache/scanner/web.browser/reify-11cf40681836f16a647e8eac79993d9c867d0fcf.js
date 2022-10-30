let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useContext;module.link('react',{useContext(v){useContext=v}},2);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},3);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},4);let NavbarContext;module.link('./NavbarContext',{default(v){NavbarContext=v}},5);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},6);






const defaultProps = {
  label: 'Toggle navigation'
};
const NavbarToggle = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  children,
  label,
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'button',
  onClick,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'navbar-toggler');
  const {
    onToggle,
    expanded
  } = useContext(NavbarContext) || {};
  const handleClick = useEventCallback(e => {
    if (onClick) onClick(e);
    if (onToggle) onToggle();
  });

  if (Component === 'button') {
    props.type = 'button';
  }

  return /*#__PURE__*/_jsx(Component, { ...props,
    ref: ref,
    onClick: handleClick,
    "aria-label": label,
    className: classNames(className, bsPrefix, !expanded && 'collapsed'),
    children: children || /*#__PURE__*/_jsx("span", {
      className: `${bsPrefix}-icon`
    })
  });
});
NavbarToggle.displayName = 'NavbarToggle';
NavbarToggle.defaultProps = defaultProps;
module.exportDefault(NavbarToggle);