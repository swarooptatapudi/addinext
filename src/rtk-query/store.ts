import { combineReducers, configureStore, Reducer } from '@reduxjs/toolkit';
// Or from '@reduxjs/toolkit/query/react'
import { setupListeners } from '@reduxjs/toolkit/query';
import { APIS_LIST } from './apis';
import userReducer from './slices/auth.slice';

const apiReducers = Object.fromEntries(APIS_LIST.map((api) => [api.reducerPath, api.reducer]));

const reducer: Reducer = combineReducers({
  // Add the generated reducer as a specific top-level slice
  userReducer,
  ...apiReducers
});
const middlewares = [...APIS_LIST.map((api) => api.middleware)];

export const store = configureStore({
  reducer,
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore RTK Query paths where Blobs/non-serializable data might exist
        ignoredActions: ['ordersApi/executeMutation/rejected'],
        ignoredActionPaths: ['payload', 'error', 'meta.arg', 'meta.baseQueryMeta'],
        ignoredPaths: APIS_LIST.map(api => api.reducerPath),
      },
    }).concat(middlewares)
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
