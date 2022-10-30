let React;module.link('react',{"*"(v){React=v}},0);let useMemo;module.link('react',{useMemo(v){useMemo=v}},1);let useUncontrolledProp;module.link('uncontrollable',{useUncontrolledProp(v){useUncontrolledProp=v}},2);let useSSRSafeId;module.link('./ssr',{useSSRSafeId(v){useSSRSafeId=v}},3);let TabContext;module.link('./TabContext',{default(v){TabContext=v}},4);let SelectableContext;module.link('./SelectableContext',{default(v){SelectableContext=v}},5);let TabPanel;module.link('./TabPanel',{default(v){TabPanel=v}},6);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},7);








const Tabs = props => {
  const {
    id: userId,
    generateChildId: generateCustomChildId,
    onSelect: propsOnSelect,
    activeKey: propsActiveKey,
    defaultActiveKey,
    transition,
    mountOnEnter,
    unmountOnExit,
    children
  } = props;
  const [activeKey, onSelect] = useUncontrolledProp(propsActiveKey, defaultActiveKey, propsOnSelect);
  const id = useSSRSafeId(userId);
  const generateChildId = useMemo(() => generateCustomChildId || ((key, type) => id ? `${id}-${type}-${key}` : null), [id, generateCustomChildId]);
  const tabContext = useMemo(() => ({
    onSelect,
    activeKey,
    transition,
    mountOnEnter: mountOnEnter || false,
    unmountOnExit: unmountOnExit || false,
    getControlledId: key => generateChildId(key, 'tabpane'),
    getControllerId: key => generateChildId(key, 'tab')
  }), [onSelect, activeKey, transition, mountOnEnter, unmountOnExit, generateChildId]);
  return /*#__PURE__*/_jsx(TabContext.Provider, {
    value: tabContext,
    children: /*#__PURE__*/_jsx(SelectableContext.Provider, {
      value: onSelect || null,
      children: children
    })
  });
};

Tabs.Panel = TabPanel;
module.exportDefault(Tabs);