let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let FormGroup;module.link('./FormGroup',{default(v){FormGroup=v}},2);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},5);





const FloatingLabel = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  children,
  controlId,
  label,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'form-floating');
  return /*#__PURE__*/_jsxs(FormGroup, {
    ref: ref,
    className: classNames(className, bsPrefix),
    controlId: controlId,
    ...props,
    children: [children, /*#__PURE__*/_jsx("label", {
      htmlFor: controlId,
      children: label
    })]
  });
});
FloatingLabel.displayName = 'FloatingLabel';
module.exportDefault(FloatingLabel);