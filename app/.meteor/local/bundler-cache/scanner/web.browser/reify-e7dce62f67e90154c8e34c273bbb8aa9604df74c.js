module.export({changedKeys:()=>changedKeys});let isEqual;module.link('lodash/isEqual',{default(v){isEqual=v}},0);let joinName;module.link('./joinName',{joinName(v){joinName=v}},1);

function isObject(value) {
    return !!value && value === Object(value) && !(value instanceof Date);
}
// eslint-disable-next-line complexity
function changedKeys(root, valueA, valueB) {
    if (!isObject(valueA) || (valueB && typeof valueA !== typeof valueB)) {
        return isEqual(valueA, valueB) ? [] : [root];
    }
    const changed = [root];
    if (isObject(valueB)) {
        for (const key in valueA) {
            if (!(key in valueB) || !isEqual(valueA[key], valueB[key])) {
                changed.push(joinName(root, key));
            }
        }
        for (const key in valueB) {
            if (!(key in valueA)) {
                changed.push(joinName(root, key));
            }
        }
        if (changed.length === 1) {
            changed.pop();
        }
    }
    else {
        // eslint-disable-next-line guard-for-in
        for (const key in valueA) {
            changed.push(joinName(root, key));
        }
    }
    return changed;
}
