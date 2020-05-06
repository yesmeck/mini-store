import { default as React, Component } from 'react';
import shallowEqual from 'shallowequal';
import hoistStatics from 'hoist-non-react-statics';
import { polyfill } from 'react-lifecycles-compat';
import { MiniStoreContext } from './Provider';
import { Store, MapStateToProps, DefaultRootState, Options, ConnectedState, ConnectProps } from './types';

function getDisplayName(WrappedComponent: React.ComponentType<any>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const defaultMapStateToProps = () => ({});

export function connect<TStateProps = {}, TOwnProps = {}, State = DefaultRootState>(
  mapStateToProps?: MapStateToProps<TStateProps, TOwnProps, State>,
  options: Options = {},
) {
  const shouldSubscribe = !!mapStateToProps;
  const finalMapStateToProps = mapStateToProps || defaultMapStateToProps;

  return function wrapWithConnect(WrappedComponent: React.ComponentType<any>) {
    class Connect extends Component<
      TOwnProps & ConnectProps,
      ConnectedState<{}, Store<State>, {}>,
      Store
    > {
      static displayName = `Connect(${getDisplayName(WrappedComponent)})`;

      static contextType = MiniStoreContext;

      static getDerivedStateFromProps(props: TOwnProps, prevState: ConnectedState<{}, Store<State>, {}>) {
        // using ownProps
        if (mapStateToProps && mapStateToProps.length === 2 && props !== prevState.props) {
          return {
            subscribed: finalMapStateToProps(prevState.store.getState(), props),
            props,
          };
        }
        return { props };
      }

      store: Store<State>;
      unsubscribe: (() => void) | null = null;
      declare context: Store<State>;

      constructor(props: TOwnProps & ConnectProps, context: Store<State>) {
        super(props, context);

        this.store = this.context!;

        this.state = {
          subscribed: finalMapStateToProps(this.store.getState(), props),
          store: this.store,
          props,
        };
      }

      componentDidMount() {
        this.trySubscribe();
      }

      componentWillUnmount() {
        this.tryUnsubscribe();
      }

      shouldComponentUpdate(nextProps: ConnectProps, nextState: ConnectedState<any, any, any>) {
        return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state.subscribed, nextState.subscribed);
      }

      handleChange = () => {
        if (!this.unsubscribe) {
          return;
        }
        const nextState = finalMapStateToProps(this.store.getState(), this.props);
        this.setState({ subscribed: nextState });
      };

      trySubscribe() {
        if (shouldSubscribe) {
          this.unsubscribe = this.store.subscribe(this.handleChange);
          this.handleChange();
        }
      }

      tryUnsubscribe() {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      }

      render() {
        let props = {
          ...this.props,
          ...this.state.subscribed,
          store: this.store,
        };

        return <WrappedComponent {...props} ref={this.props.miniStoreForwardedRef} />;
      }
    }

    polyfill(Connect);

    if (options.forwardRef) {
      const forwarded = React.forwardRef((props: TOwnProps, ref) => {
        return <Connect {...props} miniStoreForwardedRef={ref} />;
      });
      return hoistStatics(forwarded, WrappedComponent);
    }
    return hoistStatics(Connect, WrappedComponent);
  };
}
