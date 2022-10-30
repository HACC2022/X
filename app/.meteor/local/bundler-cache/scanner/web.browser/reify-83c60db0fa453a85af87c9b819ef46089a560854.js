module.export({SSRProvider:()=>$704cf1d3b684cc5c$export$9f8ac96af4b1b2ae,useSSRSafeId:()=>$704cf1d3b684cc5c$export$619500959fc48b26,useIsSSR:()=>$704cf1d3b684cc5c$export$535bd6ca7f90a273});let $89yE2$react,$89yE2$useContext,$89yE2$useMemo,$89yE2$useState,$89yE2$useLayoutEffect;module.link("react",{default(v){$89yE2$react=v},useContext(v){$89yE2$useContext=v},useMemo(v){$89yE2$useMemo=v},useState(v){$89yE2$useState=v},useLayoutEffect(v){$89yE2$useLayoutEffect=v}},0);


// Default context value to use in case there is no SSRProvider. This is fine for
// client-only apps. In order to support multiple copies of React Aria potentially
// being on the page at once, the prefix is set to a random number. SSRProvider
// will reset this to zero for consistency between server and client, so in the
// SSR case multiple copies of React Aria is not supported.
const $704cf1d3b684cc5c$var$defaultContext = {
    prefix: String(Math.round(Math.random() * 10000000000)),
    current: 0
};
const $704cf1d3b684cc5c$var$SSRContext = /*#__PURE__*/ $89yE2$react.createContext($704cf1d3b684cc5c$var$defaultContext);
function $704cf1d3b684cc5c$export$9f8ac96af4b1b2ae(props) {
    let cur = $89yE2$useContext($704cf1d3b684cc5c$var$SSRContext);
    let value = $89yE2$useMemo(()=>({
            // If this is the first SSRProvider, start with an empty string prefix, otherwise
            // append and increment the counter.
            prefix: cur === $704cf1d3b684cc5c$var$defaultContext ? '' : `${cur.prefix}-${++cur.current}`,
            current: 0
        })
    , [
        cur
    ]);
    return(/*#__PURE__*/ $89yE2$react.createElement($704cf1d3b684cc5c$var$SSRContext.Provider, {
        value: value
    }, props.children));
}
let $704cf1d3b684cc5c$var$canUseDOM = Boolean(typeof window !== 'undefined' && window.document && window.document.createElement);
function $704cf1d3b684cc5c$export$619500959fc48b26(defaultId) {
    let ctx = $89yE2$useContext($704cf1d3b684cc5c$var$SSRContext);
    // If we are rendering in a non-DOM environment, and there's no SSRProvider,
    // provide a warning to hint to the developer to add one.
    if (ctx === $704cf1d3b684cc5c$var$defaultContext && !$704cf1d3b684cc5c$var$canUseDOM) console.warn('When server rendering, you must wrap your application in an <SSRProvider> to ensure consistent ids are generated between the client and server.');
    return $89yE2$useMemo(()=>defaultId || `react-aria${ctx.prefix}-${++ctx.current}`
    , [
        defaultId
    ]);
}
function $704cf1d3b684cc5c$export$535bd6ca7f90a273() {
    let cur = $89yE2$useContext($704cf1d3b684cc5c$var$SSRContext);
    let isInSSRContext = cur !== $704cf1d3b684cc5c$var$defaultContext;
    let [isSSR, setIsSSR] = $89yE2$useState(isInSSRContext);
    // If on the client, and the component was initially server rendered,
    // then schedule a layout effect to update the component after hydration.
    if (typeof window !== 'undefined' && isInSSRContext) // This if statement technically breaks the rules of hooks, but is safe
    // because the condition never changes after mounting.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    $89yE2$useLayoutEffect(()=>{
        setIsSSR(false);
    }, []);
    return isSSR;
}





//# sourceMappingURL=module.js.map
