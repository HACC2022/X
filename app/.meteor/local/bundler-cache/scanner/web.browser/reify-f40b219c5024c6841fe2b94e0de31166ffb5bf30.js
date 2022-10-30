let classNames;module.link('classnames',{default(v){classNames=v}},0);let addEventListener;module.link('dom-helpers/addEventListener',{default(v){addEventListener=v}},1);let canUseDOM;module.link('dom-helpers/canUseDOM',{default(v){canUseDOM=v}},2);let ownerDocument;module.link('dom-helpers/ownerDocument',{default(v){ownerDocument=v}},3);let removeEventListener;module.link('dom-helpers/removeEventListener',{default(v){removeEventListener=v}},4);let getScrollbarSize;module.link('dom-helpers/scrollbarSize',{default(v){getScrollbarSize=v}},5);let useCallbackRef;module.link('@restart/hooks/useCallbackRef',{default(v){useCallbackRef=v}},6);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},7);let useMergedRefs;module.link('@restart/hooks/useMergedRefs',{default(v){useMergedRefs=v}},8);let useWillUnmount;module.link('@restart/hooks/useWillUnmount',{default(v){useWillUnmount=v}},9);let transitionEnd;module.link('dom-helpers/transitionEnd',{default(v){transitionEnd=v}},10);let React;module.link('react',{"*"(v){React=v}},11);let useCallback,useMemo,useRef,useState;module.link('react',{useCallback(v){useCallback=v},useMemo(v){useMemo=v},useRef(v){useRef=v},useState(v){useState=v}},12);let BaseModal;module.link('@restart/ui/Modal',{default(v){BaseModal=v}},13);let getSharedManager;module.link('./BootstrapModalManager',{getSharedManager(v){getSharedManager=v}},14);let Fade;module.link('./Fade',{default(v){Fade=v}},15);let ModalBody;module.link('./ModalBody',{default(v){ModalBody=v}},16);let ModalContext;module.link('./ModalContext',{default(v){ModalContext=v}},17);let ModalDialog;module.link('./ModalDialog',{default(v){ModalDialog=v}},18);let ModalFooter;module.link('./ModalFooter',{default(v){ModalFooter=v}},19);let ModalHeader;module.link('./ModalHeader',{default(v){ModalHeader=v}},20);let ModalTitle;module.link('./ModalTitle',{default(v){ModalTitle=v}},21);let useBootstrapPrefix,useIsRTL;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v},useIsRTL(v){useIsRTL=v}},22);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},23);























const defaultProps = {
  show: false,
  backdrop: true,
  keyboard: true,
  autoFocus: true,
  enforceFocus: true,
  restoreFocus: true,
  animation: true,
  dialogAs: ModalDialog
};
/* eslint-disable no-use-before-define, react/no-multi-comp */

function DialogTransition(props) {
  return /*#__PURE__*/_jsx(Fade, { ...props,
    timeout: null
  });
}

function BackdropTransition(props) {
  return /*#__PURE__*/_jsx(Fade, { ...props,
    timeout: null
  });
}
/* eslint-enable no-use-before-define */


