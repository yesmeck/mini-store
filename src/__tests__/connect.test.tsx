import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { create, Provider, connect } from '../index';
import { Store } from '../types';

let StatelessApp: React.FC<any>;
let Connected: any;
let store: Store<any>;
let wrapper: ReactWrapper;

class StatefulApp extends React.Component<{ msg: string, count: number }> {
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

    expect((wrapper.instance() as any).unsubscribe).toBeUndefined();
  });

  test('pass own props to mapStateToProps', () => {
    Connected = connect<{ msg: string }, { name: string }, { msg: string }>((state, props)  => ({
      msg: `${state.msg} ${props.name}`
    }))(StatelessApp);

    wrapper = mount(
      <Provider store={store}>
        <Connected name="world" />
      </Provider>
    );

    expect(wrapper.text()).toBe('hello world');
  });

  test('mapStateToProps is invoked when own props changes', () => {
    Connected = connect<{ msg: string }, { name: string }, { msg: string }>((state, props)  => ({
      msg: `${state.msg} ${props.name}`
    }))(StatelessApp);

    class App extends React.Component {
      state = {
        name: 'world'
      }

      render() {
        return (
          <div>
            <button onClick={() => this.setState({ name: 'there' })}>Click</button>
            <Connected name={this.state.name} />
          </div>
        );
      }
    }
    wrapper = mount(
      <Provider store={store}>
        <App />
      </Provider>
    );
    wrapper.find('button').simulate('click');

    expect(wrapper.find(Connected).text()).toBe('hello there');
  });

  test('mapStateToProps is not invoked when own props is not used', () => {
    const mapStateToProps = jest.fn((state) => ({ msg: state.msg }));
    Connected = connect(mapStateToProps)(StatelessApp);

    class App extends React.Component {
      state = {
        name: 'world'
      }

      render() {
        return (
          <div>
            <button onClick={() => this.setState({ name: 'there' })}>Click</button>
            <Connected name={this.state.name} />
          </div>
        );
      }
    }

    wrapper = mount(
      <Provider store={store}>
        <App />
      </Provider>
    );
    wrapper.find('button').simulate('click');
    expect(mapStateToProps).toHaveBeenCalledTimes(2);
  });

  // https://github.com/ant-design/ant-design/issues/11723
  test('rerender component when props changes', () => {
    interface Props {
      visible: boolean;
    }
    const Dummy = ({ visible }: Props) => <div>{ visible && 'hello' }</div>
    Connected = connect<Props, { ownVisible: boolean }, Props>((state, props)  => ({
      visible: state.visible === false ? props.ownVisible : state.visible
    }))(Dummy);

    class App extends React.Component {
      state = {
        visible: true,
      }
      render() {
        return (
          <div>
            <button onClick={() => this.setState({ visible: false })}>Click</button>
            <Connected ownVisible={this.state.visible} />
          </div>
        );
      }
    }

    store = create({ visible: false });
    wrapper = mount(
      <Provider store={store}>
        <App />
      </Provider>
    );
    wrapper.find('button').simulate('click');
    expect(wrapper.find(Dummy).text()).toBe('');
    store.setState({ visible: true });
    wrapper.update();
    expect(wrapper.find(Dummy).text()).toBe('hello');
  });
});

describe('stateful', () => {
  beforeEach(() => {
    Connected = connect<{ msg: string; count: number }, { msg: string }, { msg: string; count: number }>(state => state)(
      StatefulApp,
    );
    store = create({ msg: 'hello', count: 0 });
    wrapper = mount(
      <Provider store={store}>
        <Connected />
      </Provider>
    );
  });
});
