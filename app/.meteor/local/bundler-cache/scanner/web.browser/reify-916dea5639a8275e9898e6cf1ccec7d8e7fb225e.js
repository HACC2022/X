let React;module.link('react',{"*"(v){React=v}},0);let FormCheck;module.link('./FormCheck',{default(v){FormCheck=v}},1);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},2);


const Switch = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/_jsx(FormCheck, { ...props,
  ref: ref,
  type: "switch"
}));
Switch.displayName = 'Switch';
module.exportDefault(Object.assign(Switch, {
  Input: FormCheck.Input,
  Label: FormCheck.Label
}));