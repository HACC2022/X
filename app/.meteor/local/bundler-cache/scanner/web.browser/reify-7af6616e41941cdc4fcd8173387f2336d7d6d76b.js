module.export({default:()=>useWindow});module.export({WindowProvider:()=>WindowProvider},true);let createContext,useContext;module.link('react',{createContext(v){createContext=v},useContext(v){useContext=v}},0);let canUseDOM;module.link('dom-helpers/canUseDOM',{default(v){canUseDOM=v}},1);

const Context = /*#__PURE__*/createContext(canUseDOM ? window : undefined);
const WindowProvider = Context.Provider;
/**
 * The document "window" placed in React context. Helpful for determining
 * SSR context, or when rendering into an iframe.
 *
 * @returns the current window
 */

function useWindow() {
  return useContext(Context);
}