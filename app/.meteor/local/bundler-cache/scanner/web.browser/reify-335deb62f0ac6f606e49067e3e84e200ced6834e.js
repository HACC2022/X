module.export({placements:()=>placements});module.export({createPopper:()=>createPopper},true);let arrow;module.link('@popperjs/core/lib/modifiers/arrow',{default(v){arrow=v}},0);let computeStyles;module.link('@popperjs/core/lib/modifiers/computeStyles',{default(v){computeStyles=v}},1);let eventListeners;module.link('@popperjs/core/lib/modifiers/eventListeners',{default(v){eventListeners=v}},2);let flip;module.link('@popperjs/core/lib/modifiers/flip',{default(v){flip=v}},3);let hide;module.link('@popperjs/core/lib/modifiers/hide',{default(v){hide=v}},4);let offset;module.link('@popperjs/core/lib/modifiers/offset',{default(v){offset=v}},5);let popperOffsets;module.link('@popperjs/core/lib/modifiers/popperOffsets',{default(v){popperOffsets=v}},6);let preventOverflow;module.link('@popperjs/core/lib/modifiers/preventOverflow',{default(v){preventOverflow=v}},7);let placements;module.link('@popperjs/core/lib/enums',{placements(v){placements=v}},8);let popperGenerator;module.link('@popperjs/core/lib/popper-base',{popperGenerator(v){popperGenerator=v}},9);








 // For the common JS build we will turn this file into a bundle with no imports.
// This is b/c the Popper lib is all esm files, and would break in a common js only environment

const createPopper = popperGenerator({
  defaultModifiers: [hide, popperOffsets, computeStyles, eventListeners, offset, flip, preventOverflow, arrow]
});
