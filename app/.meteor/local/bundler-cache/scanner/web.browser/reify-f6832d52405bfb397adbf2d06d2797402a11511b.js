let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useContext,useMemo;module.link('react',{useContext(v){useContext=v},useMemo(v){useMemo=v}},2);let Feedback;module.link('./Feedback',{default(v){Feedback=v}},3);let FormCheckInput;module.link('./FormCheckInput',{default(v){FormCheckInput=v}},4);let FormCheckLabel;module.link('./FormCheckLabel',{default(v){FormCheckLabel=v}},5);let FormContext;module.link('./FormContext',{default(v){FormContext=v}},6);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},7);let hasChildOfType;module.link('./ElementChildren',{hasChildOfType(v){hasChildOfType=v}},8);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},9);let _Fragment;module.link("react/jsx-runtime",{Fragment(v){_Fragment=v}},10);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},11);











const FormCheck = /*#__PURE__*/React.forwardRef(({
  id,
  bsPrefix,
  bsSwitchPrefix,
  inline = false,
  reverse = false,
  disabled = false,
  isValid = false,
  isInvalid = false,
  feedbackTooltip = false,
  feedback,
  feedbackType,
  className,
  style,
  title = '',
  type = 'checkbox',
  label,
  children,
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as = 'input',
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'form-check');
  bsSwitchPrefix = useBootstrapPrefix(bsSwitchPrefix, 'form-switch');
  const {
    controlId
  } = useContext(FormContext);
  const innerFormContext = useMemo(() => ({
    controlId: id || controlId
  }), [controlId, id]);
  const hasLabel = !children && label != null && label !== false || hasChildOfType(children, FormCheckLabel);

  const input = /*#__PURE__*/_jsx(FormCheckInput, { ...props,
    type: type === 'switch' ? 'checkbox' : type,
    ref: ref,
    isValid: isValid,
    isInvalid: isInvalid,
    disabled: disabled,
    as: as
  });

  return /*#__PURE__*/_jsx(FormContext.Provider, {
    value: innerFormContext,
    children: /*#__PURE__*/_jsx("div", {
      style: style,
      className: classNames(className, hasLabel && bsPrefix, inline && `${bsPrefix}-inline`, reverse && `${bsPrefix}-reverse`, type === 'switch' && bsSwitchPrefix),
      children: children || /*#__PURE__*/_jsxs(_Fragment, {
        children: [input, hasLabel && /*#__PURE__*/_jsx(FormCheckLabel, {
          title: title,
          children: label
        }), feedback && /*#__PURE__*/_jsx(Feedback, {
          type: feedbackType,
          tooltip: feedbackTooltip,
          children: feedback
        })]
      })
    })
  });
});
FormCheck.displayName = 'FormCheck';
module.exportDefault(Object.assign(FormCheck, {
  Input: FormCheckInput,
  Label: FormCheckLabel
}));