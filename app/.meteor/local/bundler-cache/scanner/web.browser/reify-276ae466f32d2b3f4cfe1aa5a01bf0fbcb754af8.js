module.export({makeEventKey:()=>makeEventKey},true);let React;module.link('react',{"*"(v){React=v}},0);
const SelectableContext = /*#__PURE__*/React.createContext(null);
const makeEventKey = (eventKey, href = null) => {
  if (eventKey != null) return String(eventKey);
  return href || null;
};
module.exportDefault(SelectableContext);