let React;module.link('react',{"*"(v){React=v}},0);let classNames;module.link('classnames',{default(v){classNames=v}},1);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},2);


module.exportDefault(className => /*#__PURE__*/React.forwardRef((p, ref) => /*#__PURE__*/_jsx("div", { ...p,
  ref: ref,
  className: classNames(p.className, className)
})));