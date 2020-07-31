// Type definitions for react-redux 7.1
// Project: https://github.com/reduxjs/react-redux
// Definitions by: Qubo <https://github.com/tkqubo>,
//                 Kenzie Togami <https://github.com/kenzierocks>,
//                 Curits Layne <https://github.com/clayne11>
//                 Frank Tan <https://github.com/tansongyang>
//                 Nicholas Boll <https://github.com/nicholasboll>
//                 Dibyo Majumdar <https://github.com/mdibyo>
//                 Thomas Charlat <https://github.com/kallikrein>
//                 Valentin Descamps <https://github.com/val1984>
//                 Johann Rakotoharisoa <https://github.com/jrakotoharisoa>
//                 Anatoli Papirovski <https://github.com/apapirovski>
//                 Boris Sergeyev <https://github.com/surgeboris>
//                 Søren Bruus Frank <https://github.com/soerenbf>
//                 Jonathan Ziller <https://github.com/mrwolfz>
//                 Dylan Vann <https://github.com/dylanvann>
//                 Yuki Ito <https://github.com/Lazyuki>
//                 Kazuma Ebina <https://github.com/kazuma1989>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.0

import { ComponentType, NamedExoticComponent } from 'react';
import { NonReactStatics } from 'hoist-non-react-statics';

/**
 * This interface can be augmented by users to add default types for the root state when
 * using `react-redux`.
 * Use module augmentation to append your own type definition in a your_custom_type.d.ts file.
 * https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */
// tslint:disable-next-line:no-empty-interface
export interface DefaultRootState {}

export interface Store<S = {}> {
  setState: (state: Partial<S>) => void;
  getState: () => S;
  subscribe: (listener: () => void) => () => void;
}

export interface StoreProp<S = {}> {
  store: Store<S>;
}

/**
* A property P will be present if:
* - it is present in DecorationTargetProps
*
* Its value will be dependent on the following conditions
* - if property P is present in InjectedProps and its definition extends the definition
*   in DecorationTargetProps, then its definition will be that of DecorationTargetProps[P]
* - if property P is not present in InjectedProps then its definition will be that of
*   DecorationTargetProps[P]
* - if property P is present in InjectedProps but does not extend the
*   DecorationTargetProps[P] definition, its definition will be that of InjectedProps[P]
*/
export type Matching<InjectedProps, DecorationTargetProps> = {
  [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
      ? InjectedProps[P] extends DecorationTargetProps[P]
          ? DecorationTargetProps[P]
          : InjectedProps[P]
      : DecorationTargetProps[P];
};

/**
* a property P will be present if :
* - it is present in both DecorationTargetProps and InjectedProps
* - InjectedProps[P] can satisfy DecorationTargetProps[P]
* ie: decorated component can accept more types than decorator is injecting
*
* For decoration, inject props or ownProps are all optionally
* required by the decorated (right hand side) component.
* But any property required by the decorated component must be satisfied by the injected property.
*/
export type Shared<
  InjectedProps,
  DecorationTargetProps
  > = {
      [P in Extract<keyof InjectedProps, keyof DecorationTargetProps>]?: InjectedProps[P] extends DecorationTargetProps[P] ? DecorationTargetProps[P] : never;
  };

// Infers prop type from component C
export type GetProps<C> = C extends ComponentType<infer P> ? P : never;

export type ConnectedComponent<
    C extends ComponentType<any>,
    T,
    P
> = NamedExoticComponent<JSX.LibraryManagedAttributes<C, Omit<GetProps<C>, keyof Shared<T, GetProps<C>>> & P>> & NonReactStatics<C> & {
  WrappedComponent: C;
};
