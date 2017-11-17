import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { create, Provider } from '../src';

test('store context', (done) => {
  const store = create({});

  const App = (props, context) => {
    expect(context.miniStore).toBe(store);
    done();
    return 'hello';
  }

  App.contextTypes = {
    miniStore: PropTypes.any.isRequired,
  }

  mount(
    <Provider store={store}>
      <App />
    </Provider>
  );
});
