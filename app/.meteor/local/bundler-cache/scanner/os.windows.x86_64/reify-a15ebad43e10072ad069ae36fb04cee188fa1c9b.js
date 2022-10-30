"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortAutoValueFunctions = void 0;
const AutoValueRunner_js_1 = __importDefault(require("./AutoValueRunner.js"));
const getPositionsForAutoValue_js_1 = __importDefault(require("./getPositionsForAutoValue.js"));
/**
 * @method sortAutoValueFunctions
 * @private
 * @param autoValueFunctions - Array of objects to be sorted
 * @returns Sorted array
 *
 * Stable sort of the autoValueFunctions (preserves order at the same field depth).
 */
function sortAutoValueFunctions(autoValueFunctions) {
    const defaultFieldOrder = autoValueFunctions.reduce((acc, { fieldName }, index) => {
        acc[fieldName] = index;
        return acc;
    }, {});
    // Sort by how many dots each field name has, asc, such that we can auto-create
    // objects and arrays before we run the autoValues for properties within them.
    // Fields of the same level (same number of dots) preserve should order from the original array.
    return autoValueFunctions.sort((a, b) => {
        const depthDiff = a.fieldName.split('.').length - b.fieldName.split('.').length;
        return depthDiff === 0
            ? defaultFieldOrder[a.fieldName] - defaultFieldOrder[b.fieldName]
            : depthDiff;
    });
}
exports.sortAutoValueFunctions = sortAutoValueFunctions;
/**
 * @method setAutoValues
 * @private
 * @param autoValueFunctions - An array of objects with func, fieldName, and closestSubschemaFieldName props
 * @param mongoObject
 * @param [isModifier=false] - Is it a modifier doc?
 * @param [extendedAutoValueContext] - Object that will be added to the context when calling each autoValue function
 *
 * Updates doc with automatic values from autoValue functions or default
 * values from defaultValue. Modifies the referenced object in place.
 */
function setAutoValues(autoValueFunctions, mongoObject, isModifier, isUpsert, extendedAutoValueContext) {
    const sortedAutoValueFunctions = sortAutoValueFunctions(autoValueFunctions);
    sortedAutoValueFunctions.forEach(({ func, fieldName, closestSubschemaFieldName }) => {
        const avRunner = new AutoValueRunner_js_1.default({
            closestSubschemaFieldName,
            extendedAutoValueContext,
            func,
            isModifier,
            isUpsert,
            mongoObject
        });
        const positions = (0, getPositionsForAutoValue_js_1.default)({
            fieldName,
            isModifier,
            mongoObject
        });
        // Run the autoValue function once for each place in the object that
        // has a value or that potentially should.
        // @ts-expect-error
        positions.forEach(avRunner.runForPosition.bind(avRunner));
    });
}
exports.default = setAutoValues;