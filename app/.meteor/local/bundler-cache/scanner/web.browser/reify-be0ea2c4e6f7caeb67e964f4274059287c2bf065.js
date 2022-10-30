let PropTypes;module.link('prop-types',{default(v){PropTypes=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let classNames;module.link('classnames',{default(v){classNames=v}},2);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},3);



const propTypes = {
  'aria-label': PropTypes.string,
  onClick: PropTypes.func,

  /**
   * Render different color variant for the button.
   *
   * Omitting this will render the default dark color.
   */
  variant: PropTypes.oneOf(['white'])
};
const defaultProps = {
  'aria-label': 'Close'
};
const CloseButton = /*#__PURE__*/React.forwardRef(({
  className,
  variant,
  ...props
}, ref) => /*#__PURE__*/_jsx("button", {
  ref: ref,
  type: "button",
  className: classNames('btn-close', variant && `btn-close-${variant}`, className),
  ...props
}));
CloseButton.displayName = 'CloseButton';
CloseButton.propTypes = propTypes;
CloseButton.defaultProps = defaultProps;
module.exportDefault(CloseButton);