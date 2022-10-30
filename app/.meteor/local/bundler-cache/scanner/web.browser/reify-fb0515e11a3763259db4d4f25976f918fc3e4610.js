module.export({isAccordionItemSelected:()=>isAccordionItemSelected});let React;module.link('react',{"*"(v){React=v}},0);
function isAccordionItemSelected(activeEventKey, eventKey) {
  return Array.isArray(activeEventKey) ? activeEventKey.includes(eventKey) : activeEventKey === eventKey;
}
const context = /*#__PURE__*/React.createContext({});
context.displayName = 'AccordionContext';
module.exportDefault(context);