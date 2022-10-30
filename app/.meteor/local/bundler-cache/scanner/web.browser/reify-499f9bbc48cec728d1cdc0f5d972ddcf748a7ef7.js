module.export({default:()=>useUpdatedRef});let useRef;module.link('react',{useRef(v){useRef=v}},0);
/**
 * Returns a ref that is immediately updated with the new value
 *
 * @param value The Ref value
 * @category refs
 */

function useUpdatedRef(value) {
  var valueRef = useRef(value);
  valueRef.current = value;
  return valueRef;
}