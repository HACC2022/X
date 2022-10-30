module.export({default:()=>SimpleSchema2Bridge});let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let invariant;module.link('invariant',{default(v){invariant=v}},1);let cloneDeep;module.link('lodash/cloneDeep',{default(v){cloneDeep=v}},2);let memoize;module.link('lodash/memoize',{default(v){memoize=v}},3);let SimpleSchema;module.link('simpl-schema',{default(v){SimpleSchema=v}},4);let Bridge,joinName;module.link('uniforms',{Bridge(v){Bridge=v},joinName(v){joinName=v}},5);





const propsToRemove = ['optional', 'uniforms'];
class SimpleSchema2Bridge extends Bridge {
    constructor(schema) {
        super();
        this.schema = schema;
        // Memoize for performance and referential equality.
        this.getField = memoize(this.getField.bind(this));
        this.getSubfields = memoize(this.getSubfields.bind(this));
        this.getType = memoize(this.getType.bind(this));
    }
    getError(name, error) {
        const details = error === null || error === void 0 ? void 0 : error.details;
        if (!Array.isArray(details)) {
            return null;
        }
        return details.find(error => error.name === name) || null;
    }
    getErrorMessage(name, error) {
        const scopedError = this.getError(name, error);
        // @ts-expect-error: `messageForError` has incorrect typing.
        return !scopedError ? '' : this.schema.messageForError(scopedError);
    }
    getErrorMessages(error) {
        if (!error) {
            return [];
        }
        const { details } = error;
        return Array.isArray(details)
            ? // @ts-expect-error: `messageForError` has incorrect typing.
                details.map(error => this.schema.messageForError(error))
            : [error.message || error];
    }
    getField(name) {
        const definition = this.schema.getDefinition(name);
        invariant(definition, 'Field not found in schema: "%s"', name);
        const merged = Object.assign(Object.assign({}, definition), definition.type[0]);
        // aldeed/node-simple-schema#27
        if (merged.autoValue &&
            (merged.autoValue.name === 'defaultAutoValueFunction' ||
                merged.autoValue.toString().indexOf('$setOnInsert:') !== -1) // FIXME: Hack.
        ) {
            try {
                merged.defaultValue = merged.autoValue.call({ operator: null });
            }
            catch (_) {
                // It's fine.
            }
        }
        return merged;
    }
    getInitialValue(name, props) {
        const field = this.getField(name);
        const defaultValue = field.defaultValue;
        if (defaultValue !== undefined) {
            return cloneDeep(defaultValue);
        }
        if (field.type === Array) {
            const item = this.getInitialValue(joinName(name, '0'));
            const items = Math.max((props === null || props === void 0 ? void 0 : props.initialCount) || 0, field.minCount || 0);
            return Array.from({ length: items }, () => item);
        }
        if (field.type === Object || field.type instanceof SimpleSchema) {
            const value = {};
            this.getSubfields(name).forEach(key => {
                const initialValue = this.getInitialValue(joinName(name, key));
                if (initialValue !== undefined) {
                    value[key] = initialValue;
                }
            });
            return value;
        }
        return undefined;
    }
    // eslint-disable-next-line complexity
    getProps(name, fieldProps) {
        const _a = this.getField(name), { type: fieldType } = _a, props = __rest(_a, ["type"]);
        props.required = !props.optional;
        if (typeof props.uniforms === 'function' ||
            typeof props.uniforms === 'string') {
            props.component = props.uniforms;
        }
        else {
            Object.assign(props, props.uniforms);
        }
        if (fieldType === Number) {
            props.decimal = true;
        }
        let options = (fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.options) || props.options;
        if (options) {
            if (typeof options === 'function') {
                options = options();
            }
            if (Array.isArray(options)) {
                props.allowedValues = options.map(option => option.value);
                props.transform = (value) => options.find(option => option.value === value).label;
            }
            else {
                props.allowedValues = Object.keys(options);
                props.transform = (value) => options[value];
            }
        }
        else if (fieldType === Array) {
            try {
                const itemProps = this.getProps(`${name}.$`, fieldProps);
                if (itemProps.allowedValues && !(fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.allowedValues)) {
                    props.allowedValues = itemProps.allowedValues;
                }
                if (itemProps.transform && !(fieldProps === null || fieldProps === void 0 ? void 0 : fieldProps.transform)) {
                    props.transform = itemProps.transform;
                }
            }
            catch (_) {
                // It's fine.
            }
        }
        propsToRemove.forEach(key => {
            if (key in props) {
                delete props[key];
            }
        });
        return props;
    }
    getSubfields(name) {
        // @ts-expect-error: Typing for `_makeGeneric` is missing.
        return this.schema.objectKeys(SimpleSchema._makeGeneric(name));
    }
    getType(name) {
        const type = this.getField(name).type;
        if (type === SimpleSchema.Integer) {
            return Number;
        }
        if (type instanceof SimpleSchema) {
            return Object;
        }
        return type;
    }
    // TODO: `ValidationOption` is not exported.
    getValidator(options = { clean: true, mutate: true }) {
        const validator = this.schema.validator(options);
        return (model) => {
            try {
                // Clean mutate its argument, even if mutate is false.
                validator(options.clean ? cloneDeep(Object.assign({}, model)) : model);
                return null;
            }
            catch (error) {
                return error;
            }
        };
    }
}