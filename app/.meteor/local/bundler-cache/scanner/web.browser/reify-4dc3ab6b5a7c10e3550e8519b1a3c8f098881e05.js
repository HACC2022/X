module.export({useDropdownToggle:()=>useDropdownToggle});module.export({isRoleMenu:()=>isRoleMenu},true);let useContext,useCallback;module.link('react',{useContext(v){useContext=v},useCallback(v){useCallback=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useSSRSafeId;module.link('./ssr',{useSSRSafeId(v){useSSRSafeId=v}},2);let DropdownContext;module.link('./DropdownContext',{default(v){DropdownContext=v}},3);let _Fragment;module.link("react/jsx-runtime",{Fragment(v){_Fragment=v}},4);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},5);





const isRoleMenu = el => {
  var _el$getAttribute;

  return ((_el$getAttribute = el.getAttribute('role')) == null ? void 0 : _el$getAttribute.toLowerCase()) === 'menu';
};

const noop = () => {};
/**
 * Wires up Dropdown toggle functionality, returning a set a props to attach
 * to the element that functions as the dropdown toggle (generally a button).
 *
 * @memberOf Dropdown
 */


function useDropdownToggle() {
  const id = useSSRSafeId();
  const {
    show = false,
    toggle = noop,
    setToggle,
    menuElement
  } = useContext(DropdownContext) || {};
  const handleClick = useCallback(e => {
    toggle(!show, e);
  }, [show, toggle]);
  const props = {
    id,
    ref: setToggle || noop,
    onClick: handleClick,
    'aria-expanded': !!show
  }; // This is maybe better down in an effect, but
  // the component is going to update anyway when the menu element
  // is set so might return new props.

  if (menuElement && isRoleMenu(menuElement)) {
    props['aria-haspopup'] = true;
  }

  return [props, {
    show,
    toggle
  }];
}

/**
 * Also exported as `<Dropdown.Toggle>` from `Dropdown`.
 *
 * @displayName DropdownToggle
 * @memberOf Dropdown
 */
function DropdownToggle({
  children
}) {
  const [props, meta] = useDropdownToggle();
  return /*#__PURE__*/_jsx(_Fragment, {
    children: children(props, meta)
  });
}

DropdownToggle.displayName = 'DropdownToggle';
/** @component */

module.exportDefault(DropdownToggle);