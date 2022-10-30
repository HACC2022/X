module.export({filterDOMProps:()=>filterDOMProps},true);const registered = [];
const registeredCache = new Set();
const filterDOMProps = Object.assign(function filterDOMProps(props) {
    const filteredProps = Object.assign({}, props);
    for (const prop in props) {
        if (registeredCache.has(prop)) {
            delete filteredProps[prop];
        }
    }
    return filteredProps;
}, {
    register(...props) {
        props.forEach(prop => {
            if (!registeredCache.has(prop)) {
                registered.push(prop);
                registeredCache.add(prop);
            }
        });
        registered.sort();
    },
    registered: registered,
});
filterDOMProps.register(
// These props are provided by useField directly.
'changed', 'error', 'errorMessage', 'field', 'fieldType', 'fields', 'initialCount', 'name', 'onChange', 'transform', 'value', 
// These props are provided by useField through context.state.
'disabled', 'label', 'placeholder', 'showInlineError', 
// This is used by AutoField.
'component', 
// These is used by AutoField and bridges.
'allowedValues');