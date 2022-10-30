let React;module.link('react',{"*"(v){React=v}},0);let useUncontrolled;module.link('uncontrollable',{useUncontrolled(v){useUncontrolled=v}},1);let BaseTabs;module.link('@restart/ui/Tabs',{default(v){BaseTabs=v}},2);let Nav;module.link('./Nav',{default(v){Nav=v}},3);let NavLink;module.link('./NavLink',{default(v){NavLink=v}},4);let NavItem;module.link('./NavItem',{default(v){NavItem=v}},5);let TabContent;module.link('./TabContent',{default(v){TabContent=v}},6);let TabPane;module.link('./TabPane',{default(v){TabPane=v}},7);let forEach,map;module.link('./ElementChildren',{forEach(v){forEach=v},map(v){map=v}},8);let getTabTransitionComponent;module.link('./getTabTransitionComponent',{default(v){getTabTransitionComponent=v}},9);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},10);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},11);











const defaultProps = {
  variant: 'tabs',
  mountOnEnter: false,
  unmountOnExit: false
};

function getDefaultActiveKey(children) {
  let defaultActiveKey;
  forEach(children, child => {
    if (defaultActiveKey == null) {
      defaultActiveKey = child.props.eventKey;
    }
  });
  return defaultActiveKey;
}

function renderTab(child) {
  const {
    title,
    eventKey,
    disabled,
    tabClassName,
    tabAttrs,
    id
  } = child.props;

  if (title == null) {
    return null;
  }

  return /*#__PURE__*/_jsx(NavItem, {
    as: "li",
    role: "presentation",
    children: /*#__PURE__*/_jsx(NavLink, {
      as: "button",
      type: "button",
      eventKey: eventKey,
      disabled: disabled,
      id: id,
      className: tabClassName,
      ...tabAttrs,
      children: title
    })
  });
}

const Tabs = props => {
  const {
    id,
    onSelect,
    transition,
    mountOnEnter,
    unmountOnExit,
    children,
    activeKey = getDefaultActiveKey(children),
    ...controlledProps
  } = useUncontrolled(props, {
    activeKey: 'onSelect'
  });
  return /*#__PURE__*/_jsxs(BaseTabs, {
    id: id,
    activeKey: activeKey,
    onSelect: onSelect,
    transition: getTabTransitionComponent(transition),
    mountOnEnter: mountOnEnter,
    unmountOnExit: unmountOnExit,
    children: [/*#__PURE__*/_jsx(Nav, { ...controlledProps,
      role: "tablist",
      as: "ul",
      children: map(children, renderTab)
    }), /*#__PURE__*/_jsx(TabContent, {
      children: map(children, child => {
        const childProps = { ...child.props
        };
        delete childProps.title;
        delete childProps.disabled;
        delete childProps.tabClassName;
        delete childProps.tabAttrs;
        return /*#__PURE__*/_jsx(TabPane, { ...childProps
        });
      })
    })]
  });
};

Tabs.defaultProps = defaultProps;
Tabs.displayName = 'Tabs';
module.exportDefault(Tabs);