const Modal = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  style,
  dialogClassName,
  contentClassName,
  children,
  dialogAs: Dialog,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,

  /* BaseModal props */
  show,
  animation,
  backdrop,
  keyboard,
  onEscapeKeyDown,
  onShow,
  onHide,
  container,
  autoFocus,
  enforceFocus,
  restoreFocus,
  restoreFocusOptions,
  onEntered,
  onExit,
  onExiting,
  onEnter,
  onEntering,
  onExited,
  backdropClassName,
  manager: propsManager,
  ...props
}, ref) => {
  const [modalStyle, setStyle] = useState({});
  const [animateStaticModal, setAnimateStaticModal] = useState(false);
  const waitingForMouseUpRef = useRef(false);
  const ignoreBackdropClickRef = useRef(false);
  const removeStaticModalAnimationRef = useRef(null);
  const [modal, setModalRef] = useCallbackRef();
  const mergedRef = useMergedRefs(ref, setModalRef);
  const handleHide = useEventCallback(onHide);
  const isRTL = useIsRTL();
  bsPrefix = useBootstrapPrefix(bsPrefix, 'modal');
  const modalContext = useMemo(() => ({
    onHide: handleHide
  }), [handleHide]);

  function getModalManager() {
    if (propsManager) return propsManager;
    return getSharedManager({
      isRTL
    });
  }

  function updateDialogStyle(node) {
    if (!canUseDOM) return;
    const containerIsOverflowing = getModalManager().getScrollbarWidth() > 0;
    const modalIsOverflowing = node.scrollHeight > ownerDocument(node).documentElement.clientHeight;
    setStyle({
      paddingRight: containerIsOverflowing && !modalIsOverflowing ? getScrollbarSize() : undefined,
      paddingLeft: !containerIsOverflowing && modalIsOverflowing ? getScrollbarSize() : undefined
    });
  }

  const handleWindowResize = useEventCallback(() => {
    if (modal) {
      updateDialogStyle(modal.dialog);
    }
  });
  useWillUnmount(() => {
    removeEventListener(window, 'resize', handleWindowResize);
    removeStaticModalAnimationRef.current == null ? void 0 : removeStaticModalAnimationRef.current();
  }); // We prevent the modal from closing during a drag by detecting where the
  // the click originates from. If it starts in the modal and then ends outside
  // don't close.

  const handleDialogMouseDown = () => {
    waitingForMouseUpRef.current = true;
  };

  const handleMouseUp = e => {
    if (waitingForMouseUpRef.current && modal && e.target === modal.dialog) {
      ignoreBackdropClickRef.current = true;
    }

    waitingForMouseUpRef.current = false;
  };

  const handleStaticModalAnimation = () => {
    setAnimateStaticModal(true);
    removeStaticModalAnimationRef.current = transitionEnd(modal.dialog, () => {
      setAnimateStaticModal(false);
    });
  };

  const handleStaticBackdropClick = e => {
    if (e.target !== e.currentTarget) {
      return;
    }

    handleStaticModalAnimation();
  };

  const handleClick = e => {
    if (backdrop === 'static') {
      handleStaticBackdropClick(e);
      return;
    }

    if (ignoreBackdropClickRef.current || e.target !== e.currentTarget) {
      ignoreBackdropClickRef.current = false;
      return;
    }

    onHide == null ? void 0 : onHide();
  };

  const handleEscapeKeyDown = e => {
    if (!keyboard && backdrop === 'static') {
      // Call preventDefault to stop modal from closing in restart ui,
      // then play our animation.
      e.preventDefault();
      handleStaticModalAnimation();
    } else if (keyboard && onEscapeKeyDown) {
      onEscapeKeyDown(e);
    }
  };

  const handleEnter = (node, isAppearing) => {
    if (node) {
      updateDialogStyle(node);
    }

    onEnter == null ? void 0 : onEnter(node, isAppearing);
  };

  const handleExit = node => {
    removeStaticModalAnimationRef.current == null ? void 0 : removeStaticModalAnimationRef.current();
    onExit == null ? void 0 : onExit(node);
  };

  const handleEntering = (node, isAppearing) => {
    onEntering == null ? void 0 : onEntering(node, isAppearing); // FIXME: This should work even when animation is disabled.

    addEventListener(window, 'resize', handleWindowResize);
  };

  const handleExited = node => {
    if (node) node.style.display = ''; // RHL removes it sometimes

    onExited == null ? void 0 : onExited(node); // FIXME: This should work even when animation is disabled.

    removeEventListener(window, 'resize', handleWindowResize);
  };

  const renderBackdrop = useCallback(backdropProps => /*#__PURE__*/_jsx("div", { ...backdropProps,
    className: classNames(`${bsPrefix}-backdrop`, backdropClassName, !animation && 'show')
  }), [animation, backdropClassName, bsPrefix]);
  const baseModalStyle = { ...style,
    ...modalStyle
  }; // If `display` is not set to block, autoFocus inside the modal fails
  // https://github.com/react-bootstrap/react-bootstrap/issues/5102

  baseModalStyle.display = 'block';

  const renderDialog = dialogProps => /*#__PURE__*/_jsx("div", {
    role: "dialog",
    ...dialogProps,
    style: baseModalStyle,
    className: classNames(className, bsPrefix, animateStaticModal && `${bsPrefix}-static`),
    onClick: backdrop ? handleClick : undefined,
    onMouseUp: handleMouseUp,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    children: /*#__PURE__*/_jsx(Dialog, { ...props,
      onMouseDown: handleDialogMouseDown,
      className: dialogClassName,
      contentClassName: contentClassName,
      children: children
    })
  });

  return /*#__PURE__*/_jsx(ModalContext.Provider, {
    value: modalContext,
    children: /*#__PURE__*/_jsx(BaseModal, {
      show: show,
      ref: mergedRef,
      backdrop: backdrop,
      container: container,
      keyboard: true // Always set true - see handleEscapeKeyDown
      ,
      autoFocus: autoFocus,
      enforceFocus: enforceFocus,
      restoreFocus: restoreFocus,
      restoreFocusOptions: restoreFocusOptions,
      onEscapeKeyDown: handleEscapeKeyDown,
      onShow: onShow,
      onHide: onHide,
      onEnter: handleEnter,
      onEntering: handleEntering,
      onEntered: onEntered,
      onExit: handleExit,
      onExiting: onExiting,
      onExited: handleExited,
      manager: getModalManager(),
      transition: animation ? DialogTransition : undefined,
      backdropTransition: animation ? BackdropTransition : undefined,
      renderBackdrop: renderBackdrop,
      renderDialog: renderDialog
    })
  });
});
Modal.displayName = 'Modal';
Modal.defaultProps = defaultProps;
module.exportDefault(Object.assign(Modal, {
  Body: ModalBody,
  Header: ModalHeader,
  Title: ModalTitle,
  Footer: ModalFooter,
  Dialog: ModalDialog,
  TRANSITION_DURATION: 300,
  BACKDROP_TRANSITION_DURATION: 150
}));