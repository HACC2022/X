module.export({checkValueType:()=>checkValueType,isValueTypeValid:()=>isValueTypeValid,default:()=>typeValidator});let SimpleSchema;module.link('../../SimpleSchema.js',{SimpleSchema(v){SimpleSchema=v}},0);let checkArrayValue;module.link('./checkArrayValue.js',{default(v){checkArrayValue=v}},1);let checkDateValue;module.link('./checkDateValue.js',{default(v){checkDateValue=v}},2);let checkNumberValue;module.link('./checkNumberValue.js',{default(v){checkNumberValue=v}},3);let checkStringValue;module.link('./checkStringValue.js',{default(v){checkStringValue=v}},4);




function checkValueType(info) {
    const { definition: def, operator: op, value, valueShouldBeChecked } = info;
    if (!valueShouldBeChecked)
        return;
    const expectedType = def.type;
    if (expectedType === String)
        return checkStringValue(def, value);
    if (expectedType === Number)
        return checkNumberValue(def, value, op, false);
    if (expectedType === SimpleSchema.Integer)
        return checkNumberValue(def, value, op, true);
    if (expectedType === Boolean) {
        // Is it a boolean?
        if (typeof value === 'boolean')
            return;
        return { type: SimpleSchema.ErrorTypes.EXPECTED_TYPE, dataType: 'Boolean' };
    }
    if (expectedType === Object || SimpleSchema.isSimpleSchema(expectedType)) {
        // Is it an object?
        if (value === Object(value) &&
            typeof value[Symbol.iterator] !== 'function' &&
            !(value instanceof Date)) {
            return;
        }
        return { type: SimpleSchema.ErrorTypes.EXPECTED_TYPE, dataType: 'Object' };
    }
    if (expectedType === Array)
        return checkArrayValue(def, value);
    if (expectedType instanceof Function) {
        // Generic constructor checks
        if (!(value instanceof expectedType)) {
            // https://docs.mongodb.com/manual/reference/operator/update/currentDate/
            const dateTypeIsOkay = expectedType === Date &&
                op === '$currentDate' &&
                (value === true || JSON.stringify(value) === '{"$type":"date"}');
            if (expectedType !== Date || !dateTypeIsOkay) {
                return {
                    type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
                    dataType: expectedType.name
                };
            }
        }
        // Date checks
        if (expectedType === Date) {
            // https://docs.mongodb.com/manual/reference/operator/update/currentDate/
            if (op === '$currentDate') {
                return checkDateValue(def, new Date());
            }
            return checkDateValue(def, value);
        }
    }
}
function isValueTypeValid(typeDefinitions, value, operator) {
    return typeDefinitions.some((definition) => {
        const typeValidationError = checkValueType({
            valueShouldBeChecked: true,
            definition,
            value,
            operator
        });
        return typeValidationError === undefined;
    });
}
function typeValidator() {
    return checkValueType(this);
}
