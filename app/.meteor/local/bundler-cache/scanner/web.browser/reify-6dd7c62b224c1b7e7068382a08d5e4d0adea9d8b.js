let contains;module.link('dom-helpers/contains',{default(v){contains=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let cloneElement,useCallback,useRef;module.link('react',{cloneElement(v){cloneElement=v},useCallback(v){useCallback=v},useRef(v){useRef=v}},2);let useTimeout;module.link('@restart/hooks/useTimeout',{default(v){useTimeout=v}},3);let warning;module.link('warning',{default(v){warning=v}},4);let useUncontrolledProp;module.link('uncontrollable',{useUncontrolledProp(v){useUncontrolledProp=v}},5);let useMergedRefs;module.link('@restart/hooks/useMergedRefs',{default(v){useMergedRefs=v}},6);let Overlay;module.link('./Overlay',{default(v){Overlay=v}},7);let safeFindDOMNode;module.link('./safeFindDOMNode',{default(v){safeFindDOMNode=v}},8);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},9);let _Fragment;module.link("react/jsx-runtime",{Fragment(v){_Fragment=v}},10);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},11);












function normalizeDelay(delay) {
  return delay && typeof delay === 'object' ? delay : {
    show: delay,
    hide: delay
  };
} // Simple implementation of mouseEnter and mouseLeave.
// React's built version is broken: https://github.com/facebook/react/issues/4251
// for cases when the trigger is disabled and mouseOut/Over can cause flicker
// moving from one child element to another.


function handleMouseOverOut( // eslint-disable-next-line @typescript-eslint/no-shadow
handler, args, relatedNative) {
  const [e] = args;
  const target = e.currentTarget;
  const related = e.relatedTarget || e.nativeEvent[relatedNative];

  if ((!related || related !== target) && !contains(target, related)) {
    handler(...args);
  }
}

const defaultProps = {
  defaultShow: false,
  trigger: ['hover', 'focus']
};

function OverlayTrigger({
  trigger,
  overlay,
  children,
  popperConfig = {},
  show: propsShow,
  defaultShow = false,
  onToggle,
  delay: propsDelay,
  placement,
  flip = placement && placement.indexOf('auto') !== -1,
  ...props
}) {
  const triggerNodeRef = useRef(null);
  const mergedRef = useMergedRefs(triggerNodeRef, children.ref);
  const timeout = useTimeout();
  const hoverStateRef = useRef('');
  const [show, setShow] = useUncontrolledProp(propsShow, defaultShow, onToggle);
  const delay = normalizeDelay(propsDelay);
  const {
    onFocus,
    onBlur,
    onClick
  } = typeof children !== 'function' ? React.Children.only(children).props : {};

  const attachRef = r => {
    mergedRef(safeFindDOMNode(r));
  };

  const handleShow = useCallback(() => {
    timeout.clear();
    hoverStateRef.current = 'show';

    if (!delay.show) {
      setShow(true);
      return;
    }

    timeout.set(() => {
      if (hoverStateRef.current === 'show') setShow(true);
    }, delay.show);
  }, [delay.show, setShow, timeout]);
  const handleHide = useCallback(() => {
    timeout.clear();
    hoverStateRef.current = 'hide';

    if (!delay.hide) {
      setShow(false);
      return;
    }

    timeout.set(() => {
      if (hoverStateRef.current === 'hide') setShow(false);
    }, delay.hide);
  }, [delay.hide, setShow, timeout]);
  const handleFocus = useCallback((...args) => {
    handleShow();
    onFocus == null ? void 0 : onFocus(...args);
  }, [handleShow, onFocus]);
  const handleBlur = useCallback((...args) => {
    handleHide();
    onBlur == null ? void 0 : onBlur(...args);
  }, [handleHide, onBlur]);
  const handleClick = useCallback((...args) => {
    setShow(!show);
    onClick == null ? void 0 : onClick(...args);
  }, [onClick, setShow, show]);
  const handleMouseOver = useCallback((...args) => {
    handleMouseOverOut(handleShow, args, 'fromElement');
  }, [handleShow]);
  const handleMouseOut = useCallback((...args) => {
    handleMouseOverOut(handleHide, args, 'toElement');
  }, [handleHide]);
  const triggers = trigger == null ? [] : [].concat(trigger);
  const triggerProps = {
    ref: attachRef
  };

  if (triggers.indexOf('click') !== -1) {
    triggerProps.onClick = handleClick;
  }

  if (triggers.indexOf('focus') !== -1) {
    triggerProps.onFocus = handleFocus;
    triggerProps.onBlur = handleBlur;
  }

  if (triggers.indexOf('hover') !== -1) {
    process.env.NODE_ENV !== "production" ? warning(triggers.length > 1, '[react-bootstrap] Specifying only the `"hover"` trigger limits the visibility of the overlay to just mouse users. Consider also including the `"focus"` trigger so that touch and keyboard only users can see the overlay as well.') : void 0;
    triggerProps.onMouseOver = handleMouseOver;
    triggerProps.onMouseOut = handleMouseOut;
  }

  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [typeof children === 'function' ? children(triggerProps) : /*#__PURE__*/cloneElement(children, triggerProps), /*#__PURE__*/_jsx(Overlay, { ...props,
      show: show,
      onHide: handleHide,
      flip: flip,
      placement: placement,
      popperConfig: popperConfig,
      target: triggerNodeRef.current,
      children: overlay
    })]
  });
}

OverlayTrigger.defaultProps = defaultProps;
module.exportDefault(OverlayTrigger);