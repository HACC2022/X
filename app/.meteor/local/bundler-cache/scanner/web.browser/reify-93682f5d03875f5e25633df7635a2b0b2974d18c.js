let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useMemo;module.link('react',{useMemo(v){useMemo=v}},2);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},3);let AccordionItemContext;module.link('./AccordionItemContext',{default(v){AccordionItemContext=v}},4);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},5);





const AccordionItem = /*#__PURE__*/React.forwardRef(({
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'div',
  bsPrefix,
  className,
  eventKey,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'accordion-item');
  const contextValue = useMemo(() => ({
    eventKey
  }), [eventKey]);
  return /*#__PURE__*/_jsx(AccordionItemContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(Component, {
      ref: ref,
      ...props,
      className: classNames(className, bsPrefix)
    })
  });
});
AccordionItem.displayName = 'AccordionItem';
module.exportDefault(AccordionItem);