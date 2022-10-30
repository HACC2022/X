module.export({First:()=>First,Prev:()=>Prev,Ellipsis:()=>Ellipsis,Next:()=>Next,Last:()=>Last},true);let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let Anchor;module.link('@restart/ui/Anchor',{default(v){Anchor=v}},2);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},3);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},4);/* eslint-disable react/no-multi-comp */





const defaultProps = {
  active: false,
  disabled: false,
  activeLabel: '(current)'
};
const PageItem = /*#__PURE__*/React.forwardRef(({
  active,
  disabled,
  className,
  style,
  activeLabel,
  children,
  ...props
}, ref) => {
  const Component = active || disabled ? 'span' : Anchor;
  return /*#__PURE__*/_jsx("li", {
    ref: ref,
    style: style,
    className: classNames(className, 'page-item', {
      active,
      disabled
    }),
    children: /*#__PURE__*/_jsxs(Component, {
      className: "page-link",
      disabled: disabled,
      ...props,
      children: [children, active && activeLabel && /*#__PURE__*/_jsx("span", {
        className: "visually-hidden",
        children: activeLabel
      })]
    })
  });
});
PageItem.defaultProps = defaultProps;
PageItem.displayName = 'PageItem';
module.exportDefault(PageItem);

function createButton(name, defaultValue, label = name) {
  const Button = /*#__PURE__*/React.forwardRef(({
    children,
    ...props
  }, ref) => /*#__PURE__*/_jsxs(PageItem, { ...props,
    ref: ref,
    children: [/*#__PURE__*/_jsx("span", {
      "aria-hidden": "true",
      children: children || defaultValue
    }), /*#__PURE__*/_jsx("span", {
      className: "visually-hidden",
      children: label
    })]
  }));
  Button.displayName = name;
  return Button;
}

const First = createButton('First', '«');
const Prev = createButton('Prev', '‹', 'Previous');
const Ellipsis = createButton('Ellipsis', '…', 'More');
const Next = createButton('Next', '›');
const Last = createButton('Last', '»');