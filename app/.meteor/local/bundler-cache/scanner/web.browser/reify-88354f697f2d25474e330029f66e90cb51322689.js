let React;module.link('react',{"*"(v){React=v}},0);let ENTERING,EXITING;module.link('react-transition-group/Transition',{ENTERING(v){ENTERING=v},EXITING(v){EXITING=v}},1);let Fade;module.link('./Fade',{default(v){Fade=v}},2);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},3);



const fadeStyles = {
  [ENTERING]: 'showing',
  [EXITING]: 'showing show'
};
const ToastFade = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/_jsx(Fade, { ...props,
  ref: ref,
  transitionClasses: fadeStyles
}));
ToastFade.displayName = 'ToastFade';
module.exportDefault(ToastFade);