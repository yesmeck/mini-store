export default function create(initialState) {
  let state = initialState;
  const listeners = [];

  function setState(updater, callback) {
    if (typeof updater === 'function') {
      updater = updater(state);
    }

    state = { ...state, ...updater };
    for (let i = 0; i < listeners.length; i++) {
      listeners[i](state, callback);
    }
  }

  function getState() {
    return state;
  }

  function subscribe(listener) {
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
