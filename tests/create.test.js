import { create } from '../src';

test('create', () => {
  const store = create({ foo: true });
  expect(store.getState()).toEqual({ foo: true });
});

test('setState', () => {
  const store = create({ foo: false, bar: 1 });
  store.setState({ foo: false  })
  expect(store.getState()).toEqual({ foo: false, bar: 1 });
});

test('subscribe', () => {
  const store = create({ foo: false });
  const listener1 = jest.fn();
  const listener2 = jest.fn();

  store.subscribe(listener1);
  store.subscribe(listener2)

  store.setState({ foo: false });

  expect(listener1).toBeCalled();
  expect(listener2).toBeCalled();
});
