module.export({default:()=>HiddenField});let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let React,useEffect;module.link('react',{default(v){React=v},useEffect(v){useEffect=v}},1);let filterDOMProps,useField;module.link('uniforms',{filterDOMProps(v){filterDOMProps=v},useField(v){useField=v}},2);


function HiddenField(_a) {
    var _b;
    var { value } = _a, rawProps = __rest(_a, ["value"]);
    const props = useField(rawProps.name, rawProps, { initialValue: false })[0];
    useEffect(() => {
        if (value !== undefined && value !== props.value) {
            props.onChange(value);
        }
    });
    return props.noDOM ? null : (React.createElement("input", Object.assign({ disabled: props.disabled, name: props.name, readOnly: props.readOnly, ref: props.inputRef, type: "hidden", value: (_b = value !== null && value !== void 0 ? value : props.value) !== null && _b !== void 0 ? _b : '' }, filterDOMProps(props))));
}
