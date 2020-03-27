import React, { Component, createContext } from 'react';
import { storeShape } from './PropTypes';
import { Store, ProviderProps } from './types';


export const MiniStoreContext = createContext<Store | null>(null);

export class Provider extends Component<ProviderProps> {
  static propTypes = {
    store: storeShape.isRequired,
  };

  render() {
    return <MiniStoreContext.Provider value={this.props.store}>{this.props.children}</MiniStoreContext.Provider>;
  }
}
