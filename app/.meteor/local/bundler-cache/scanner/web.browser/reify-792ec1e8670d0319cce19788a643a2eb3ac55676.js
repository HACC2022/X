let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useContext;module.link('react',{useContext(v){useContext=v}},2);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},3);let Collapse;module.link('./Collapse',{default(v){Collapse=v}},4);let AccordionContext,isAccordionItemSelected;module.link('./AccordionContext',{default(v){AccordionContext=v},isAccordionItemSelected(v){isAccordionItemSelected=v}},5);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},6);







/**
 * This component accepts all of [`Collapse`'s props](/utilities/transitions/#collapse-props).
 */
const AccordionCollapse = /*#__PURE__*/React.forwardRef(({
  as: Component = 'div',
  bsPrefix,
  className,
  children,
  eventKey,
  ...props
}, ref) => {
  const {
    activeEventKey
  } = useContext(AccordionContext);
  bsPrefix = useBootstrapPrefix(bsPrefix, 'accordion-collapse');
  return /*#__PURE__*/_jsx(Collapse, {
    ref: ref,
    in: isAccordionItemSelected(activeEventKey, eventKey),
    ...props,
    className: classNames(className, bsPrefix),
    children: /*#__PURE__*/_jsx(Component, {
      children: React.Children.only(children)
    })
  });
});
AccordionCollapse.displayName = 'AccordionCollapse';
module.exportDefault(AccordionCollapse);