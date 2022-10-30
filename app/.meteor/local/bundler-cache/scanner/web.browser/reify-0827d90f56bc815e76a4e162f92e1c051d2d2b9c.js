let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let xor;module.link('lodash/xor',{default(v){xor=v}},2);let React;module.link('react',{default(v){React=v}},3);let connectField;module.link('uniforms',{connectField(v){connectField=v}},4);let wrapField;module.link('./wrapField',{default(v){wrapField=v}},5);





const base64 = typeof btoa === 'undefined'
    ? /* istanbul ignore next */ /* istanbul ignore next */ x => Buffer.from(x).toString('base64')
    : btoa;
const escape = (x) => base64(encodeURIComponent(x)).replace(/=+$/, '');
function Select(_a) {
    var { allowedValues, checkboxes, disableItem, disabled, error, fieldType, id, inline, inputClassName, inputRef, label, name, onChange, placeholder, readOnly, required, transform, value } = _a, props = __rest(_a, ["allowedValues", "checkboxes", "disableItem", "disabled", "error", "fieldType", "id", "inline", "inputClassName", "inputRef", "label", "name", "onChange", "placeholder", "readOnly", "required", "transform", "value"]);
    const multiple = fieldType === Array;
    return wrapField(Object.assign(Object.assign({}, props), { disabled,
        error,
        id,
        label,
        required }), checkboxes ? (allowedValues === null || allowedValues === void 0 ? void 0 : allowedValues.map(item => (React.createElement("div", { key: item, className: classnames(inputClassName, `form-check${inline ? ' form-check-inline' : ''}`) },
        React.createElement("label", { htmlFor: `${id}-${escape(item)}` },
            React.createElement("input", { checked: multiple ? value === null || value === void 0 ? void 0 : value.includes(item) : value === item, disabled: (disableItem === null || disableItem === void 0 ? void 0 : disableItem(item)) || disabled, id: `${id}-${escape(item)}`, name: name, onChange: () => {
                    if (!readOnly) {
                        onChange(multiple ? xor([item], value) : item);
                    }
                }, type: "checkbox" }),
            transform ? transform(item) : item))))) : (React.createElement("select", { className: classnames(inputClassName, 'form-control', {
            'is-invalid': error,
            'is-valid': !error && props.changed,
        }), disabled: disabled, id: id, multiple: multiple, name: name, onChange: event => {
            if (!readOnly) {
                const item = event.target.value;
                if (multiple) {
                    const clear = event.target.selectedIndex === -1;
                    onChange(clear ? [] : xor([item], value));
                }
                else {
                    onChange(item !== '' ? item : undefined);
                }
            }
        }, ref: inputRef, value: value !== null && value !== void 0 ? value : '' },
        (!!placeholder || !required || value === undefined) && !multiple && (React.createElement("option", { value: "", disabled: required, hidden: required }, placeholder || label)), allowedValues === null || allowedValues === void 0 ? void 0 :
        allowedValues.map(allowedValue => (React.createElement("option", { disabled: disableItem === null || disableItem === void 0 ? void 0 : disableItem(allowedValue), key: allowedValue, value: allowedValue }, transform ? transform(allowedValue) : allowedValue))))));
}
module.exportDefault(connectField(Select, { kind: 'leaf' }));
