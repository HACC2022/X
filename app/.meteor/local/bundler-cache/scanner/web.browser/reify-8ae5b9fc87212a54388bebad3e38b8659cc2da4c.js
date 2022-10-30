let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useContext;module.link('react',{useContext(v){useContext=v}},2);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},3);let AccordionCollapse;module.link('./AccordionCollapse',{default(v){AccordionCollapse=v}},4);let AccordionItemContext;module.link('./AccordionItemContext',{default(v){AccordionItemContext=v}},5);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},6);






const AccordionBody = /*#__PURE__*/React.forwardRef(({
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'div',
  bsPrefix,
  className,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'accordion-body');
  const {
    eventKey
  } = useContext(AccordionItemContext);
  return /*#__PURE__*/_jsx(AccordionCollapse, {
    eventKey: eventKey,
    children: /*#__PURE__*/_jsx(Component, {
      ref: ref,
      ...props,
      className: classNames(className, bsPrefix)
    })
  });
});
AccordionBody.displayName = 'AccordionBody';
module.exportDefault(AccordionBody);