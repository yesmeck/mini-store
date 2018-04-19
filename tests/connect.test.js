import React from 'react';
import { mount } from 'enzyme';
import { create, Provider, connect } from '../src';

let StatelessApp;
let Connected;
let store;
let wrapper;

class StatefulApp extends React.Component {
  render() {
    return (
      <div>{this.props.msg}</div>
    );
  }
}

describe('stateless', () => {
  beforeEach(() => {
    StatelessApp = ({ msg }) => <div>{msg}</div>;

    Connected = connect(state  => state)(StatelessApp);
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

  test('should not keep reference to wrappedComponent', () => {
    expect(wrapper.find('Connect(StatelessApp)').instance().getWrappedInstance()).toBeUndefined();
  });

  test('on rerender when unsubscribed state changes', () => {
    store.setState({ count: 1 });

    expect(wrapper.text()).toBe('hello');
  });

  test('do not subscribe', () => {
    Connected = connect()(StatelessApp);

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
    }))(StatelessApp);

    wrapper = mount(
      <Provider store={store}>
        <Connected name="world" />
      </Provider>
    );

    expect(wrapper.text()).toBe('hello world');
  });
});

describe('stateful', () => {
  beforeEach(() => {
    Connected = connect(state  => state)(StatefulApp);
    store = create({ msg: 'hello', count: 0 });
    wrapper = mount(
      <Provider store={store}>
        <Connected />
      </Provider>
    );
  });

  test('should keep reference to wrappedComponent', () => {
    expect(wrapper.find('Connect(StatefulApp)').instance().getWrappedInstance()).toBeTruthy();
  });
});
