import * as React from 'react';
import shallowEqual from 'shallowequal';
import hoistStatics from 'hoist-non-react-statics';
import { MiniStoreContext } from './Provider';
import { DefaultRootState, Store, StoreProp, GetProps, Matching, ConnectedComponent } from './types';

export interface ConnectOptions {
  /**
   * If true, use React's forwardRef to expose a ref of the wrapped component
   *
   * @default false
   */
  forwardRef?: boolean;
}

/**
* Infers the type of props that a connector will inject into a component.
*/
export interface ConnectProps {
  miniStoreForwardedRef: React.Ref<any>;
}

export interface ConnectedState<TStateProps = {}, Store = {}, TOwnProps = {}> {
  subscribed: TStateProps;
  store: Store;
  props: TOwnProps,
}

function getDisplayName(WrappedComponent: React.ComponentType<any>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const defaultMapStateToProps = () => ({});

export function connect<TStateProps = {}, TOwnProps = {}, State = DefaultRootState>(
  mapStateToProps?: (state: State, ownProps: TOwnProps) => TStateProps,
  options: ConnectOptions = {},
) {
  const shouldSubscribe = !!mapStateToProps;
  const finalMapStateToProps = mapStateToProps || defaultMapStateToProps as (() => TStateProps);

  return function wrapWithConnect<
    C extends React.ComponentType<Matching<TStateProps & StoreProp<State>, GetProps<C>>>
  >(WrappedComponent: C): ConnectedComponent<C, TStateProps & StoreProp<State>, TOwnProps> {
    class Connect extends React.Component<
      TOwnProps & ConnectProps,
      ConnectedState<TStateProps, Store<State>, TOwnProps>,
      Store<State>
    > {
      static displayName = `Connect(${getDisplayName(WrappedComponent)})`;

      static contextType = MiniStoreContext;

      static getDerivedStateFromProps(
        props: TOwnProps,
        prevState: ConnectedState<TStateProps, Store<State>, TOwnProps>,
      ) {
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
        return (
          !shallowEqual(this.props, nextProps) ||
          !shallowEqual(this.state.subscribed, nextState.subscribed)
        );
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
        const props = {
          ...this.props,
          ...this.state.subscribed,
          store: this.store,
        } as any;

        return <WrappedComponent {...props} ref={this.props.miniStoreForwardedRef} />;
      }
    }

    if (options.forwardRef) {
      const forwarded = React.forwardRef((props: TOwnProps, ref) => {
        return <Connect {...props} miniStoreForwardedRef={ref} />;
      });
      return hoistStatics(forwarded, WrappedComponent) as any;
    }

    return hoistStatics(Connect, WrappedComponent) as any;
  };
}
