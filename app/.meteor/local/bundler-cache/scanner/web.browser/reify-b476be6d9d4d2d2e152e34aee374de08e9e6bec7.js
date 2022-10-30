let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let warning;module.link('warning',{default(v){warning=v}},2);let useUncontrolled;module.link('uncontrollable',{useUncontrolled(v){useUncontrolled=v}},3);let BaseNav;module.link('@restart/ui/Nav',{default(v){BaseNav=v}},4);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},5);let ListGroupItem;module.link('./ListGroupItem',{default(v){ListGroupItem=v}},6);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},7);







const ListGroup = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    className,
    bsPrefix: initialBsPrefix,
    variant,
    horizontal,
    numbered,
    // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
    as = 'div',
    ...controlledProps
  } = useUncontrolled(props, {
    activeKey: 'onSelect'
  });
  const bsPrefix = useBootstrapPrefix(initialBsPrefix, 'list-group');
  let horizontalVariant;

  if (horizontal) {
    horizontalVariant = horizontal === true ? 'horizontal' : `horizontal-${horizontal}`;
  }

  process.env.NODE_ENV !== "production" ? warning(!(horizontal && variant === 'flush'), '`variant="flush"` and `horizontal` should not be used together.') : void 0;
  return /*#__PURE__*/_jsx(BaseNav, {
    ref: ref,
    ...controlledProps,
    as: as,
    className: classNames(className, bsPrefix, variant && `${bsPrefix}-${variant}`, horizontalVariant && `${bsPrefix}-${horizontalVariant}`, numbered && `${bsPrefix}-numbered`)
  });
});
ListGroup.displayName = 'ListGroup';
module.exportDefault(Object.assign(ListGroup, {
  Item: ListGroupItem
}));