import expect from 'expect';
import dva from 'dva';
import createLoading from '../src/index';

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

describe('dva-loading', () => {
  it('loading: with global only', done => {
    const app = dva();
    app.use(createLoading());
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *a(action, { call }) {
          yield call(delay, 100);
        },
        *b(action, { call }) {
          yield call(delay, 500);
        },
      },
    });
    app.router(() => 1);
    app.start();

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: {},
      localEffects: {}
    });
    // app._store.dispatch({ type: 'count/a', loading: false });

    // expect(app._store.getState().loading).toEqual({
    //   global: false,
    //   models: {},
    //   effects: { 'count/a': true },
    //   localEffects: { 'count/a': true }
    // });

    app._store.dispatch({ type: 'count/b' });

    expect(app._store.getState().loading).toEqual({
      global: true,
      models: { 'count': true },
      effects: { 'count/b': true },
      localEffects: {},
    });

    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({
        global: false,
        models: { count: false },
        effects: { 'count/b': false },
        localEffects: {},
      });
      done();
    }, 800);
  });

  it('loading: with local only', done => {
    const app = dva();
    app.use(createLoading());
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *a(action, { call }) {
          yield call(delay, 100);
        },
        *b(action, { call }) {
          yield call(delay, 500);
        },
      },
    });
    app.router(() => 1);
    app.start();

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: {},
      localEffects: {}
    });

    app._store.dispatch({ type: 'count/b', loading: false });

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: { 'count/b': true },
      localEffects: { 'count/b': true },
    });

    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({
        global: false,
        models: {},
        effects: { 'count/b': false },
        localEffects: {},
      });
      done();
    }, 800);
  });

  it('loading: with global and local', done => {
    const app = dva();
    app.use(createLoading());
    app.model({
      namespace: 'count',
      state: 0,
      effects: {
        *a(action, { call }) {
          yield call(delay, 100);
        },
        *b(action, { call }) {
          yield call(delay, 500);
        },
      },
    });
    app.router(() => 1);
    app.start();

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: {},
      localEffects: {}
    });
    app._store.dispatch({ type: 'count/a', loading: false });

    expect(app._store.getState().loading).toEqual({
      global: false,
      models: {},
      effects: { 'count/a': true },
      localEffects: { 'count/a': true }
    });

    app._store.dispatch({ type: 'count/b' });

    expect(app._store.getState().loading).toEqual({
      global: true,
      models: { count: true },
      effects: { 'count/a': true, 'count/b': true },
      localEffects: { 'count/a': true },
    });

    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({
        global: true,
        models: { count: true },
        effects: { 'count/a': false, 'count/b': true },
        localEffects: {},
      });
    }, 200);
    setTimeout(() => {
      expect(app._store.getState().loading).toEqual({
        global: false,
        models: { count: false },
        effects: { 'count/a': false, 'count/b': false },
        localEffects: {},
      });
      done();
    }, 800);
  });
});
