import {
  type ThunkMiddleware,
  type Tuple,
  type UnknownAction,
  type configureStore
} from '@reduxjs/toolkit';

import { type authApi, type authReducer } from '~/modules/auth/auth.js';
import { type storageApi } from '~/modules/storage/storage.js';

type RootReducer = {
  auth: ReturnType<typeof authReducer>;
};

type ExtraArguments = {
  authApi: typeof authApi;
  storageApi: typeof storageApi;
};

type StoreInstance = ReturnType<
  typeof configureStore<
    RootReducer,
    UnknownAction,
    Tuple<[ThunkMiddleware<RootReducer, UnknownAction, ExtraArguments>]>
  >
>;

type StorePackage = {
  extraArguments: ExtraArguments;
};

export { type ExtraArguments, type StoreInstance, type StorePackage };
