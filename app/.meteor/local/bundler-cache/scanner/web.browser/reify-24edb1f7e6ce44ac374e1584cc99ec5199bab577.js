let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let classnames;module.link('classnames',{default(v){classnames=v}},1);let React,Children,cloneElement,isValidElement;module.link('react',{default(v){React=v},Children(v){Children=v},cloneElement(v){cloneElement=v},isValidElement(v){isValidElement=v}},2);let connectField,filterDOMProps;module.link('uniforms',{connectField(v){connectField=v},filterDOMProps(v){filterDOMProps=v}},3);let ListAddField;module.link('./ListAddField',{default(v){ListAddField=v}},4);let ListItemField;module.link('./ListItemField',{default(v){ListItemField=v}},5);





function List(_a) {
    var { addIcon, children = React.createElement(ListItemField, { name: "$" }), className, error, errorMessage, initialCount, itemProps, label, removeIcon, showInlineError, value } = _a, props = __rest(_a, ["addIcon", "children", "className", "error", "errorMessage", "initialCount", "itemProps", "label", "removeIcon", "showInlineError", "value"]);
    return (React.createElement("div", Object.assign({ className: classnames('card mb-3', className) }, filterDOMProps(props)),
        React.createElement("div", { className: "card-body" },
            label && (React.createElement("div", { className: "card-title" },
                React.createElement("label", { className: "col-form-label" },
                    label,
                    "\u00A0"),
                React.createElement(ListAddField, { addIcon: addIcon, initialCount: initialCount, name: "$" }),
                !!(error && showInlineError) && (React.createElement("span", { className: "text-danger" }, errorMessage)))), value === null || value === void 0 ? void 0 :
            value.map((item, itemIndex) => Children.map(children, (child, childIndex) => {
                var _a;
                return isValidElement(child)
                    ? cloneElement(child, Object.assign(Object.assign({ key: `${itemIndex}-${childIndex}`, name: (_a = child.props.name) === null || _a === void 0 ? void 0 : _a.replace('$', '' + itemIndex) }, itemProps), { removeIcon }))
                    : child;
            })))));
}
module.exportDefault(connectField(List));
