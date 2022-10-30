let classnames;module.link('classnames',{default(v){classnames=v}},0);let React;module.link('react',{default(v){React=v}},1);let connectField;module.link('uniforms',{connectField(v){connectField=v}},2);let wrapField;module.link('./wrapField',{default(v){wrapField=v}},3);



function LongText(props) {
    var _a;
    return wrapField(props, React.createElement("textarea", { className: classnames(props.inputClassName, 'form-control', {
            'is-invalid': props.error,
            'is-valid': !props.error && props.changed,
        }), disabled: props.disabled, id: props.id, name: props.name, onChange: event => props.onChange(event.target.value), placeholder: props.placeholder, readOnly: props.readOnly, ref: props.inputRef, rows: props.rows, value: (_a = props.value) !== null && _a !== void 0 ? _a : '' }));
}
module.exportDefault(connectField(LongText, { kind: 'leaf' }));
