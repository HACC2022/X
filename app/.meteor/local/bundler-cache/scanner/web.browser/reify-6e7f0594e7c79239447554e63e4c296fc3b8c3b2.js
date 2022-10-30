module.export({useAccordionButton:()=>useAccordionButton});let React;module.link('react',{"*"(v){React=v}},0);let useContext;module.link('react',{useContext(v){useContext=v}},1);let classNames;module.link('classnames',{default(v){classNames=v}},2);let AccordionContext,isAccordionItemSelected;module.link('./AccordionContext',{default(v){AccordionContext=v},isAccordionItemSelected(v){isAccordionItemSelected=v}},3);let AccordionItemContext;module.link('./AccordionItemContext',{default(v){AccordionItemContext=v}},4);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},5);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},6);






function useAccordionButton(eventKey, onClick) {
  const {
    activeEventKey,
    onSelect,
    alwaysOpen
  } = useContext(AccordionContext);
  return e => {
    /*
      Compare the event key in context with the given event key.
      If they are the same, then collapse the component.
    */
    let eventKeyPassed = eventKey === activeEventKey ? null : eventKey;

    if (alwaysOpen) {
      if (Array.isArray(activeEventKey)) {
        if (activeEventKey.includes(eventKey)) {
          eventKeyPassed = activeEventKey.filter(k => k !== eventKey);
        } else {
          eventKeyPassed = [...activeEventKey, eventKey];
        }
      } else {
        // activeEventKey is undefined.
        eventKeyPassed = [eventKey];
      }
    }

    onSelect == null ? void 0 : onSelect(eventKeyPassed, e);
    onClick == null ? void 0 : onClick(e);
  };
}
const AccordionButton = /*#__PURE__*/React.forwardRef(({
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'button',
  bsPrefix,
  className,
  onClick,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'accordion-button');
  const {
    eventKey
  } = useContext(AccordionItemContext);
  const accordionOnClick = useAccordionButton(eventKey, onClick);
  const {
    activeEventKey
  } = useContext(AccordionContext);

  if (Component === 'button') {
    props.type = 'button';
  }

  return /*#__PURE__*/_jsx(Component, {
    ref: ref,
    onClick: accordionOnClick,
    ...props,
    "aria-expanded": eventKey === activeEventKey,
    className: classNames(className, bsPrefix, !isAccordionItemSelected(activeEventKey, eventKey) && 'collapsed')
  });
});
AccordionButton.displayName = 'AccordionButton';
module.exportDefault(AccordionButton);