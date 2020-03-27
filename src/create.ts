import { Store } from './types';

export interface Listener {
  (): void;
}


export function create<S = {}>(initialState: S): Store<S> {
  let state = initialState;
  const listeners: Listener[] = [];

  function setState(partial: Partial<S>) {
    state = { ...state, ...partial };
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]();
    }
  }

  function getState() {
    return state;
  }

  function subscribe(listener: Listener) {
    listeners.push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  return {
    setState,
    getState,
    subscribe,
  };
}
