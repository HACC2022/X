module.export({default:()=>useOverlayOffset});let useMemo,useRef;module.link('react',{useMemo(v){useMemo=v},useRef(v){useRef=v}},0);let hasClass;module.link('dom-helpers/hasClass',{default(v){hasClass=v}},1);let useBootstrapPrefix;module.link('./ThemeProvider',{useBootstrapPrefix(v){useBootstrapPrefix=v}},2);let Popover;module.link('./Popover',{default(v){Popover=v}},3);


 // This is meant for internal use.
// This applies a custom offset to the overlay if it's a popover.

function useOverlayOffset(customOffset) {
  const overlayRef = useRef(null);
  const popoverClass = useBootstrapPrefix(undefined, 'popover');
  const offset = useMemo(() => ({
    name: 'offset',
    options: {
      offset: () => {
        if (overlayRef.current && hasClass(overlayRef.current, popoverClass)) {
          return customOffset || Popover.POPPER_OFFSET;
        }

        return customOffset || [0, 0];
      }
    }
  }), [customOffset, popoverClass]);
  return [overlayRef, [offset]];
}