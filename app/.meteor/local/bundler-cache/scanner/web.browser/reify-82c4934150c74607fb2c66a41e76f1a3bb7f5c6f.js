let SimpleSchema;module.link('simpl-schema',{default(v){SimpleSchema=v}},0);let filterDOMProps;module.link('uniforms',{filterDOMProps(v){filterDOMProps=v}},1);

// Register custom property.
SimpleSchema.extendOptions(['uniforms']);
filterDOMProps.register('autoValue', 'blackbox', 'custom', 'decimal', 'defaultValue', 'exclusiveMax', 'exclusiveMin', 'max', 'maxCount', 'min', 'minCount', 'optional', 'regEx', 'trim', 'type');
