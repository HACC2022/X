let React;module.link('react',{"*"(v){React=v}},0);let useContext;module.link('react',{useContext(v){useContext=v}},1);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},2);let CloseButton;module.link('./CloseButton',{default(v){CloseButton=v}},3);let ModalContext;module.link('./ModalContext',{default(v){ModalContext=v}},4);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},5);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},6);






const defaultProps = {
  closeLabel: 'Close',
  closeButton: false
};
const AbstractModalHeader = /*#__PURE__*/React.forwardRef(({
  closeLabel,
  closeVariant,
  closeButton,
  onHide,
  children,
  ...props
}, ref) => {
  const context = useContext(ModalContext);
  const handleClick = useEventCallback(() => {
    context == null ? void 0 : context.onHide();
    onHide == null ? void 0 : onHide();
  });
  return /*#__PURE__*/_jsxs("div", {
    ref: ref,
    ...props,
    children: [children, closeButton && /*#__PURE__*/_jsx(CloseButton, {
      "aria-label": closeLabel,
      variant: closeVariant,
      onClick: handleClick
    })]
  });
});
AbstractModalHeader.defaultProps = defaultProps;
module.exportDefault(AbstractModalHeader);