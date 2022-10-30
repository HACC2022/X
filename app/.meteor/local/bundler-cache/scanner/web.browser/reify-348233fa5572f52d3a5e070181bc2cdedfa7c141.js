let addEventListener;module.link('./addEventListener',{default(v){addEventListener=v}},0);let removeEventListener;module.link('./removeEventListener',{default(v){removeEventListener=v}},1);


function listen(node, eventName, handler, options) {
  addEventListener(node, eventName, handler, options);
  return function () {
    removeEventListener(node, eventName, handler, options);
  };
}

module.exportDefault(listen);