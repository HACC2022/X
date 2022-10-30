module.export({Auto:()=>Auto});module.export({AutoForm:()=>AutoForm},true);let clone;module.link('lodash/clone',{default(v){clone=v}},0);let isEqual;module.link('lodash/isEqual',{default(v){isEqual=v}},1);let omit;module.link('lodash/omit',{default(v){omit=v}},2);let setWith;module.link('lodash/setWith',{default(v){setWith=v}},3);let ValidatedQuickForm;module.link('./ValidatedQuickForm',{ValidatedQuickForm(v){ValidatedQuickForm=v}},4);




function Auto(Base) {
    // @ts-expect-error: Mixin class problem.
    class AutoForm extends Base {
        constructor(props) {
            super(props);
            this.state = Object.assign(Object.assign({}, this.state), { model: props.model });
        }
        componentDidUpdate(prevProps, prevState, snapshot) {
            const { model } = this.props;
            if (!isEqual(model, prevProps.model)) {
                this.setState({ model });
            }
            super.componentDidUpdate(prevProps, prevState, snapshot);
        }
        getNativeFormProps() {
            const props = super.getNativeFormProps();
            return omit(props, ['onChangeModel']);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getModel(mode) {
            return this.state.model;
        }
        onChange(key, value) {
            super.onChange(key, value);
            this.setState(state => ({ model: setWith(clone(state.model), key, value, clone) }), () => {
                if (this.props.onChangeModel) {
                    this.props.onChangeModel(this.state.model);
                }
            });
        }
        __reset(state) {
            return Object.assign(Object.assign({}, super.__reset(state)), { model: this.props.model });
        }
    }
    AutoForm.Auto = Auto;
    AutoForm.displayName = `Auto${Base.displayName}`;
    return AutoForm;
}
const AutoForm = Auto(ValidatedQuickForm);
