import React, { useContext } from 'react';
import { mount } from 'enzyme';
import { create, Provider } from '../index';
import { MiniStoreContext } from '../Provider';

test('store context', (done) => {
  const store = create({});

  const App = () => {
    const contextStore = useContext(MiniStoreContext);
    expect(contextStore).toBe(store);
    done();
    return <div>hello</div>;
  }

  mount(
    <Provider store={store}>
      <App />
    </Provider>
  );
});
