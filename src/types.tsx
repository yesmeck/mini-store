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

import {
  ComponentType,
  NamedExoticComponent
} from 'react';

import hoistNonReactStatics from 'hoist-non-react-statics';

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

// Omit taken from https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface StoreProp {
  store: Store;
}

export type AdvancedComponentDecorator<TProps, TOwnProps> =
  (component: ComponentType<TProps>) => NamedExoticComponent<TOwnProps>;

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

// Applies LibraryManagedAttributes (proper handling of defaultProps
// and propTypes), as well as defines WrappedComponent.
export type ConnectedComponent<
  C extends ComponentType<any>,
  P
> = NamedExoticComponent<JSX.LibraryManagedAttributes<C, P>> & hoistNonReactStatics.NonReactStatics<C> & {
  WrappedComponent: C;
};

// Injects props and removes them from the prop requirements.
// Will not pass through the injected props if they are passed in during
// render. Also adds new prop requirements from TNeedsProps.
export type InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> =
  <C extends ComponentType<Matching<TInjectedProps, GetProps<C>>>>(
      component: C
  ) => ConnectedComponent<C, Omit<GetProps<C>, keyof Shared<TInjectedProps, GetProps<C>>> & TNeedsProps>;

// Injects props and removes them from the prop requirements.
// Will not pass through the injected props if they are passed in during
// render.
export type InferableComponentEnhancer<TInjectedProps> =
  InferableComponentEnhancerWithProps<TInjectedProps, {}>;

export interface Connect {
  // tslint:disable:no-unnecessary-generics
  (): InferableComponentEnhancer<StoreProp>;

  <TStateProps = {}, TOwnProps = {}, State = DefaultRootState>(
      mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
      options?: Options,
  ): InferableComponentEnhancerWithProps<TStateProps & StoreProp, TOwnProps>;
  // tslint:enable:no-unnecessary-generics
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

export type MapStateToProps<TStateProps, TOwnProps, State = DefaultRootState> =
  (state: State, ownProps: TOwnProps) => TStateProps;

export type MapStateToPropsFactory<TStateProps, TOwnProps, State = DefaultRootState> =
  (initialState: State, ownProps: TOwnProps) => MapStateToProps<TStateProps, TOwnProps, State>;

export type MapStateToPropsParam<TStateProps, TOwnProps, State = DefaultRootState> =
  MapStateToPropsFactory<TStateProps, TOwnProps, State> | MapStateToProps<TStateProps, TOwnProps, State> | null | undefined;

export type MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps> =
  (stateProps: TStateProps, dispatchProps: TDispatchProps, ownProps: TOwnProps) => TMergedProps;

export interface Options {
  /**
   * If true, use React's forwardRef to expose a ref of the wrapped component
   *
   * @default false
   */
  forwardRef?: boolean;
}
;

export interface ProviderProps {
  store: Store;
}

/**
* This interface allows you to easily create a hook that is properly typed for your
* store's root state.
*
* @example
*
* interface RootState {
*   property: string;
* }
*
* const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
*
*/
export interface TypedUseSelectorHook<TState> {
  <TSelected>(
      selector: (state: TState) => TSelected,
      equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;
}
