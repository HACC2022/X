let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},2);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},3);



const defaultProps = {
  bg: 'primary',
  pill: false
};
const Badge = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  bg,
  pill,
  text,
  className,
  as: Component = 'span',
  ...props
}, ref) => {
  const prefix = useBootstrapPrefix(bsPrefix, 'badge');
  return /*#__PURE__*/_jsx(Component, {
    ref: ref,
    ...props,
    className: classNames(className, prefix, pill && `rounded-pill`, text && `text-${text}`, bg && `bg-${bg}`)
  });
});
Badge.displayName = 'Badge';
Badge.defaultProps = defaultProps;
module.exportDefault(Badge);