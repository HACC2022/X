let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let React;module.link('react',{default(v){React=v}},2);let connectField;module.link('uniforms',{connectField(v){connectField=v}},3);let wrapField;module.link('./wrapField',{default(v){wrapField=v}},4);




/* istanbul ignore next */
const DateConstructor = (typeof global === 'object' ? global : window).Date;
const dateFormat = (value, type = 'datetime-local') => value === null || value === void 0 ? void 0 : value.toISOString().slice(0, type === 'datetime-local' ? -8 : -14);
function Date(_a) {
    var _b;
    var { disabled, error, id, inputClassName, inputRef, max, min, name, onChange, placeholder, readOnly, value, type = 'datetime-local' } = _a, props = __rest(_a, ["disabled", "error", "id", "inputClassName", "inputRef", "max", "min", "name", "onChange", "placeholder", "readOnly", "value", "type"]);
    return wrapField(Object.assign(Object.assign({}, props), { id }), React.createElement("input", { className: classnames(inputClassName, 'form-control', {
            'is-invalid': error,
            'is-valid': !error && props.changed,
        }), disabled: disabled, id: id, max: dateFormat(max), min: dateFormat(min), name: name, onChange: event => {
            const date = new DateConstructor(event.target.valueAsNumber);
            if (date.getFullYear() < 10000) {
                onChange(date);
            }
            else if (isNaN(event.target.valueAsNumber)) {
                onChange(undefined);
            }
        }, placeholder: placeholder, readOnly: readOnly, ref: inputRef, type: type, value: (_b = dateFormat(value, type)) !== null && _b !== void 0 ? _b : '' }));
}
module.exportDefault(connectField(Date, { kind: 'leaf' }));
