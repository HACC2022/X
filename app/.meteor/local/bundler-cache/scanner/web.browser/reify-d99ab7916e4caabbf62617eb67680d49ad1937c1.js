module.export({default:()=>AutoFields});let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let createElement;module.link('react',{createElement(v){createElement=v}},1);let useForm;module.link('uniforms',{useForm(v){useForm=v}},2);let AutoField;module.link('./AutoField',{default(v){AutoField=v}},3);



function AutoFields(_a) {
    var { autoField = AutoField, element = 'div', fields, omitFields = [], showInlineError } = _a, props = __rest(_a, ["autoField", "element", "fields", "omitFields", "showInlineError"]);
    const { schema } = useForm();
    return createElement(element, props, (fields !== null && fields !== void 0 ? fields : schema.getSubfields())
        .filter(field => !omitFields.includes(field))
        .map(field => createElement(autoField, Object.assign({ key: field, name: field }, showInlineError === undefined ? null : { showInlineError }))));
}
