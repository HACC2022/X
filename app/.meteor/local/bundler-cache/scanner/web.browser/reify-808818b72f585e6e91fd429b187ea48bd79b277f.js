let classNames;module.link('classnames',{default(v){classNames=v}},0);let PropTypes;module.link('prop-types',{default(v){PropTypes=v}},1);let React;module.link('react',{"*"(v){React=v}},2);let FormCheck;module.link('./FormCheck',{default(v){FormCheck=v}},3);let FormControl;module.link('./FormControl',{default(v){FormControl=v}},4);let FormFloating;module.link('./FormFloating',{default(v){FormFloating=v}},5);let FormGroup;module.link('./FormGroup',{default(v){FormGroup=v}},6);let FormLabel;module.link('./FormLabel',{default(v){FormLabel=v}},7);let FormRange;module.link('./FormRange',{default(v){FormRange=v}},8);let FormSelect;module.link('./FormSelect',{default(v){FormSelect=v}},9);let FormText;module.link('./FormText',{default(v){FormText=v}},10);let Switch;module.link('./Switch',{default(v){Switch=v}},11);let FloatingLabel;module.link('./FloatingLabel',{default(v){FloatingLabel=v}},12);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},13);













const propTypes = {
  /**
   * The Form `ref` will be forwarded to the underlying element,
   * which means, unless it's rendered `as` a composite component,
   * it will be a DOM node, when resolved.
   *
   * @type {ReactRef}
   * @alias ref
   */
  _ref: PropTypes.any,

  /**
   * Mark a form as having been validated. Setting it to `true` will
   * toggle any validation styles on the forms elements.
   */
  validated: PropTypes.bool,
  as: PropTypes.elementType
};
const Form = /*#__PURE__*/React.forwardRef(({
  className,
  validated,
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'form',
  ...props
}, ref) => /*#__PURE__*/_jsx(Component, { ...props,
  ref: ref,
  className: classNames(className, validated && 'was-validated')
}));
Form.displayName = 'Form';
Form.propTypes = propTypes;
module.exportDefault(Object.assign(Form, {
  Group: FormGroup,
  Control: FormControl,
  Floating: FormFloating,
  Check: FormCheck,
  Switch,
  Label: FormLabel,
  Text: FormText,
  Range: FormRange,
  Select: FormSelect,
  FloatingLabel
}));