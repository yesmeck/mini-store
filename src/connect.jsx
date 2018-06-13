import { default as React, createElement, Component } from 'react';
import shallowEqual from 'shallowequal'
import hoistStatics from 'hoist-non-react-statics';
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

      constructor(props, context) {
        super(props, context);

        this.store = context.miniStore;
        this.state = { subscribed: finnalMapStateToProps(this.store.getState(), props) };
      }

      componentDidMount() {
        this.trySubscribe();
      }

      componentWillUnmount() {
        this.tryUnsubscribe();
      }

      handleChange = (state, callback) => {
        if (!this.unsubscribe) {
          return;
        }

        const nextState = finnalMapStateToProps(state, this.props);
        if (!shallowEqual(this.nextState, nextState)) {
          this.nextState = nextState;
          this.setState({ subscribed: nextState }, callback);
        }
      };

      trySubscribe() {
        if (shouldSubscribe) {
          this.unsubscribe = this.store.subscribe(this.handleChange);
          this.handleChange(this.store.getState());
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

    return hoistStatics(Connect, WrappedComponent);
  };
}
