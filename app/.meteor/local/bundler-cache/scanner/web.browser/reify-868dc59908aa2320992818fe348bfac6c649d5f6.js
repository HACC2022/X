let React;module.link('react',{"*"(v){React=v}},0);let useEffect,useMemo,useRef,useCallback;module.link('react',{useEffect(v){useEffect=v},useMemo(v){useMemo=v},useRef(v){useRef=v},useCallback(v){useCallback=v}},1);let classNames;module.link('classnames',{default(v){classNames=v}},2);let useTimeout;module.link('@restart/hooks/useTimeout',{default(v){useTimeout=v}},3);let ToastFade;module.link('./ToastFade',{default(v){ToastFade=v}},4);let ToastHeader;module.link('./ToastHeader',{default(v){ToastHeader=v}},5);let ToastBody;module.link('./ToastBody',{default(v){ToastBody=v}},6);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},7);let ToastContext;module.link('./ToastContext',{default(v){ToastContext=v}},8);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},9);









const Toast = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  transition: Transition = ToastFade,
  show = true,
  animation = true,
  delay = 5000,
  autohide = false,
  onClose,
  bg,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'toast'); // We use refs for these, because we don't want to restart the autohide
  // timer in case these values change.

  const delayRef = useRef(delay);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    delayRef.current = delay;
    onCloseRef.current = onClose;
  }, [delay, onClose]);
  const autohideTimeout = useTimeout();
  const autohideToast = !!(autohide && show);
  const autohideFunc = useCallback(() => {
    if (autohideToast) {
      onCloseRef.current == null ? void 0 : onCloseRef.current();
    }
  }, [autohideToast]);
  useEffect(() => {
    // Only reset timer if show or autohide changes.
    autohideTimeout.set(autohideFunc, delayRef.current);
  }, [autohideTimeout, autohideFunc]);
  const toastContext = useMemo(() => ({
    onClose
  }), [onClose]);
  const hasAnimation = !!(Transition && animation);

  const toast = /*#__PURE__*/_jsx("div", { ...props,
    ref: ref,
    className: classNames(bsPrefix, className, bg && `bg-${bg}`, !hasAnimation && (show ? 'show' : 'hide')),
    role: "alert",
    "aria-live": "assertive",
    "aria-atomic": "true"
  });

  return /*#__PURE__*/_jsx(ToastContext.Provider, {
    value: toastContext,
    children: hasAnimation && Transition ? /*#__PURE__*/_jsx(Transition, {
      in: show,
      unmountOnExit: true,
      children: toast
    }) : toast
  });
});
Toast.displayName = 'Toast';
module.exportDefault(Object.assign(Toast, {
  Body: ToastBody,
  Header: ToastHeader
}));