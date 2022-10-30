let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useDropdownItem;module.link('@restart/ui/DropdownItem',{useDropdownItem(v){useDropdownItem=v}},2);let Anchor;module.link('@restart/ui/Anchor',{default(v){Anchor=v}},3);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},4);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},5);





const DropdownItem = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  eventKey,
  disabled = false,
  onClick,
  active,
  as: Component = Anchor,
  ...props
}, ref) => {
  const prefix = useBootstrapPrefix(bsPrefix, 'dropdown-item');
  const [dropdownItemProps, meta] = useDropdownItem({
    key: eventKey,
    href: props.href,
    disabled,
    onClick,
    active
  });
  return /*#__PURE__*/_jsx(Component, { ...props,
    ...dropdownItemProps,
    ref: ref,
    className: classNames(className, prefix, meta.isActive && 'active', disabled && 'disabled')
  });
});
DropdownItem.displayName = 'DropdownItem';
module.exportDefault(DropdownItem);