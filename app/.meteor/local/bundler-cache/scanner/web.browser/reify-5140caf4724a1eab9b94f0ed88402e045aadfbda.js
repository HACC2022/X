let AutoForm;module.link('uniforms',{AutoForm(v){AutoForm=v}},0);let ValidatedQuickForm;module.link('./ValidatedQuickForm',{default(v){ValidatedQuickForm=v}},1);

function Auto(parent) {
    class _ extends AutoForm.Auto(parent) {
    }
    _.Auto = Auto;
    return _;
}
module.exportDefault(Auto(ValidatedQuickForm));
