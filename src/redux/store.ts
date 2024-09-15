import { UnknownAction, combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  PersistConfig,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import priceReducer, { PriceState } from './slices/price'
import tokenReducer, { TokenState } from './slices/token'
import userReducer, { UserState } from './slices/user'
import walletReducer, { WalletState } from './slices/wallet'

const persistConfig: PersistConfig<
  {
    wallet: WalletState
    token: TokenState
    price: PriceState
    user: UserState
  },
  UnknownAction
> = {
  key: 'root',
  storage,
  debug: false,
  blacklist: ['wallet']
}

const rootReducer = combineReducers({
  wallet: walletReducer,
  token: tokenReducer,
  price: priceReducer,
  user: userReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.store = store
