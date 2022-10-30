let React;module.link('react',{"*"(v){React=v}},0);let useMemo;module.link('react',{useMemo(v){useMemo=v}},1);let FormContext;module.link('./FormContext',{default(v){FormContext=v}},2);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},3);



const FormGroup = /*#__PURE__*/React.forwardRef(({
  controlId,
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'div',
  ...props
}, ref) => {
  const context = useMemo(() => ({
    controlId
  }), [controlId]);
  return /*#__PURE__*/_jsx(FormContext.Provider, {
    value: context,
    children: /*#__PURE__*/_jsx(Component, { ...props,
      ref: ref
    })
  });
});
FormGroup.displayName = 'FormGroup';
module.exportDefault(FormGroup);