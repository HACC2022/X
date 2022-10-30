let useCallback;module.link('react',{useCallback(v){useCallback=v}},0);let useMounted;module.link('./useMounted',{default(v){useMounted=v}},1);


function useSafeState(state) {
  var isMounted = useMounted();
  return [state[0], useCallback(function (nextState) {
    if (!isMounted()) return;
    return state[1](nextState);
  }, [isMounted, state[1]])];
}

module.exportDefault(useSafeState);