let classNames;module.link('classnames',{default(v){classNames=v}},0);let React;module.link('react',{"*"(v){React=v}},1);let useUncontrolled;module.link('uncontrollable',{useUncontrolled(v){useUncontrolled=v}},2);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},3);let Anchor;module.link('@restart/ui/Anchor',{default(v){Anchor=v}},4);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},5);let Fade;module.link('./Fade',{default(v){Fade=v}},6);let CloseButton;module.link('./CloseButton',{default(v){CloseButton=v}},7);let divWithClassName;module.link('./divWithClassName',{default(v){divWithClassName=v}},8);let createWithBsPrefix;module.link('./createWithBsPrefix',{default(v){createWithBsPrefix=v}},9);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},10);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},11);











const DivStyledAsH4 = divWithClassName('h4');
DivStyledAsH4.displayName = 'DivStyledAsH4';
const AlertHeading = createWithBsPrefix('alert-heading', {
  Component: DivStyledAsH4
});
const AlertLink = createWithBsPrefix('alert-link', {
  Component: Anchor
});
const defaultProps = {
  variant: 'primary',
  show: true,
  transition: Fade,
  closeLabel: 'Close alert'
};
const Alert = /*#__PURE__*/React.forwardRef((uncontrolledProps, ref) => {
  const {
    bsPrefix,
    show,
    closeLabel,
    closeVariant,
    className,
    children,
    variant,
    onClose,
    dismissible,
    transition,
    ...props
  } = useUncontrolled(uncontrolledProps, {
    show: 'onClose'
  });
  const prefix = useBootstrapPrefix(bsPrefix, 'alert');
  const handleClose = useEventCallback(e => {
    if (onClose) {
      onClose(false, e);
    }
  });
  const Transition = transition === true ? Fade : transition;

  const alert = /*#__PURE__*/_jsxs("div", {
    role: "alert",
    ...(!Transition ? props : undefined),
    ref: ref,
    className: classNames(className, prefix, variant && `${prefix}-${variant}`, dismissible && `${prefix}-dismissible`),
    children: [dismissible && /*#__PURE__*/_jsx(CloseButton, {
      onClick: handleClose,
      "aria-label": closeLabel,
      variant: closeVariant
    }), children]
  });

  if (!Transition) return show ? alert : null;
  return /*#__PURE__*/_jsx(Transition, {
    unmountOnExit: true,
    ...props,
    ref: undefined,
    in: show,
    children: alert
  });
});
Alert.displayName = 'Alert';
Alert.defaultProps = defaultProps;
module.exportDefault(Object.assign(Alert, {
  Link: AlertLink,
  Heading: AlertHeading
}));