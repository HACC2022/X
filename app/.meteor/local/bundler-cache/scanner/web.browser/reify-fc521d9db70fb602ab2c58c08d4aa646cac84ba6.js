let ValidatedForm;module.link('uniforms',{ValidatedForm(v){ValidatedForm=v}},0);let BaseForm;module.link('./BaseForm',{default(v){BaseForm=v}},1);

function Validated(parent) {
    class _ extends ValidatedForm.Validated(parent) {
    }
    _.Validated = Validated;
    return _;
}
module.exportDefault(Validated(BaseForm));
