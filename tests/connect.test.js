import React from 'react';
import { mount } from 'enzyme';
import { create, Provider, connect } from '../src';

let App;
let Connected;
let store;
let wrapper;

beforeEach(() => {
  App = ({ msg }) => msg;
  Connected = connect(state  => state)(App);
  store = create({ msg: 'hello', count: 0 });
  wrapper = mount(
    <Provider store={store}>
      <Connected />
    </Provider>
  );
});

test('map state to props', () => {
  expect(wrapper.text()).toBe('hello');
});

test('renrender as subscribed state changes', () => {
  store.setState({ msg: 'halo' })

  expect(wrapper.text()).toBe('halo');
});

test('on rerender when unsubscribed state changes', () => {
  store.setState({ count: 1 });

  expect(wrapper.text()).toBe('hello');
});

test('do not subscribe', () => {
  Connected = connect()(App);

  wrapper = mount(
    <Provider store={store}>
      <Connected msg="hello" />
    </Provider>
  );

  expect(wrapper.instance().unsubscribe).toBeUndefined();
});

test('pass own props to mapStateToProps', () => {
  Connected = connect((state, props)  => ({
    msg: `${state.msg} ${props.name}`
  }))(App);

  wrapper = mount(
    <Provider store={store}>
      <Connected name="world" />
    </Provider>
  );

  expect(wrapper.text()).toBe('hello world');
});
