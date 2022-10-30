let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let SelectableContext;module.link('@restart/ui/SelectableContext',{default(v){SelectableContext=v}},2);let TabContext;module.link('@restart/ui/TabContext',{default(v){TabContext=v}},3);let useTabPanel;module.link('@restart/ui/TabPanel',{useTabPanel(v){useTabPanel=v}},4);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},5);let Fade;module.link('./Fade',{default(v){Fade=v}},6);let getTabTransitionComponent;module.link('./getTabTransitionComponent',{default(v){getTabTransitionComponent=v}},7);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},8);








const TabPane = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  transition,
  ...props
}, ref) => {
  const [{
    className,
    // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
    as: Component = 'div',
    ...rest
  }, {
    isActive,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
    mountOnEnter,
    unmountOnExit,
    transition: Transition = Fade
  }] = useTabPanel({ ...props,
    transition: getTabTransitionComponent(transition)
  });
  const prefix = useBootstrapPrefix(bsPrefix, 'tab-pane'); // We provide an empty the TabContext so `<Nav>`s in `<TabPanel>`s don't
  // conflict with the top level one.

  return /*#__PURE__*/_jsx(TabContext.Provider, {
    value: null,
    children: /*#__PURE__*/_jsx(SelectableContext.Provider, {
      value: null,
      children: /*#__PURE__*/_jsx(Transition, {
        in: isActive,
        onEnter: onEnter,
        onEntering: onEntering,
        onEntered: onEntered,
        onExit: onExit,
        onExiting: onExiting,
        onExited: onExited,
        mountOnEnter: mountOnEnter,
        unmountOnExit: unmountOnExit,
        children: /*#__PURE__*/_jsx(Component, { ...rest,
          ref: ref,
          className: classNames(className, prefix, isActive && 'active')
        })
      })
    })
  });
});
TabPane.displayName = 'TabPane';
module.exportDefault(TabPane);