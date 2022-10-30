module.export({default:()=>useWaitForDOMRef});module.export({resolveContainerRef:()=>resolveContainerRef},true);let ownerDocument;module.link('dom-helpers/ownerDocument',{default(v){ownerDocument=v}},0);let canUseDOM;module.link('dom-helpers/canUseDOM',{default(v){canUseDOM=v}},1);let useState,useEffect;module.link('react',{useState(v){useState=v},useEffect(v){useEffect=v}},2);let useWindow;module.link('./useWindow',{default(v){useWindow=v}},3);



const resolveContainerRef = (ref, document) => {
  var _ref;

  if (!canUseDOM) return null;
  if (ref == null) return (document || ownerDocument()).body;
  if (typeof ref === 'function') ref = ref();
  if (ref && 'current' in ref) ref = ref.current;
  if ((_ref = ref) != null && _ref.nodeType) return ref || null;
  return null;
};
function useWaitForDOMRef(ref, onResolved) {
  const window = useWindow();
  const [resolvedRef, setRef] = useState(() => resolveContainerRef(ref, window == null ? void 0 : window.document));

  if (!resolvedRef) {
    const earlyRef = resolveContainerRef(ref);
    if (earlyRef) setRef(earlyRef);
  }

  useEffect(() => {
    if (onResolved && resolvedRef) {
      onResolved(resolvedRef);
    }
  }, [onResolved, resolvedRef]);
  useEffect(() => {
    const nextRef = resolveContainerRef(ref);

    if (nextRef !== resolvedRef) {
      setRef(nextRef);
    }
  }, [ref, resolvedRef]);
  return resolvedRef;
}