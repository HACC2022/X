let React;module.link('react',{"*"(v){React=v}},0);let invariant;module.link('invariant',{default(v){invariant=v}},1);let useUncontrolled;module.link('uncontrollable',{useUncontrolled(v){useUncontrolled=v}},2);let chainFunction;module.link('./createChainedFunction',{default(v){chainFunction=v}},3);let map;module.link('./ElementChildren',{map(v){map=v}},4);let ButtonGroup;module.link('./ButtonGroup',{default(v){ButtonGroup=v}},5);let ToggleButton;module.link('./ToggleButton',{default(v){ToggleButton=v}},6);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},7);







const defaultProps = {
  type: 'radio',
  vertical: false
};
const ToggleButtonGroup = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    children,
    type,
    name,
    value,
    onChange,
    ...controlledProps
  } = useUncontrolled(props, {
    value: 'onChange'
  });

  const getValues = () => value == null ? [] : [].concat(value);

  const handleToggle = (inputVal, event) => {
    if (!onChange) {
      return;
    }

    const values = getValues();
    const isActive = values.indexOf(inputVal) !== -1;

    if (type === 'radio') {
      if (!isActive) onChange(inputVal, event);
      return;
    }

    if (isActive) {
      onChange(values.filter(n => n !== inputVal), event);
    } else {
      onChange([...values, inputVal], event);
    }
  };

  !(type !== 'radio' || !!name) ? process.env.NODE_ENV !== "production" ? invariant(false, 'A `name` is required to group the toggle buttons when the `type` ' + 'is set to "radio"') : invariant(false) : void 0;
  return /*#__PURE__*/_jsx(ButtonGroup, { ...controlledProps,
    ref: ref,
    children: map(children, child => {
      const values = getValues();
      const {
        value: childVal,
        onChange: childOnChange
      } = child.props;

      const handler = e => handleToggle(childVal, e);

      return /*#__PURE__*/React.cloneElement(child, {
        type,
        name: child.name || name,
        checked: values.indexOf(childVal) !== -1,
        onChange: chainFunction(childOnChange, handler)
      });
    })
  });
});
ToggleButtonGroup.defaultProps = defaultProps;
module.exportDefault(Object.assign(ToggleButtonGroup, {
  Button: ToggleButton
}));