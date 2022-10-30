let React;module.link('react',{default(v){React=v}},0);let connectField;module.link('uniforms',{connectField(v){connectField=v}},1);let AutoField;module.link('./AutoField',{default(v){AutoField=v}},2);let ListDelField;module.link('./ListDelField',{default(v){ListDelField=v}},3);



function ListItem({ children = React.createElement(AutoField, { className: "col-11", label: null, name: "" }), removeIcon, }) {
    return (React.createElement("div", { className: "row" },
        React.createElement("div", { className: "col-1" },
            React.createElement(ListDelField, { name: "", removeIcon: removeIcon })),
        children));
}
module.exportDefault(connectField(ListItem, {
    initialValue: false,
}));
