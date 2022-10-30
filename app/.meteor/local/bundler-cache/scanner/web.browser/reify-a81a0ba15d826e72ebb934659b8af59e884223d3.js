let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let Anchor;module.link('@restart/ui/Anchor',{default(v){Anchor=v}},2);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);




const defaultProps = {
  active: false,
  linkProps: {}
};
const BreadcrumbItem = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  active,
  children,
  className,
  // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
  as: Component = 'li',
  linkAs: LinkComponent = Anchor,
  linkProps,
  href,
  title,
  target,
  ...props
}, ref) => {
  const prefix = useBootstrapPrefix(bsPrefix, 'breadcrumb-item');
  return /*#__PURE__*/_jsx(Component, {
    ref: ref,
    ...props,
    className: classNames(prefix, className, {
      active
    }),
    "aria-current": active ? 'page' : undefined,
    children: active ? children : /*#__PURE__*/_jsx(LinkComponent, { ...linkProps,
      href: href,
      title: title,
      target: target,
      children: children
    })
  });
});
BreadcrumbItem.displayName = 'BreadcrumbItem';
BreadcrumbItem.defaultProps = defaultProps;
module.exportDefault(BreadcrumbItem);