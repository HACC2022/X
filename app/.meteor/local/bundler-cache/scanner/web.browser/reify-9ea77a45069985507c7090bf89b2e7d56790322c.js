let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},2);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},3);



const defaultProps = {
  aspectRatio: '1x1'
};

function toPercent(num) {
  if (num <= 0 || num > 100) return '100%';
  if (num < 1) return `${num * 100}%`;
  return `${num}%`;
}

const Ratio = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  children,
  aspectRatio,
  style,
  ...props
}, ref) => {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'ratio');
  const isCustomRatio = typeof aspectRatio === 'number';
  return /*#__PURE__*/_jsx("div", {
    ref: ref,
    ...props,
    style: { ...style,
      ...(isCustomRatio && {
        '--bs-aspect-ratio': toPercent(aspectRatio)
      })
    },
    className: classNames(bsPrefix, className, !isCustomRatio && `${bsPrefix}-${aspectRatio}`),
    children: React.Children.only(children)
  });
});
Ratio.defaultProps = defaultProps;
module.exportDefault(Ratio);