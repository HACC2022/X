module.export({default:()=>ownerWindow});let ownerDocument;module.link('./ownerDocument',{default(v){ownerDocument=v}},0);
/**
 * Returns the owner window of a given element.
 * 
 * @param node the element
 */

function ownerWindow(node) {
  var doc = ownerDocument(node);
  return doc && doc.defaultView || window;
}