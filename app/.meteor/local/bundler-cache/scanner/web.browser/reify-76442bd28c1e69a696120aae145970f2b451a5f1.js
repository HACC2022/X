let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},2);let AbstractModalHeader;module.link('./AbstractModalHeader',{default(v){AbstractModalHeader=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);




const defaultProps = {
  closeLabel: 'Close',
  closeButton: false
};
const ModalHeader = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'modal-header');
  return /*#__PURE__*/_jsx(AbstractModalHeader, {
    ref: ref,
    ...props,
    className: classNames(className, bsPrefix)
  });
});
ModalHeader.displayName = 'ModalHeader';
ModalHeader.defaultProps = defaultProps;
module.exportDefault(ModalHeader);