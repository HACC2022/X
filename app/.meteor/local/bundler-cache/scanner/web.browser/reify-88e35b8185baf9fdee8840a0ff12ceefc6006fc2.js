let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let cloneDeep;module.link('lodash/cloneDeep',{default(v){cloneDeep=v}},2);let React;module.link('react',{default(v){React=v}},3);let connectField,filterDOMProps,joinName,useField;module.link('uniforms',{connectField(v){connectField=v},filterDOMProps(v){filterDOMProps=v},joinName(v){joinName=v},useField(v){useField=v}},4);




function ListAdd(_a) {
    var { addIcon, className, disabled, initialCount, name, readOnly, value } = _a, props = __rest(_a, ["addIcon", "className", "disabled", "initialCount", "name", "readOnly", "value"]);
    const nameParts = joinName(null, name);
    const parentName = joinName(nameParts.slice(0, -1));
    const parent = useField(parentName, { initialCount }, { absoluteName: true })[0];
    const limitNotReached = !disabled && !(parent.maxCount <= parent.value.length);
    function onAction(event) {
        if (limitNotReached &&
            !readOnly &&
            (!('key' in event) || event.key === 'Enter')) {
            parent.onChange(parent.value.concat([cloneDeep(value)]));
        }
    }
    return (React.createElement("div", Object.assign({}, filterDOMProps(props), { className: classnames('badge rounded-pill float-end', className), onClick: onAction, onKeyDown: onAction, role: "button", tabIndex: 0 }), addIcon));
}
ListAdd.defaultProps = { addIcon: React.createElement("i", { className: "octicon octicon-plus" }) };
module.exportDefault(connectField(ListAdd, {
    initialValue: false,
    kind: 'leaf',
}));
