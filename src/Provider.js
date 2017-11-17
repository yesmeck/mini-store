import React, { Component, Children } from 'react';
import { storeShape } from './PropTypes';

export default class Provider extends Component {
  static propTypes = {
    store: storeShape.isRequired,
  }

  static childContextTypes = {
    miniStore: storeShape.isRequired,
  }

  getChildContext() {
    return {
      miniStore: this.props.store,
    };
  }

  render() {
    return Children.only(this.props.children)
  }
}
