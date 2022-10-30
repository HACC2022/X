module.export({createAutoField:()=>createAutoField});let invariant;module.link('invariant',{default(v){invariant=v}},0);let createContext,createElement,useContext;module.link('react',{createContext(v){createContext=v},createElement(v){createElement=v},useContext(v){useContext=v}},1);let useField;module.link('./useField',{useField(v){useField=v}},2);


function createAutoField(defaultComponentDetector) {
    const context = createContext(defaultComponentDetector);
    function AutoField(rawProps) {
        var _a, _b;
        const [props, uniforms] = useField(rawProps.name, rawProps);
        const componentDetector = useContext(context);
        const component = (_a = props.component) !== null && _a !== void 0 ? _a : componentDetector(props, uniforms);
        invariant(component, 'AutoField received no component for: %s', props.name);
        return 'options' in component && ((_b = component.options) === null || _b === void 0 ? void 0 : _b.kind) === 'leaf'
            ? createElement(component.Component, props)
            : createElement(component, rawProps);
    }
    return Object.assign(AutoField, {
        componentDetectorContext: context,
        defaultComponentDetector,
    });
}
