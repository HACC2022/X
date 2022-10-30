let getComputedStyle;module.link('./getComputedStyle',{default(v){getComputedStyle=v}},0);let hyphenate;module.link('./hyphenateStyle',{default(v){hyphenate=v}},1);let isTransform;module.link('./isTransform',{default(v){isTransform=v}},2);



function style(node, property) {
  var css = '';
  var transforms = '';

  if (typeof property === 'string') {
    return node.style.getPropertyValue(hyphenate(property)) || getComputedStyle(node).getPropertyValue(hyphenate(property));
  }

  Object.keys(property).forEach(function (key) {
    var value = property[key];

    if (!value && value !== 0) {
      node.style.removeProperty(hyphenate(key));
    } else if (isTransform(key)) {
      transforms += key + "(" + value + ") ";
    } else {
      css += hyphenate(key) + ": " + value + ";";
    }
  });

  if (transforms) {
    css += "transform: " + transforms + ";";
  }

  node.style.cssText += ";" + css;
}

module.exportDefault(style);