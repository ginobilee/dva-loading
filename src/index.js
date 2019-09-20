const SHOW = '@@DVA_LOADING/SHOW';
const HIDE = '@@DVA_LOADING/HIDE';
const NAMESPACE = 'loading';

function createLoading(opts = {}) {
  const namespace = opts.namespace || NAMESPACE;

  const { only = [], except = [] } = opts;
  if (only.length > 0 && except.length > 0) {
    throw Error('It is ambiguous to configurate `only` and `except` items at the same time.');
  }

  const initialState = {
    global: false,
    models: {},
    effects: {},
    localEffects: {},
  };

  const extraReducers = {
    [namespace](state = initialState, { type, payload }) {
      const { namespace, actionType, loading } = payload || {};
      let ret;
      switch (type) {
        case SHOW:
          const effects = { ...state.effects, [actionType]: true };
          // 如果影响全局的 loading，则更改model和global; 否则只更改 effect
          if (loading) {
            ret = {
              ...state,
              global: true,
              models: { ...state.models, [namespace]: true },
              effects,
            };
          } else {
            const localEffects = { ...state.localEffects, [actionType]: true }
            ret = { ...state, effects, localEffects };
          }
          break;
        case HIDE: {
          const effects = { ...state.effects, [actionType]: false };
          if (!loading) {
            const localEffects = { ...state.localEffects };
            delete localEffects[actionType];
            ret = { ...state, effects, localEffects };
          } else {
            const { localEffects } = state;
            const models = {
              ...state.models,
              [namespace]: Object.keys(effects).some(_actionType => {
                const _namespace = _actionType.split('/')[0];
                if (_namespace !== namespace) return false;
                if (localEffects[_actionType]) return false;
                return effects[_actionType];
              }),
            };
            const global = Object.keys(models).some(namespace => {
              return models[namespace];
            });
            ret = {
              ...state,
              global,
              models,
              effects,
            };
          }
          break;
        }
        default:
          ret = state;
          break;
      }
      return ret;
    },
  };

  function onEffect(effect, { put }, model, actionType) {
    const { namespace } = model;
    if (
      (only.length === 0 && except.length === 0) ||
      (only.length > 0 && only.indexOf(actionType) !== -1) ||
      (except.length > 0 && except.indexOf(actionType) === -1)
    ) {
      return function* (...args) {
        const loading = args[0].loading !== false;
        yield put({ type: SHOW, payload: { namespace, actionType, loading } });
        yield effect(...args);
        yield put({ type: HIDE, payload: { namespace, actionType, loading } });
      };
    } else {
      return effect;
    }
  }

  return {
    extraReducers,
    onEffect,
  };
}

export default createLoading;
