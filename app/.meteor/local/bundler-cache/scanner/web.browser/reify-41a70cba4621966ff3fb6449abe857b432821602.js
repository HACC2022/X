let qsa;module.link('dom-helpers/querySelectorAll',{default(v){qsa=v}},0);let addEventListener;module.link('dom-helpers/addEventListener',{default(v){addEventListener=v}},1);let useCallback,useRef,useEffect,useMemo,useContext;module.link('react',{useCallback(v){useCallback=v},useRef(v){useRef=v},useEffect(v){useEffect=v},useMemo(v){useMemo=v},useContext(v){useContext=v}},2);let React;module.link('react',{"*"(v){React=v}},3);let useUncontrolledProp;module.link('uncontrollable',{useUncontrolledProp(v){useUncontrolledProp=v}},4);let usePrevious;module.link('@restart/hooks/usePrevious',{default(v){usePrevious=v}},5);let useForceUpdate;module.link('@restart/hooks/useForceUpdate',{default(v){useForceUpdate=v}},6);let useEventListener;module.link('@restart/hooks/useEventListener',{default(v){useEventListener=v}},7);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},8);let DropdownContext;module.link('./DropdownContext',{default(v){DropdownContext=v}},9);let DropdownMenu;module.link('./DropdownMenu',{default(v){DropdownMenu=v}},10);let DropdownToggle,isRoleMenu;module.link('./DropdownToggle',{default(v){DropdownToggle=v},isRoleMenu(v){isRoleMenu=v}},11);let DropdownItem;module.link('./DropdownItem',{default(v){DropdownItem=v}},12);let SelectableContext;module.link('./SelectableContext',{default(v){SelectableContext=v}},13);let dataAttr;module.link('./DataKey',{dataAttr(v){dataAttr=v}},14);let useWindow;module.link('./useWindow',{default(v){useWindow=v}},15);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},16);

















function useRefWithUpdate() {
  const forceUpdate = useForceUpdate();
  const ref = useRef(null);
  const attachRef = useCallback(element => {
    ref.current = element; // ensure that a menu set triggers an update for consumers

    forceUpdate();
  }, [forceUpdate]);
  return [ref, attachRef];
}
/**
 * @displayName Dropdown
 * @public
 */


