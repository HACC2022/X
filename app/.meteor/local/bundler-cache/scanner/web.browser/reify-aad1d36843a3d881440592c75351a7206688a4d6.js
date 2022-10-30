let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useMemo;module.link('react',{useMemo(v){useMemo=v}},2);let useUncontrolled;module.link('uncontrollable',{useUncontrolled(v){useUncontrolled=v}},3);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},4);let AccordionBody;module.link('./AccordionBody',{default(v){AccordionBody=v}},5);let AccordionButton;module.link('./AccordionButton',{default(v){AccordionButton=v}},6);let AccordionCollapse;module.link('./AccordionCollapse',{default(v){AccordionCollapse=v}},7);let AccordionContext;module.link('./AccordionContext',{default(v){AccordionContext=v}},8);let AccordionHeader;module.link('./AccordionHeader',{default(v){AccordionHeader=v}},9);let AccordionItem;module.link('./AccordionItem',{default(v){AccordionItem=v}},10);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},11);











const Accordion = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
    as: Component = 'div',
    activeKey,
    bsPrefix,
    className,
    onSelect,
    flush,
    alwaysOpen,
    ...controlledProps
  } = useUncontrolled(props, {
    activeKey: 'onSelect'
  });
  const prefix = useBootstrapPrefix(bsPrefix, 'accordion');
  const contextValue = useMemo(() => ({
    activeEventKey: activeKey,
    onSelect,
    alwaysOpen
  }), [activeKey, onSelect, alwaysOpen]);
  return /*#__PURE__*/_jsx(AccordionContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(Component, {
      ref: ref,
      ...controlledProps,
      className: classNames(className, prefix, flush && `${prefix}-flush`)
    })
  });
});
Accordion.displayName = 'Accordion';
module.exportDefault(Object.assign(Accordion, {
  Button: AccordionButton,
  Collapse: AccordionCollapse,
  Item: AccordionItem,
  Header: AccordionHeader,
  Body: AccordionBody
}));