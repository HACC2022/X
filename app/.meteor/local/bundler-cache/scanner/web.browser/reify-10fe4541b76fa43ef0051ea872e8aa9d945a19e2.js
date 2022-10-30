let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},2);let BreadcrumbItem;module.link('./BreadcrumbItem',{default(v){BreadcrumbItem=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);




const defaultProps = {
  label: 'breadcrumb',
  listProps: {}
};
const Breadcrumb = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  listProps,
  children,
  label,
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'nav',
  ...props
}, ref) => {
  const prefix = useBootstrapPrefix(bsPrefix, 'breadcrumb');
  return /*#__PURE__*/_jsx(Component, {
    "aria-label": label,
    className: className,
    ref: ref,
    ...props,
    children: /*#__PURE__*/_jsx("ol", { ...listProps,
      className: classNames(prefix, listProps == null ? void 0 : listProps.className),
      children: children
    })
  });
});
Breadcrumb.displayName = 'Breadcrumb';
Breadcrumb.defaultProps = defaultProps;
module.exportDefault(Object.assign(Breadcrumb, {
  Item: BreadcrumbItem
}));