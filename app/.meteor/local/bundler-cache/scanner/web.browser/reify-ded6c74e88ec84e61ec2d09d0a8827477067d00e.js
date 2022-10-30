let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},2);let Button;module.link('./Button',{default(v){Button=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);let _Fragment;module.link("react/jsx-runtime",{Fragment(v){_Fragment=v}},5);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},6);







const noop = () => undefined;

const ToggleButton = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  name,
  className,
  checked,
  type,
  onChange,
  value,
  disabled,
  id,
  inputRef,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'btn-check');
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("input", {
      className: bsPrefix,
      name: name,
      type: type,
      value: value,
      ref: inputRef,
      autoComplete: "off",
      checked: !!checked,
      disabled: !!disabled,
      onChange: onChange || noop,
      id: id
    }), /*#__PURE__*/_jsx(Button, { ...props,
      ref: ref,
      className: classNames(className, disabled && 'disabled'),
      type: undefined,
      role: undefined,
      as: "label",
      htmlFor: id
    })]
  });
});
ToggleButton.displayName = 'ToggleButton';
module.exportDefault(ToggleButton);