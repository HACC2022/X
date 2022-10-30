module.export({default:()=>useMergeStateFromProps});let useMergeState;module.link('./useMergeState',{default(v){useMergeState=v}},0);
function useMergeStateFromProps(props, gDSFP, initialState) {
  var _useMergeState = useMergeState(initialState),
      state = _useMergeState[0],
      setState = _useMergeState[1];

  var nextState = gDSFP(props, state);
  if (nextState !== null) setState(nextState);
  return [state, setState];
}