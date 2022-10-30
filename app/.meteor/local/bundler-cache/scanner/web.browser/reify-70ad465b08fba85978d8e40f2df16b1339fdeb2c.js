let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useContext,useMemo;module.link('react',{useContext(v){useContext=v},useMemo(v){useMemo=v}},2);let BaseDropdown;module.link('@restart/ui/Dropdown',{default(v){BaseDropdown=v}},3);let useUncontrolled;module.link('uncontrollable',{useUncontrolled(v){useUncontrolled=v}},4);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},5);let DropdownContext;module.link('./DropdownContext',{default(v){DropdownContext=v}},6);let DropdownItem;module.link('./DropdownItem',{default(v){DropdownItem=v}},7);let DropdownMenu,getDropdownMenuPlacement;module.link('./DropdownMenu',{default(v){DropdownMenu=v},getDropdownMenuPlacement(v){getDropdownMenuPlacement=v}},8);let DropdownToggle;module.link('./DropdownToggle',{default(v){DropdownToggle=v}},9);let InputGroupContext;module.link('./InputGroupContext',{default(v){InputGroupContext=v}},10);let useBootstrapPrefix,useIsRTL;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v},useIsRTL(v){useIsRTL=v}},11);let createWithBsPrefix;module.link('./createWithBsPrefix',{default(v){createWithBsPrefix=v}},12);let alignPropType;module.link('./types',{alignPropType(v){alignPropType=v}},13);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},14);














const DropdownHeader = createWithBsPrefix('dropdown-header', {
  defaultProps: {
    role: 'heading'
  }
});
const DropdownDivider = createWithBsPrefix('dropdown-divider', {
  Component: 'hr',
  defaultProps: {
    role: 'separator'
  }
});
const DropdownItemText = createWithBsPrefix('dropdown-item-text', {
  Component: 'span'
});
const defaultProps = {
  navbar: false,
  align: 'start',
  autoClose: true
};
const Dropdown = /*#__PURE__*/React.forwardRef((pProps, ref) => {
  const {
    bsPrefix,
    drop,
    show,
    className,
    align,
    onSelect,
    onToggle,
    focusFirstItemOnShow,
    // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
    as: Component = 'div',
    navbar: _4,
    autoClose,
    ...props
  } = useUncontrolled(pProps, {
    show: 'onToggle'
  });
  const isInputGroup = useContext(InputGroupContext);
  const prefix = useBootstrapPrefix(bsPrefix, 'dropdown');
  const isRTL = useIsRTL();

  const isClosingPermitted = source => {
    // autoClose=false only permits close on button click
    if (autoClose === false) return source === 'click'; // autoClose=inside doesn't permit close on rootClose

    if (autoClose === 'inside') return source !== 'rootClose'; // autoClose=outside doesn't permit close on select

    if (autoClose === 'outside') return source !== 'select';
    return true;
  };

  const handleToggle = useEventCallback((nextShow, meta) => {
    if (meta.originalEvent.currentTarget === document && (meta.source !== 'keydown' || meta.originalEvent.key === 'Escape')) meta.source = 'rootClose';
    if (isClosingPermitted(meta.source)) onToggle == null ? void 0 : onToggle(nextShow, meta);
  });
  const alignEnd = align === 'end';
  const placement = getDropdownMenuPlacement(alignEnd, drop, isRTL);
  const contextValue = useMemo(() => ({
    align,
    drop,
    isRTL
  }), [align, drop, isRTL]);
  return /*#__PURE__*/_jsx(DropdownContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(BaseDropdown, {
      placement: placement,
      show: show,
      onSelect: onSelect,
      onToggle: handleToggle,
      focusFirstItemOnShow: focusFirstItemOnShow,
      itemSelector: `.${prefix}-item:not(.disabled):not(:disabled)`,
      children: isInputGroup ? props.children : /*#__PURE__*/_jsx(Component, { ...props,
        ref: ref,
        className: classNames(className, show && 'show', (!drop || drop === 'down') && prefix, drop === 'up' && 'dropup', drop === 'end' && 'dropend', drop === 'start' && 'dropstart')
      })
    })
  });
});
Dropdown.displayName = 'Dropdown';
Dropdown.defaultProps = defaultProps;
module.exportDefault(Object.assign(Dropdown, {
  Toggle: DropdownToggle,
  Menu: DropdownMenu,
  Item: DropdownItem,
  ItemText: DropdownItemText,
  Divider: DropdownDivider,
  Header: DropdownHeader
}));