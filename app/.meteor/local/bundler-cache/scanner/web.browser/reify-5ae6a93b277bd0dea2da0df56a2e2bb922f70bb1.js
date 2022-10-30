let React;module.link('react',{"*"(v){React=v}},0);let usePlaceholder;module.link('./usePlaceholder',{default(v){usePlaceholder=v}},1);let PlaceholderButton;module.link('./PlaceholderButton',{default(v){PlaceholderButton=v}},2);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},3);



const Placeholder = /*#__PURE__*/React.forwardRef(({
  as: Component = 'span',
  ...props
}, ref) => {
  const placeholderProps = usePlaceholder(props);
  return /*#__PURE__*/_jsx(Component, { ...placeholderProps,
    ref: ref
  });
});
Placeholder.displayName = 'Placeholder';
module.exportDefault(Object.assign(Placeholder, {
  Button: PlaceholderButton
}));