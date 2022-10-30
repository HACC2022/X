module.export({Quick:()=>Quick});module.export({QuickForm:()=>QuickForm},true);let __rest;module.link("tslib",{__rest(v){__rest=v}},0);let React;module.link('react',{default(v){React=v}},1);let BaseForm;module.link('./BaseForm',{BaseForm(v){BaseForm=v}},2);


function Quick(Base) {
    // @ts-expect-error: Mixin class problem.
    class QuickForm extends Base {
        getNativeFormProps() {
            const _props = super.getNativeFormProps();
            const { autoField: AutoField = this.getAutoField(), errorsField: ErrorsField = this.getErrorsField(), submitField: SubmitField = this.getSubmitField() } = _props, props = __rest(_props, ["autoField", "errorsField", "submitField"]);
            if (!props.children) {
                props.children = this.getContextSchema()
                    .getSubfields()
                    .map(key => React.createElement(AutoField, { key: key, name: key }))
                    .concat([
                    React.createElement(ErrorsField, { key: "$ErrorsField" }),
                    React.createElement(SubmitField, { key: "$SubmitField" }),
                ]);
            }
            return props;
        }
        getAutoField() {
            return () => null;
        }
        getErrorsField() {
            return () => null;
        }
        getSubmitField() {
            return () => null;
        }
    }
    QuickForm.Quick = Quick;
    QuickForm.displayName = `Quick${Base.displayName}`;
    return QuickForm;
}
const QuickForm = Quick(BaseForm);
