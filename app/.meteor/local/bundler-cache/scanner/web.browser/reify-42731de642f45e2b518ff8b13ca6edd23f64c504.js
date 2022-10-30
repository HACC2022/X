let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let React;module.link('react',{default(v){React=v}},2);let connectField,filterDOMProps;module.link('uniforms',{connectField(v){connectField=v},filterDOMProps(v){filterDOMProps=v}},3);



function Error(_a) {
    var { children, className, error, errorMessage } = _a, props = __rest(_a, ["children", "className", "error", "errorMessage"]);
    return !error ? null : (React.createElement("div", Object.assign({ className: classnames('card', 'mb-3', className) }, filterDOMProps(props)),
        React.createElement("div", { className: "card-body" }, children ? children : React.createElement("h4", { className: "card-title" }, errorMessage))));
}
module.exportDefault(connectField(Error, {
    initialValue: false,
    kind: 'leaf',
}));
