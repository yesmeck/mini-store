import * as React from 'react';
import { Store, ProviderProps } from './types';

export const MiniStoreContext = React.createContext<Store | null>(null);

export class Provider extends React.Component<ProviderProps> {
  render() {
    return (
      <MiniStoreContext.Provider value={this.props.store}>
        {this.props.children}
      </MiniStoreContext.Provider>
    );
  }
}
