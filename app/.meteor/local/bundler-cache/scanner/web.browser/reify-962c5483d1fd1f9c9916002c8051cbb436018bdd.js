module.export({dataAttr:()=>dataAttr,dataProp:()=>dataProp});module.export({ATTRIBUTE_PREFIX:()=>ATTRIBUTE_PREFIX,PROPERTY_PREFIX:()=>PROPERTY_PREFIX},true);const ATTRIBUTE_PREFIX = `data-rr-ui-`;
const PROPERTY_PREFIX = `rrUi`;
function dataAttr(property) {
  return `${ATTRIBUTE_PREFIX}${property}`;
}
function dataProp(property) {
  return `${PROPERTY_PREFIX}${property}`;
}