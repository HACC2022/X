module.export({default:()=>usePlaceholder});let classNames;module.link('classnames',{default(v){classNames=v}},0);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},1);let useCol;module.link('./Col',{useCol(v){useCol=v}},2);


function usePlaceholder({
  animation,
  bg,
  bsPrefix,
  size,
  ...props
}) {
  bsPrefix = useBootstrapPrefix(bsPrefix, 'placeholder');
  const [{
    className,
    ...colProps
  }] = useCol(props);
  return { ...colProps,
    className: classNames(className, animation ? `${bsPrefix}-${animation}` : bsPrefix, size && `${bsPrefix}-${size}`, bg && `bg-${bg}`)
  };
}