module.export({useField:()=>useField});let get;module.link('lodash/get',{default(v){get=v}},0);let mapValues;module.link('lodash/mapValues',{default(v){mapValues=v}},1);let useCallback,useEffect,useMemo,useRef;module.link('react',{useCallback(v){useCallback=v},useEffect(v){useEffect=v},useMemo(v){useMemo=v},useRef(v){useRef=v}},2);let joinName;module.link('./joinName',{joinName(v){joinName=v}},3);let useForm;module.link('./useForm',{useForm(v){useForm=v}},4);




function propagate(prop, schema, state, fallback) {
    const forcedFallbackInProp = prop === true || prop === undefined;
    const forcedFallbackInSchema = schema === true || schema === undefined;
    const schemaValue = forcedFallbackInSchema ? fallback : schema;
    const value = prop === '' ||
        prop === false ||
        prop === null ||
        (forcedFallbackInProp && (forcedFallbackInSchema || !state))
        ? ''
        : forcedFallbackInProp
            ? schemaValue
            : prop;
    return [value, schemaValue];
}
function useField(fieldName, props, options) {
    var _a;
    const context = useForm();
    const name = joinName((options === null || options === void 0 ? void 0 : options.absoluteName) ? '' : context.name, fieldName);
    const field = context.schema.getField(name);
    const usesInitialValue = (options === null || options === void 0 ? void 0 : options.initialValue) !== false;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onChangeCalled = usesInitialValue ? useRef(false) : { current: false };
    const state = mapValues(context.state, (prev, key) => {
        const next = props[key];
        return next !== null && next !== undefined ? !!next : prev;
    });
    const changed = !!get(context.changedMap, name);
    const error = context.schema.getError(name, context.error);
    const errorMessage = context.schema.getErrorMessage(name, context.error);
    const fieldType = context.schema.getType(name);
    const fields = context.schema.getSubfields(name);
    const schemaProps = context.schema.getProps(name, Object.assign(Object.assign({}, state), props));
    const [label, labelFallback] = propagate(props.label, schemaProps.label, state.label, '');
    const [placeholder] = propagate(props.placeholder, schemaProps.placeholder, state.placeholder, label || labelFallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const id = useMemo(() => context.randomId(), []);
    const onChange = useCallback((value, key = name) => {
        onChangeCalled.current = true;
        context.onChange(key, value);
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context.onChange, name]);
    const valueFromModel = get(context.model, name);
    let initialValue;
    let value = (_a = props.value) !== null && _a !== void 0 ? _a : valueFromModel;
    if (usesInitialValue) {
        if (!onChangeCalled.current) {
            if (value === undefined) {
                value = context.schema.getInitialValue(name, props);
                initialValue = value;
            }
            else if (props.value !== undefined && props.value !== valueFromModel) {
                initialValue = props.value;
            }
        }
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            var _a;
            const required = (_a = props.required) !== null && _a !== void 0 ? _a : schemaProps.required;
            if (required && initialValue !== undefined) {
                onChange(initialValue);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
    }
    const fieldProps = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ id }, state), { changed,
        error,
        errorMessage,
        field,
        fieldType,
        fields,
        onChange,
        value }), schemaProps), props), { label,
        name, 
        // TODO: Should we assert `typeof placeholder === 'string'`?
        placeholder: placeholder });
    return [fieldProps, context];
}
