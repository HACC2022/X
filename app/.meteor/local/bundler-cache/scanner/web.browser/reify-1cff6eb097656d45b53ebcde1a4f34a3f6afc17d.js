module.export({default:()=>checkNumberValue});let SimpleSchema;module.link('../../SimpleSchema.js',{SimpleSchema(v){SimpleSchema=v}},0);
function checkNumberValue(def, value, op, expectsInteger) {
    // Is it a valid number?
    if (typeof value !== 'number' || isNaN(value)) {
        return {
            type: SimpleSchema.ErrorTypes.EXPECTED_TYPE,
            dataType: expectsInteger ? 'Integer' : 'Number'
        };
    }
    // Assuming we are not incrementing, is the value less than the maximum value?
    if (op !== '$inc' &&
        def.max !== null &&
        (def.exclusiveMax === true
            ? def.max <= value
            : def.max < value)) {
        return {
            type: def.exclusiveMax === true
                ? SimpleSchema.ErrorTypes.MAX_NUMBER_EXCLUSIVE
                : SimpleSchema.ErrorTypes.MAX_NUMBER,
            max: def.max
        };
    }
    // Assuming we are not incrementing, is the value more than the minimum value?
    if (op !== '$inc' &&
        def.min !== null &&
        (def.exclusiveMin === true
            ? def.min >= value
            : def.min > value)) {
        return {
            type: def.exclusiveMin === true
                ? SimpleSchema.ErrorTypes.MIN_NUMBER_EXCLUSIVE
                : SimpleSchema.ErrorTypes.MIN_NUMBER,
            min: def.min
        };
    }
    // Is it an integer if we expect an integer?
    if (expectsInteger && !Number.isInteger(value)) {
        return { type: SimpleSchema.ErrorTypes.MUST_BE_INTEGER };
    }
}