function Dropdown({
  defaultShow,
  show: rawShow,
  onSelect,
  onToggle: rawOnToggle,
  itemSelector = `* [${dataAttr('dropdown-item')}]`,
  focusFirstItemOnShow,
  placement = 'bottom-start',
  children
}) {
  const window = useWindow();
  const [show, onToggle] = useUncontrolledProp(rawShow, defaultShow, rawOnToggle); // We use normal refs instead of useCallbackRef in order to populate the
  // the value as quickly as possible, otherwise the effect to focus the element
  // may run before the state value is set

  const [menuRef, setMenu] = useRefWithUpdate();
  const menuElement = menuRef.current;
  const [toggleRef, setToggle] = useRefWithUpdate();
  const toggleElement = toggleRef.current;
  const lastShow = usePrevious(show);
  const lastSourceEvent = useRef(null);
  const focusInDropdown = useRef(false);
  const onSelectCtx = useContext(SelectableContext);
  const toggle = useCallback((nextShow, event, source = event == null ? void 0 : event.type) => {
    onToggle(nextShow, {
      originalEvent: event,
      source
    });
  }, [onToggle]);
  const handleSelect = useEventCallback((key, event) => {
    onSelect == null ? void 0 : onSelect(key, event);
    toggle(false, event, 'select');

    if (!event.isPropagationStopped()) {
      onSelectCtx == null ? void 0 : onSelectCtx(key, event);
    }
  });
  const context = useMemo(() => ({
    toggle,
    placement,
    show,
    menuElement,
    toggleElement,
    setMenu,
    setToggle
  }), [toggle, placement, show, menuElement, toggleElement, setMenu, setToggle]);

  if (menuElement && lastShow && !show) {
    focusInDropdown.current = menuElement.contains(menuElement.ownerDocument.activeElement);
  }

  const focusToggle = useEventCallback(() => {
    if (toggleElement && toggleElement.focus) {
      toggleElement.focus();
    }
  });
  const maybeFocusFirst = useEventCallback(() => {
    const type = lastSourceEvent.current;
    let focusType = focusFirstItemOnShow;

    if (focusType == null) {
      focusType = menuRef.current && isRoleMenu(menuRef.current) ? 'keyboard' : false;
    }

    if (focusType === false || focusType === 'keyboard' && !/^key.+$/.test(type)) {
      return;
    }

    const first = qsa(menuRef.current, itemSelector)[0];
    if (first && first.focus) first.focus();
  });
  useEffect(() => {
    if (show) maybeFocusFirst();else if (focusInDropdown.current) {
      focusInDropdown.current = false;
      focusToggle();
    } // only `show` should be changing
  }, [show, focusInDropdown, focusToggle, maybeFocusFirst]);
  useEffect(() => {
    lastSourceEvent.current = null;
  });

  const getNextFocusedChild = (current, offset) => {
    if (!menuRef.current) return null;
    const items = qsa(menuRef.current, itemSelector);
    let index = items.indexOf(current) + offset;
    index = Math.max(0, Math.min(index, items.length));
    return items[index];
  };

  useEventListener(useCallback(() => window.document, [window]), 'keydown', event => {
    var _menuRef$current, _toggleRef$current;

    const {
      key
    } = event;
    const target = event.target;
    const fromMenu = (_menuRef$current = menuRef.current) == null ? void 0 : _menuRef$current.contains(target);
    const fromToggle = (_toggleRef$current = toggleRef.current) == null ? void 0 : _toggleRef$current.contains(target); // Second only to https://github.com/twbs/bootstrap/blob/8cfbf6933b8a0146ac3fbc369f19e520bd1ebdac/js/src/dropdown.js#L400
    // in inscrutability

    const isInput = /input|textarea/i.test(target.tagName);

    if (isInput && (key === ' ' || key !== 'Escape' && fromMenu || key === 'Escape' && target.type === 'search')) {
      return;
    }

    if (!fromMenu && !fromToggle) {
      return;
    }

    if (key === 'Tab' && (!menuRef.current || !show)) {
      return;
    }

    lastSourceEvent.current = event.type;
    const meta = {
      originalEvent: event,
      source: event.type
    };

    switch (key) {
      case 'ArrowUp':
        {
          const next = getNextFocusedChild(target, -1);
          if (next && next.focus) next.focus();
          event.preventDefault();
          return;
        }

      case 'ArrowDown':
        event.preventDefault();

        if (!show) {
          onToggle(true, meta);
        } else {
          const next = getNextFocusedChild(target, 1);
          if (next && next.focus) next.focus();
        }

        return;

      case 'Tab':
        // on keydown the target is the element being tabbed FROM, we need that
        // to know if this event is relevant to this dropdown (e.g. in this menu).
        // On `keyup` the target is the element being tagged TO which we use to check
        // if focus has left the menu
        addEventListener(target.ownerDocument, 'keyup', e => {
          var _menuRef$current2;

          if (e.key === 'Tab' && !e.target || !((_menuRef$current2 = menuRef.current) != null && _menuRef$current2.contains(e.target))) {
            onToggle(false, meta);
          }
        }, {
          once: true
        });
        break;

      case 'Escape':
        if (key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
        }

        onToggle(false, meta);
        break;

      default:
    }
  });
  return /*#__PURE__*/_jsx(SelectableContext.Provider, {
    value: handleSelect,
    children: /*#__PURE__*/_jsx(DropdownContext.Provider, {
      value: context,
      children: children
    })
  });
}

Dropdown.displayName = 'Dropdown';
Dropdown.Menu = DropdownMenu;
Dropdown.Toggle = DropdownToggle;
Dropdown.Item = DropdownItem;
module.exportDefault(Dropdown);