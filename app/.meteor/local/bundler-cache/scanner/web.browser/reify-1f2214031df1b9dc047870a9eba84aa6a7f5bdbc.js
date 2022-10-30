let React;module.link('react',{"*"(v){React=v}},0);let ReactDOM;module.link('react-dom',{default(v){ReactDOM=v}},1);let useCallbackRef;module.link('@restart/hooks/useCallbackRef',{default(v){useCallbackRef=v}},2);let useMergedRefs;module.link('@restart/hooks/useMergedRefs',{default(v){useMergedRefs=v}},3);let useState;module.link('react',{useState(v){useState=v}},4);let usePopper;module.link('./usePopper',{default(v){usePopper=v}},5);let useRootClose;module.link('./useRootClose',{default(v){useRootClose=v}},6);let useWaitForDOMRef;module.link('./useWaitForDOMRef',{default(v){useWaitForDOMRef=v}},7);let mergeOptionsWithPopperConfig;module.link('./mergeOptionsWithPopperConfig',{default(v){mergeOptionsWithPopperConfig=v}},8);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},9);










/**
 * Built on top of `Popper.js`, the overlay component is
 * great for custom tooltip overlays.
 */
const Overlay = /*#__PURE__*/React.forwardRef((props, outerRef) => {
  const {
    flip,
    offset,
    placement,
    containerPadding,
    popperConfig = {},
    transition: Transition
  } = props;
  const [rootElement, attachRef] = useCallbackRef();
  const [arrowElement, attachArrowRef] = useCallbackRef();
  const mergedRef = useMergedRefs(attachRef, outerRef);
  const container = useWaitForDOMRef(props.container);
  const target = useWaitForDOMRef(props.target);
  const [exited, setExited] = useState(!props.show);
  const popper = usePopper(target, rootElement, mergeOptionsWithPopperConfig({
    placement,
    enableEvents: !!props.show,
    containerPadding: containerPadding || 5,
    flip,
    offset,
    arrowElement,
    popperConfig
  }));

  if (props.show) {
    if (exited) setExited(false);
  } else if (!props.transition && !exited) {
    setExited(true);
  }

  const handleHidden = (...args) => {
    setExited(true);

    if (props.onExited) {
      props.onExited(...args);
    }
  }; // Don't un-render the overlay while it's transitioning out.


  const mountOverlay = props.show || Transition && !exited;
  useRootClose(rootElement, props.onHide, {
    disabled: !props.rootClose || props.rootCloseDisabled,
    clickTrigger: props.rootCloseEvent
  });

  if (!mountOverlay) {
    // Don't bother showing anything if we don't have to.
    return null;
  }

  let child = props.children(Object.assign({}, popper.attributes.popper, {
    style: popper.styles.popper,
    ref: mergedRef
  }), {
    popper,
    placement,
    show: !!props.show,
    arrowProps: Object.assign({}, popper.attributes.arrow, {
      style: popper.styles.arrow,
      ref: attachArrowRef
    })
  });

  if (Transition) {
    const {
      onExit,
      onExiting,
      onEnter,
      onEntering,
      onEntered
    } = props;
    child = /*#__PURE__*/_jsx(Transition, {
      in: props.show,
      appear: true,
      onExit: onExit,
      onExiting: onExiting,
      onExited: handleHidden,
      onEnter: onEnter,
      onEntering: onEntering,
      onEntered: onEntered,
      children: child
    });
  }

  return container ? /*#__PURE__*/ReactDOM.createPortal(child, container) : null;
});
Overlay.displayName = 'Overlay';
module.exportDefault(Overlay);