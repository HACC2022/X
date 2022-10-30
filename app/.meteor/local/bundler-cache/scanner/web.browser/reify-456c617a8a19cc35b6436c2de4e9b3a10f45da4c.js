let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let React;module.link('react',{default(v){React=v}},2);let connectField;module.link('uniforms',{connectField(v){connectField=v}},3);let wrapField;module.link('./wrapField',{default(v){wrapField=v}},4);




function Bool(_a) {
    var { onChange } = _a, props = __rest(_a, ["onChange"]);
    const { disabled, error, inline, inputClassName, inputRef, label, labelBefore, name, readOnly, value, } = props;
    return wrapField(Object.assign(Object.assign({}, props), { label: labelBefore, value: props.value }), React.createElement("div", { className: classnames(inputClassName, 'form-check', {
            'text-danger': error,
            'text-success': !error && props.changed,
            'form-check-inline': inline,
        }) },
        React.createElement("input", { checked: value || false, className: "form-check-input", disabled: disabled, id: props.id, name: name, onChange: () => {
                if (!readOnly) {
                    onChange(!value);
                }
            }, ref: inputRef, type: "checkbox" }),
        React.createElement("label", { htmlFor: props.id, className: "form-check-label" }, label)));
}
module.exportDefault(connectField(Bool, { kind: 'leaf' }));
