let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let React;module.link('react',{default(v){React=v}},2);let connectField,filterDOMProps;module.link('uniforms',{connectField(v){connectField=v},filterDOMProps(v){filterDOMProps=v}},3);let AutoField;module.link('./AutoField',{default(v){AutoField=v}},4);




function Nest(_a) {
    var { children, className, error, errorMessage, fields, itemProps, label, showInlineError } = _a, props = __rest(_a, ["children", "className", "error", "errorMessage", "fields", "itemProps", "label", "showInlineError"]);
    return (React.createElement("div", Object.assign({ className: classnames(className, { 'has-error': error }) }, filterDOMProps(props)),
        label && React.createElement("label", null, label),
        !!(error && showInlineError) && (React.createElement("span", { className: "text-danger" }, errorMessage)),
        children ||
            fields.map(field => (React.createElement(AutoField, Object.assign({ key: field, name: field }, itemProps))))));
}
module.exportDefault(connectField(Nest));
