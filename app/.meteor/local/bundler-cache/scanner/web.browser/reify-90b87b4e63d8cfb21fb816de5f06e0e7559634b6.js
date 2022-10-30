module.export({default:()=>getComputedStyle});let ownerWindow;module.link('./ownerWindow',{default(v){ownerWindow=v}},0);
/**
 * Returns one or all computed style properties of an element.
 * 
 * @param node the element
 * @param psuedoElement the style property
 */

function getComputedStyle(node, psuedoElement) {
  return ownerWindow(node).getComputedStyle(node, psuedoElement);
}