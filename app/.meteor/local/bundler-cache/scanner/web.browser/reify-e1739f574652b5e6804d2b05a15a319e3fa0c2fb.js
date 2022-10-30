let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},2);let PageItem,Ellipsis,First,Last,Next,Prev;module.link('./PageItem',{default(v){PageItem=v},Ellipsis(v){Ellipsis=v},First(v){First=v},Last(v){Last=v},Next(v){Next=v},Prev(v){Prev=v}},3);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},4);





/**
 * @property {PageItem} Item
 * @property {PageItem} First
 * @property {PageItem} Prev
 * @property {PageItem} Ellipsis
 * @property {PageItem} Next
 * @property {PageItem} Last
 */
const Pagination = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  size,
  ...props
}, ref) => {
  const decoratedBsPrefix = useBootstrapPrefix(bsPrefix, 'pagination');
  return /*#__PURE__*/_jsx("ul", {
    ref: ref,
    ...props,
    className: classNames(className, decoratedBsPrefix, size && `${decoratedBsPrefix}-${size}`)
  });
});
Pagination.displayName = 'Pagination';
module.exportDefault(Object.assign(Pagination, {
  First,
  Prev,
  Ellipsis,
  Item: PageItem,
  Next,
  Last
}));