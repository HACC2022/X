let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useContext;module.link('react',{useContext(v){useContext=v}},2);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},3);let FormContext;module.link('./FormContext',{default(v){FormContext=v}},4);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},5);





const FormRange = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  id,
  ...props
}, ref) => {
  const {
    controlId
  } = useContext(FormContext);
  bsPrefix = useBootstrapPrefix(bsPrefix, 'form-range');
  return /*#__PURE__*/_jsx("input", { ...props,
    type: "range",
    ref: ref,
    className: classNames(className, bsPrefix),
    id: id || controlId
  });
});
FormRange.displayName = 'FormRange';
module.exportDefault(FormRange);