module.export({ValidatedQuickForm:()=>ValidatedQuickForm},true);let BaseForm;module.link('./BaseForm',{BaseForm(v){BaseForm=v}},0);let Quick;module.link('./QuickForm',{Quick(v){Quick=v}},1);let Validated;module.link('./ValidatedForm',{Validated(v){Validated=v}},2);


const ValidatedQuickForm = Validated(Quick(BaseForm));
