module.export({useNavItem:()=>useNavItem});let React;module.link('react',{"*"(v){React=v}},0);let useContext;module.link('react',{useContext(v){useContext=v}},1);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},2);let NavContext;module.link('./NavContext',{default(v){NavContext=v}},3);let SelectableContext,makeEventKey;module.link('./SelectableContext',{default(v){SelectableContext=v},makeEventKey(v){makeEventKey=v}},4);let Button;module.link('./Button',{default(v){Button=v}},5);let dataAttr;module.link('./DataKey',{dataAttr(v){dataAttr=v}},6);let TabContext;module.link('./TabContext',{default(v){TabContext=v}},7);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},8);const _excluded = ["as", "active", "eventKey"];

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }










function useNavItem({
  key,
  onClick,
  active,
  id,
  role,
  disabled
}) {
  const parentOnSelect = useContext(SelectableContext);
  const navContext = useContext(NavContext);
  const tabContext = useContext(TabContext);
  let isActive = active;
  const props = {
    role
  };

  if (navContext) {
    if (!role && navContext.role === 'tablist') props.role = 'tab';
    const contextControllerId = navContext.getControllerId(key != null ? key : null);
    const contextControlledId = navContext.getControlledId(key != null ? key : null); // @ts-ignore

    props[dataAttr('event-key')] = key;
    props.id = contextControllerId || id;
    isActive = active == null && key != null ? navContext.activeKey === key : active;
    /**
     * Simplified scenario for `mountOnEnter`.
     *
     * While it would make sense to keep 'aria-controls' for tabs that have been mounted at least
     * once, it would also complicate the code quite a bit, for very little gain.
     * The following implementation is probably good enough.
     *
     * @see https://github.com/react-restart/ui/pull/40#issuecomment-1009971561
     */

    if (isActive || !(tabContext != null && tabContext.unmountOnExit) && !(tabContext != null && tabContext.mountOnEnter)) props['aria-controls'] = contextControlledId;
  }

  if (props.role === 'tab') {
    props['aria-selected'] = isActive;

    if (!isActive) {
      props.tabIndex = -1;
    }

    if (disabled) {
      props.tabIndex = -1;
      props['aria-disabled'] = true;
    }
  }

  props.onClick = useEventCallback(e => {
    if (disabled) return;
    onClick == null ? void 0 : onClick(e);

    if (key == null) {
      return;
    }

    if (parentOnSelect && !e.isPropagationStopped()) {
      parentOnSelect(key, e);
    }
  });
  return [props, {
    isActive
  }];
}
const NavItem = /*#__PURE__*/React.forwardRef((_ref, ref) => {
  let {
    as: Component = Button,
    active,
    eventKey
  } = _ref,
      options = _objectWithoutPropertiesLoose(_ref, _excluded);

  const [props, meta] = useNavItem(Object.assign({
    key: makeEventKey(eventKey, options.href),
    active
  }, options)); // @ts-ignore

  props[dataAttr('active')] = meta.isActive;
  return /*#__PURE__*/_jsx(Component, Object.assign({}, options, props, {
    ref: ref
  }));
});
NavItem.displayName = 'NavItem';
module.exportDefault(NavItem);