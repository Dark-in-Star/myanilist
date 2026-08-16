import { configureStore } from "@reduxjs/toolkit";
import browseFiltersReducer from "./browseFiltersSlice";
import listFiltersReducer from "./listFiltersSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      listFilters: listFiltersReducer,
      browseFilters: browseFiltersReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
