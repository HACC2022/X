module.export({default:()=>allowedValuesValidator});let SimpleSchema;module.link('../SimpleSchema.js',{SimpleSchema(v){SimpleSchema=v}},0);
function allowedValuesValidator() {
    if (!this.valueShouldBeChecked)
        return;
    const { allowedValues } = this.definition;
    if (allowedValues == null)
        return;
    let isAllowed;
    // set defined in scope and allowedValues is its instance
    if (typeof Set === 'function' && allowedValues instanceof Set) {
        isAllowed = allowedValues.has(this.value);
    }
    else {
        isAllowed = allowedValues.includes(this.value);
    }
    return isAllowed ? true : SimpleSchema.ErrorTypes.VALUE_NOT_ALLOWED;
}
