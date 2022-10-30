let React;module.link('react',{"*"(v){React=v}},0);let Button;module.link('./Button',{default(v){Button=v}},1);let usePlaceholder;module.link('./usePlaceholder',{default(v){usePlaceholder=v}},2);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},3);



const PlaceholderButton = /*#__PURE__*/React.forwardRef((props, ref) => {
  const placeholderProps = usePlaceholder(props);
  return /*#__PURE__*/_jsx(Button, { ...placeholderProps,
    ref: ref,
    disabled: true,
    tabIndex: -1
  });
});
PlaceholderButton.displayName = 'PlaceholderButton';
module.exportDefault(PlaceholderButton);