import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

/**
 * @usage
 *  - value ✓   changeHandler ✓:
 *  The state of value is lifted up in parent component and is passed as a prop. Change requests are also handled
 *  in parent component. Useful when parent component needs to intercept value changes (validation for example).
 *
 *  - value ✓   changeHandler ✗:
 *  value is controlled (forced), and it's independent of normal change mechanism provided by the component.
 *  not so common use case. A readonly control is an example of such usage.
 *
 *  - value ✗   changeHandler ✓:
 *  user just wants to get informed of changes. The value is kept
 *  as a local state in component itself, and parent component just needs to react to its changes.
 *  changeHandler here is a mere callback, it can't control value in any way.
 *
 *  - value ✗   changeHandler ✗:
 *  State is handled inside component.
 *  common use cases are for components such as a zippy, a tab view, a window, when you just want the UI functionality
 *  but you don't care about its state.
 *
 * @param value
 * @param changeHandler
 * @param initialValue
 * @param valueRef
 */

export function useControllableState<T>(
  value: T | undefined,
  changeHandler: Dispatch<SetStateAction<T>> | undefined,
  initialValue: T | (() => T),
):
  [T, Dispatch<SetStateAction<T>>] {
  const [stateValue, setState] = useState(initialValue);
  const wasControlled = usePrevious(value) === undefined;
  const isControlled = value !== undefined;
  if(isControlled !== wasControlled){

  }
  const effectiveValue = isControlled ? value : stateValue;
  return [effectiveValue, useCallback((update) => {
    setState(update);
    const newValue = isFunction(update) ? update(effectiveValue) : update;

    if (changeHandler) {
      changeHandler(newValue);
    }
  }, [changeHandler])];
}


function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function isFunction<S>(a: SetStateAction<S>): a is ((prevState: S) => S) {
  return typeof a === 'function';
}
