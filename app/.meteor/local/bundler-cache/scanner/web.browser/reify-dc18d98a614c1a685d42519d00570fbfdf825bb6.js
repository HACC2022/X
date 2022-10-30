module.export({default:()=>safeFindDOMNode});let ReactDOM;module.link('react-dom',{default(v){ReactDOM=v}},0);
function safeFindDOMNode(componentOrElement) {
  if (componentOrElement && 'setState' in componentOrElement) {
    return ReactDOM.findDOMNode(componentOrElement);
  }

  return componentOrElement != null ? componentOrElement : null;
}