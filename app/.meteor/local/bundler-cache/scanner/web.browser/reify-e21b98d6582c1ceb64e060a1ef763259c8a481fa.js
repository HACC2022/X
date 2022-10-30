let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let React;module.link('react',{default(v){React=v}},2);let filterDOMProps,useForm;module.link('uniforms',{filterDOMProps(v){filterDOMProps=v},useForm(v){useForm=v}},3);



function ErrorsField(_a) {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    const { error, schema } = useForm();
    return !error && !children ? null : (React.createElement("div", Object.assign({ className: classnames('card border-danger mb-3 text-danger', className) }, filterDOMProps(props)),
        React.createElement("div", { className: "card-body" },
            children,
            schema.getErrorMessages(error).map((message, index) => (React.createElement("div", { key: index, className: "disabled" }, message))))));
}
module.exportDefault(ErrorsField);
