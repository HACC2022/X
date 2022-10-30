let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let React;module.link('react',{default(v){React=v}},2);let connectField,filterDOMProps,joinName,useField;module.link('uniforms',{connectField(v){connectField=v},filterDOMProps(v){filterDOMProps=v},joinName(v){joinName=v},useField(v){useField=v}},3);



function ListDel(_a) {
    var { className, disabled, name, readOnly, removeIcon } = _a, props = __rest(_a, ["className", "disabled", "name", "readOnly", "removeIcon"]);
    const nameParts = joinName(null, name);
    const nameIndex = +nameParts[nameParts.length - 1];
    const parentName = joinName(nameParts.slice(0, -1));
    const parent = useField(parentName, {}, { absoluteName: true })[0];
    const limitNotReached = !disabled && !(parent.minCount >= parent.value.length);
    function onAction(event) {
        if (limitNotReached &&
            !readOnly &&
            (!('key' in event) || event.key === 'Enter')) {
            const value = parent.value.slice();
            value.splice(nameIndex, 1);
            parent.onChange(value);
        }
    }
    return (React.createElement("span", Object.assign({}, filterDOMProps(props), { className: classnames('badge rounded-pill', className), onClick: onAction, onKeyDown: onAction, role: "button", tabIndex: 0 }), removeIcon));
}
ListDel.defaultProps = {
    removeIcon: React.createElement("i", { className: "octicon octicon-dash" }),
};
module.exportDefault(connectField(ListDel, {
    initialValue: false,
    kind: 'leaf',
}));
