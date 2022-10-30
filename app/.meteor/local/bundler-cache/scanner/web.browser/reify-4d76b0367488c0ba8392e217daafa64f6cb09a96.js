let QuickForm;module.link('uniforms',{QuickForm(v){QuickForm=v}},0);let AutoField;module.link('./AutoField',{default(v){AutoField=v}},1);let BaseForm;module.link('./BaseForm',{default(v){BaseForm=v}},2);let ErrorsField;module.link('./ErrorsField',{default(v){ErrorsField=v}},3);let SubmitField;module.link('./SubmitField',{default(v){SubmitField=v}},4);




function Quick(parent) {
    class _ extends QuickForm.Quick(parent) {
        getAutoField() {
            return AutoField;
        }
        getErrorsField() {
            return ErrorsField;
        }
        getSubmitField() {
            return SubmitField;
        }
    }
    _.Quick = Quick;
    return _;
}
module.exportDefault(Quick(BaseForm));
