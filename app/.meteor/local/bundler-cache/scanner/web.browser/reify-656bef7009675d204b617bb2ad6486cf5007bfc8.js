module.export({default:()=>createWithBsPrefix});let classNames;module.link('classnames',{default(v){classNames=v}},0);let camelize;module.link('dom-helpers/camelize',{default(v){camelize=v}},1);let React;module.link('react',{"*"(v){React=v}},2);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);





const pascalCase = str => str[0].toUpperCase() + camelize(str).slice(1);

// TODO: emstricten & fix the typing here! `createWithBsPrefix<TElementType>...`
function createWithBsPrefix(prefix, {
  displayName = pascalCase(prefix),
  Component,
  defaultProps
} = {}) {
  const BsComponent = /*#__PURE__*/React.forwardRef(({
    className,
    bsPrefix,
    as: Tag = Component || 'div',
    ...props
  }, ref) => {
    const resolvedPrefix = useBootstrapPrefix(bsPrefix, prefix);
    return /*#__PURE__*/_jsx(Tag, {
      ref: ref,
      className: classNames(className, resolvedPrefix),
      ...props
    });
  });
  BsComponent.defaultProps = defaultProps;
  BsComponent.displayName = displayName;
  return BsComponent;
}