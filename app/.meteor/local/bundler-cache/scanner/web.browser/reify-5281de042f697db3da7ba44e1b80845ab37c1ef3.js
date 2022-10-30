let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},2);let useNavItem;module.link('@restart/ui/NavItem',{useNavItem(v){useNavItem=v}},3);let makeEventKey;module.link('@restart/ui/SelectableContext',{makeEventKey(v){makeEventKey=v}},4);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},5);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},6);






const ListGroupItem = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  active,
  disabled,
  eventKey,
  className,
  variant,
  action,
  as,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'list-group-item');
  const [navItemProps, meta] = useNavItem({
    key: makeEventKey(eventKey, props.href),
    active,
    ...props
  });
  const handleClick = useEventCallback(event => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    navItemProps.onClick(event);
  });

  if (disabled && props.tabIndex === undefined) {
    props.tabIndex = -1;
    props['aria-disabled'] = true;
  } // eslint-disable-next-line no-nested-ternary


  const Component = as || (action ? props.href ? 'a' : 'button' : 'div');
  return /*#__PURE__*/_jsx(Component, {
    ref: ref,
    ...props,
    ...navItemProps,
    onClick: handleClick,
    className: classNames(className, bsPrefix, meta.isActive && 'active', disabled && 'disabled', variant && `${bsPrefix}-${variant}`, action && `${bsPrefix}-action`)
  });
});
ListGroupItem.displayName = 'ListGroupItem';
module.exportDefault(ListGroupItem);