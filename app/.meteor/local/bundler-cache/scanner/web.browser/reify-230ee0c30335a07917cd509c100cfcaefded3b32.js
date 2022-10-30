let invariant;module.link('invariant',{default(v){invariant=v}},0);let createAutoField;module.link('uniforms',{createAutoField(v){createAutoField=v}},1);let BoolField;module.link('./BoolField',{default(v){BoolField=v}},2);let DateField;module.link('./DateField',{default(v){DateField=v}},3);let ListField;module.link('./ListField',{default(v){ListField=v}},4);let NestField;module.link('./NestField',{default(v){NestField=v}},5);let NumField;module.link('./NumField',{default(v){NumField=v}},6);let RadioField;module.link('./RadioField',{default(v){RadioField=v}},7);let SelectField;module.link('./SelectField',{default(v){SelectField=v}},8);let TextField;module.link('./TextField',{default(v){TextField=v}},9);









const AutoField = createAutoField(props => {
    if (props.allowedValues) {
        return props.checkboxes && props.fieldType !== Array
            ? RadioField
            : SelectField;
    }
    switch (props.fieldType) {
        case Array:
            return ListField;
        case Boolean:
            return BoolField;
        case Date:
            return DateField;
        case Number:
            return NumField;
        case Object:
            return NestField;
        case String:
            return TextField;
    }
    return invariant(false, 'Unsupported field type: %s', props.fieldType);
});
module.exportDefault(AutoField);
