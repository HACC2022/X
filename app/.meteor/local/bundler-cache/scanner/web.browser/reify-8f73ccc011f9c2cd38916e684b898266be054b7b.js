let classnames;module.link('classnames',{default(v){classnames=v}},0);let omit;module.link('lodash/omit',{default(v){omit=v}},1);let React;module.link('react',{default(v){React=v}},2);let connectField;module.link('uniforms',{connectField(v){connectField=v}},3);let wrapField;module.link('./wrapField',{default(v){wrapField=v}},4);




function Text(props) {
    var _a, _b;
    return wrapField(omit(props, ['autoComplete']), React.createElement("input", { autoComplete: props.autoComplete, className: classnames(props.inputClassName, 'form-control', {
            'is-invalid': props.error,
            'is-valid': !props.error && props.changed,
        }), disabled: props.disabled, id: props.id, name: props.name, onChange: event => props.onChange(event.target.value), placeholder: props.placeholder, readOnly: props.readOnly, ref: props.inputRef, type: (_a = props.type) !== null && _a !== void 0 ? _a : 'text', value: (_b = props.value) !== null && _b !== void 0 ? _b : '' }));
}
module.exportDefault(connectField(Text, { kind: 'leaf' }));
