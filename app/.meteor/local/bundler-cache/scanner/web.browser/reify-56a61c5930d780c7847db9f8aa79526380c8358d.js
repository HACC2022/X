let classNames;module.link('classnames',{default(v){classNames=v}},0);let useBreakpoint;module.link('@restart/hooks/useBreakpoint',{default(v){useBreakpoint=v}},1);let useEventCallback;module.link('@restart/hooks/useEventCallback',{default(v){useEventCallback=v}},2);let React;module.link('react',{"*"(v){React=v}},3);let useCallback,useContext,useEffect,useMemo,useRef,useState;module.link('react',{useCallback(v){useCallback=v},useContext(v){useContext=v},useEffect(v){useEffect=v},useMemo(v){useMemo=v},useRef(v){useRef=v},useState(v){useState=v}},4);let BaseModal;module.link('@restart/ui/Modal',{default(v){BaseModal=v}},5);let Fade;module.link('./Fade',{default(v){Fade=v}},6);let OffcanvasBody;module.link('./OffcanvasBody',{default(v){OffcanvasBody=v}},7);let OffcanvasToggling;module.link('./OffcanvasToggling',{default(v){OffcanvasToggling=v}},8);let ModalContext;module.link('./ModalContext',{default(v){ModalContext=v}},9);let NavbarContext;module.link('./NavbarContext',{default(v){NavbarContext=v}},10);let OffcanvasHeader;module.link('./OffcanvasHeader',{default(v){OffcanvasHeader=v}},11);let OffcanvasTitle;module.link('./OffcanvasTitle',{default(v){OffcanvasTitle=v}},12);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},13);let BootstrapModalManager,getSharedManager;module.link('./BootstrapModalManager',{default(v){BootstrapModalManager=v},getSharedManager(v){getSharedManager=v}},14);let _jsx;module.link("react/jsx-runtime",{jsx(v){_jsx=v}},15);let _Fragment;module.link("react/jsx-runtime",{Fragment(v){_Fragment=v}},16);let _jsxs;module.link("react/jsx-runtime",{jsxs(v){_jsxs=v}},17);

















const defaultProps = {
  show: false,
  backdrop: true,
  keyboard: true,
  scroll: false,
  autoFocus: true,
  enforceFocus: true,
  restoreFocus: true,
  placement: 'start',
  renderStaticNode: false
};

function DialogTransition(props) {
  return /*#__PURE__*/_jsx(OffcanvasToggling, { ...props
  });
}

function BackdropTransition(props) {
  return /*#__PURE__*/_jsx(Fade, { ...props
  });
}

const Offcanvas = /*#__PURE__*/React.forwardRef(({
  bsPrefix,
  className,
  children,
  'aria-labelledby': ariaLabelledby,
  placement,
  responsive,

  /* BaseModal props */
  show,
  backdrop,
  keyboard,
  scroll,
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
  renderStaticNode,
  ...props
}, ref) => {
  const modalManager = useRef();
  bsPrefix = useBootstrapPrefix(bsPrefix, 'offcanvas');
  const {
    onToggle
  } = useContext(NavbarContext) || {};
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const hideResponsiveOffcanvas = useBreakpoint(responsive || 'xs', 'up');
  useEffect(() => {
    // Handles the case where screen is resized while the responsive
    // offcanvas is shown. If `responsive` not provided, just use `show`.
    setShowOffcanvas(responsive ? show && !hideResponsiveOffcanvas : show);
  }, [show, responsive, hideResponsiveOffcanvas]);
  const handleHide = useEventCallback(() => {
    onToggle == null ? void 0 : onToggle();
    onHide == null ? void 0 : onHide();
  });
  const modalContext = useMemo(() => ({
    onHide: handleHide
  }), [handleHide]);

  function getModalManager() {
    if (propsManager) return propsManager;

    if (scroll) {
      // Have to use a different modal manager since the shared
      // one handles overflow.
      if (!modalManager.current) modalManager.current = new BootstrapModalManager({
        handleContainerOverflow: false
      });
      return modalManager.current;
    }

    return getSharedManager();
  }

  const handleEnter = (node, ...args) => {
    if (node) node.style.visibility = 'visible';
    onEnter == null ? void 0 : onEnter(node, ...args);
  };

  const handleExited = (node, ...args) => {
    if (node) node.style.visibility = '';
    onExited == null ? void 0 : onExited(...args);
  };

  const renderBackdrop = useCallback(backdropProps => /*#__PURE__*/_jsx("div", { ...backdropProps,
    className: classNames(`${bsPrefix}-backdrop`, backdropClassName)
  }), [backdropClassName, bsPrefix]);

  const renderDialog = dialogProps => /*#__PURE__*/_jsx("div", { ...dialogProps,
    ...props,
    className: classNames(className, responsive ? `${bsPrefix}-${responsive}` : bsPrefix, `${bsPrefix}-${placement}`),
    "aria-labelledby": ariaLabelledby,
    children: children
  });

  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [!showOffcanvas && (responsive || renderStaticNode) && renderDialog({}), /*#__PURE__*/_jsx(ModalContext.Provider, {
      value: modalContext,
      children: /*#__PURE__*/_jsx(BaseModal, {
        show: showOffcanvas,
        ref: ref,
        backdrop: backdrop,
        container: container,
        keyboard: keyboard,
        autoFocus: autoFocus,
        enforceFocus: enforceFocus && !scroll,
        restoreFocus: restoreFocus,
        restoreFocusOptions: restoreFocusOptions,
        onEscapeKeyDown: onEscapeKeyDown,
        onShow: onShow,
        onHide: handleHide,
        onEnter: handleEnter,
        onEntering: onEntering,
        onEntered: onEntered,
        onExit: onExit,
        onExiting: onExiting,
        onExited: handleExited,
        manager: getModalManager(),
        transition: DialogTransition,
        backdropTransition: BackdropTransition,
        renderBackdrop: renderBackdrop,
        renderDialog: renderDialog
      })
    })]
  });
});
Offcanvas.displayName = 'Offcanvas';
Offcanvas.defaultProps = defaultProps;
module.exportDefault(Object.assign(Offcanvas, {
  Body: OffcanvasBody,
  Header: OffcanvasHeader,
  Title: OffcanvasTitle
}));