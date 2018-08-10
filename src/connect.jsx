import { default as React, createElement, Component } from 'react';
import shallowEqual from 'shallowequal'
import hoistStatics from 'hoist-non-react-statics';
import { polyfill } from 'react-lifecycles-compat';
import { storeShape } from './PropTypes';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function isStateless(Component) {
  return !Component.prototype.render;
}

const defaultMapStateToProps = () => ({});

export default function connect(mapStateToProps) {
  const shouldSubscribe = !!mapStateToProps;
  const finnalMapStateToProps = mapStateToProps || defaultMapStateToProps;

  return function wrapWithConnect(WrappedComponent) {
    class Connect extends Component {
      static displayName = `Connect(${getDisplayName(WrappedComponent)})`;

      static contextTypes = {
        miniStore: storeShape.isRequired,
      };

      static getDerivedStateFromProps(props, prevState) {
        // using ownProps
        if (mapStateToProps && mapStateToProps.length === 2 && props !== prevState.props) {
          return {
            subscribed: finnalMapStateToProps(prevState.store.getState(), props),
            props,
          }
        }
        return { props };
      }

      constructor(props, context) {
        super(props, context);

        this.store = context.miniStore;
        this.state = {
          subscribed: finnalMapStateToProps(this.store.getState(), props),
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

      handleChange = () => {
        if (!this.unsubscribe) {
          return;
        }
        const nextState = finnalMapStateToProps(this.store.getState(), this.props);
        if (!shallowEqual(this.nextState, nextState)) {
          this.nextState = nextState;
          this.setState({ subscribed: nextState });
        }
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

      getWrappedInstance() {
        return this.wrappedInstance;
      }

      render() {
        let props = {
          ...this.props,
          ...this.state.subscribed,
          store: this.store,
        };

        if (!isStateless(WrappedComponent)) {
          props = {
            ...props,
            ref: (c) => this.wrappedInstance = c,
          };
        }

        return <WrappedComponent {...props}/>;
      }
    }

    polyfill(Connect);

    return hoistStatics(Connect, WrappedComponent);
  };
}
