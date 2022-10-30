let classnames;module.link('classnames',{default(v){classnames=v}},0);let React;module.link('react',{default(v){React=v}},1);let connectField;module.link('uniforms',{connectField(v){connectField=v}},2);let wrapField;module.link('./wrapField',{default(v){wrapField=v}},3);



const base64 = typeof btoa === 'undefined'
    ? /* istanbul ignore next */ /* istanbul ignore next */ x => Buffer.from(x).toString('base64')
    : btoa;
const escape = (x) => base64(encodeURIComponent(x)).replace(/=+$/, '');
function Radio(props) {
    var _a;
    return wrapField(props, (_a = props.allowedValues) === null || _a === void 0 ? void 0 : _a.map(item => (React.createElement("div", { key: item, className: classnames(props.inputClassName, 'form-check', {
            'text-danger': props.error,
            'text-success': !props.error && props.changed,
            'form-check-inline': props.inline,
        }) },
        React.createElement("label", { htmlFor: `${props.id}-${escape(item)}`, className: "form-check-label" },
            React.createElement("input", { checked: item === props.value, className: "form-check-input", disabled: props.disabled, id: `${props.id}-${escape(item)}`, name: props.name, onChange: () => {
                    if (!props.readOnly) {
                        props.onChange(item);
                    }
                }, type: "radio" }),
            ' ',
            props.transform ? props.transform(item) : item)))));
}
module.exportDefault(connectField(Radio, { kind: 'leaf' }));
