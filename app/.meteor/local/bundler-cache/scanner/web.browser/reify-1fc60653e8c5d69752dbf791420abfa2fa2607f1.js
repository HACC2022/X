module.export({useDropdownItem:()=>useDropdownItem});let React;module.link('react',{"*"(v){React=v}},0);let useContext;module.link('react',{useContext(v){useContext=v}},1);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},2);let SelectableContext,makeEventKey;module.link('./SelectableContext',{default(v){SelectableContext=v},makeEventKey(v){makeEventKey=v}},3);let NavContext;module.link('./NavContext',{default(v){NavContext=v}},4);let Button;module.link('./Button',{default(v){Button=v}},5);let dataAttr;module.link('./DataKey',{dataAttr(v){dataAttr=v}},6);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},7);const _excluded = ["eventKey", "disabled", "onClick", "active", "as"];

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }










/**
 * Create a dropdown item. Returns a set of props for the dropdown item component
 * including an `onClick` handler that prevents selection when the item is disabled
 */
function useDropdownItem({
  key,
  href,
  active,
  disabled,
  onClick
}) {
  const onSelectCtx = useContext(SelectableContext);
  const navContext = useContext(NavContext);
  const {
    activeKey
  } = navContext || {};
  const eventKey = makeEventKey(key, href);
  const isActive = active == null && key != null ? makeEventKey(activeKey) === eventKey : active;
  const handleClick = useEventCallback(event => {
    if (disabled) return;
    onClick == null ? void 0 : onClick(event);

    if (onSelectCtx && !event.isPropagationStopped()) {
      onSelectCtx(eventKey, event);
    }
  });
  return [{
    onClick: handleClick,
    'aria-disabled': disabled || undefined,
    'aria-selected': isActive,
    [dataAttr('dropdown-item')]: ''
  }, {
    isActive
  }];
}
const DropdownItem = /*#__PURE__*/React.forwardRef((_ref, ref) => {
  let {
    eventKey,
    disabled,
    onClick,
    active,
    as: Component = Button
  } = _ref,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  const [dropdownItemProps] = useDropdownItem({
    key: eventKey,
    href: props.href,
    disabled,
    onClick,
    active
  });
  return /*#__PURE__*/_jsx(Component, Object.assign({}, props, {
    ref: ref
  }, dropdownItemProps));
});
DropdownItem.displayName = 'DropdownItem';
module.exportDefault(DropdownItem);