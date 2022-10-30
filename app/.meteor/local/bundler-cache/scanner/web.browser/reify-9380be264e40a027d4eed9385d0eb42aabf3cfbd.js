let classnames;module.link('classnames',{default(v){classnames=v}},0);let omit;module.link('lodash/omit',{default(v){omit=v}},1);let BaseForm;module.link('uniforms',{BaseForm(v){BaseForm=v}},2);


function Bootstrap5(parent) {
    class _ extends parent {
        getContextState() {
            return Object.assign(Object.assign({}, super.getContextState()), { grid: this.props.grid });
        }
        getNativeFormProps() {
            const error = this.getContextError();
            const props = super.getNativeFormProps();
            return Object.assign(Object.assign({}, omit(props, ['grid'])), { className: classnames({ error }, props.className) });
        }
    }
    _.Bootstrap5 = Bootstrap5;
    _.displayName = `Bootstrap5${parent.displayName}`;
    return _;
}
module.exportDefault(Bootstrap5(BaseForm));
