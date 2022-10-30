module.export({optionsSupported:()=>optionsSupported,onceSupported:()=>onceSupported});let canUseDOM;module.link('./canUseDOM',{default(v){canUseDOM=v}},0);/* eslint-disable no-return-assign */

var optionsSupported = false;
var onceSupported = false;

try {
  var options = {
    get passive() {
      return module.runSetters(optionsSupported = true,["optionsSupported"]);
    },

    get once() {
      // eslint-disable-next-line no-multi-assign
      return module.runSetters(onceSupported = module.runSetters(optionsSupported = true,["optionsSupported"]),["onceSupported"]);
    }

  };

  if (canUseDOM) {
    window.addEventListener('test', options, options);
    window.removeEventListener('test', options, true);
  }
} catch (e) {
  /* */
}

/**
 * An `addEventListener` ponyfill, supports the `once` option
 * 
 * @param node the element
 * @param eventName the event name
 * @param handle the handler
 * @param options event options
 */
function addEventListener(node, eventName, handler, options) {
  if (options && typeof options !== 'boolean' && !onceSupported) {
    var once = options.once,
        capture = options.capture;
    var wrappedHandler = handler;

    if (!onceSupported && once) {
      wrappedHandler = handler.__once || function onceHandler(event) {
        this.removeEventListener(eventName, onceHandler, capture);
        handler.call(this, event);
      };

      handler.__once = wrappedHandler;
    }

    node.addEventListener(eventName, wrappedHandler, optionsSupported ? options : capture);
  }

  node.addEventListener(eventName, handler, options);
}

module.exportDefault(addEventListener);