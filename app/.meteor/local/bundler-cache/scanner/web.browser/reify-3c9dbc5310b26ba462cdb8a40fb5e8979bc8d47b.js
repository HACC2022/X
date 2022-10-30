let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let React;module.link('react',{default(v){React=v}},2);let filterDOMProps,useForm;module.link('uniforms',{filterDOMProps(v){filterDOMProps=v},useForm(v){useForm=v}},3);let gridClassName;module.link('./gridClassName',{default(v){gridClassName=v}},4);




function SubmitField(_a) {
    var { className, disabled, inputClassName, inputRef, readOnly, value, wrapClassName } = _a, props = __rest(_a, ["className", "disabled", "inputClassName", "inputRef", "readOnly", "value", "wrapClassName"]);
    const { error, state: anyState } = useForm();
    const state = anyState;
    const hasWrap = !!(state.grid || wrapClassName);
    const blockInput = (React.createElement("input", Object.assign({ className: inputClassName, disabled: disabled === undefined ? !!(error || state.disabled) : disabled, readOnly: readOnly, ref: inputRef, type: "submit" }, (value ? { value } : {}))));
    return (React.createElement("div", Object.assign({ className: classnames(className, {
            'is-invalid': error,
            row: state.grid,
        }) }, filterDOMProps(props)),
        hasWrap && (React.createElement("span", { className: classnames('col-form-label', gridClassName(state.grid, 'label')) }, "\u00A0")),
        hasWrap && (React.createElement("div", { className: classnames(wrapClassName, gridClassName(state.grid, 'input')) }, blockInput)),
        !hasWrap && blockInput));
}
SubmitField.defaultProps = { inputClassName: 'btn btn-primary' };
module.exportDefault(SubmitField);
