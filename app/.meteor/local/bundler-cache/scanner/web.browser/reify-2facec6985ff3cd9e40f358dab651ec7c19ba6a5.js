let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useContext;module.link('react',{useContext(v){useContext=v}},2);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},3);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},4);let CloseButton;module.link('./CloseButton',{default(v){CloseButton=v}},5);let ToastContext;module.link('./ToastContext',{default(v){ToastContext=v}},6);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},7);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},8);








const defaultProps = {
  closeLabel: 'Close',
  closeButton: true
};
const ToastHeader = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  closeLabel,
  closeVariant,
  closeButton,
  className,
  children,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'toast-header');
  const context = useContext(ToastContext);
  const handleClick = useEventCallback(e => {
    context == null ? void 0 : context.onClose == null ? void 0 : context.onClose(e);
  });
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    ...props,
    className: classNames(bsPrefix, className),
    children: [children, closeButton && /*#__PURE__*/_jsx(CloseButton, {
      "aria-label": closeLabel,
      variant: closeVariant,
      onClick: handleClick,
      "data-dismiss": "toast"
    })]
  });
});
ToastHeader.displayName = 'ToastHeader';
ToastHeader.defaultProps = defaultProps;
module.exportDefault(ToastHeader);