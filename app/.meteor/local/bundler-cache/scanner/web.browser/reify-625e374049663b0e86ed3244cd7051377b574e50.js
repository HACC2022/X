let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useMemo;module.link('react',{useMemo(v){useMemo=v}},2);let createWithBsPrefix;module.link('./createWithBsPrefix',{default(v){createWithBsPrefix=v}},3);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},4);let FormCheckInput;module.link('./FormCheckInput',{default(v){FormCheckInput=v}},5);let InputGroupContext;module.link('./InputGroupContext',{default(v){InputGroupContext=v}},6);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},7);







const InputGroupText = createWithBsPrefix('input-group-text', {
  Component: 'span'
});

const InputGroupCheckbox = props => /*#__PURE__*/_jsx(InputGroupText, {
  children: /*#__PURE__*/_jsx(FormCheckInput, {
    type: "checkbox",
    ...props
  })
});

const InputGroupRadio = props => /*#__PURE__*/_jsx(InputGroupText, {
  children: /*#__PURE__*/_jsx(FormCheckInput, {
    type: "radio",
    ...props
  })
});

/**
 *
 * @property {InputGroupText} Text
 * @property {InputGroupRadio} Radio
 * @property {InputGroupCheckbox} Checkbox
 */
const InputGroup = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  size,
  hasValidation,
  className,
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'div',
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'input-group'); // Intentionally an empty object. Used in detecting if a dropdown
  // exists under an input group.

  const contextValue = useMemo(() => ({}), []);
  return /*#__PURE__*/_jsx(InputGroupContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(Component, {
      ref: ref,
      ...props,
      className: classNames(className, bsPrefix, size && `${bsPrefix}-${size}`, hasValidation && 'has-validation')
    })
  });
});
InputGroup.displayName = 'InputGroup';
module.exportDefault(Object.assign(InputGroup, {
  Text: InputGroupText,
  Radio: InputGroupRadio,
  Checkbox: InputGroupCheckbox
}));