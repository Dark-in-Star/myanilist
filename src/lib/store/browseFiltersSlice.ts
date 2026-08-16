import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_LIST_FILTERS, type ListFilters } from "@/lib/list-filters";
import type { ListMedia } from "./listFiltersSlice";

export interface BrowseFiltersState {
  anime: ListFilters;
  manga: ListFilters;
}

const initialState: BrowseFiltersState = {
  anime: DEFAULT_LIST_FILTERS,
  manga: DEFAULT_LIST_FILTERS,
};

const browseFiltersSlice = createSlice({
  name: "browseFilters",
  initialState,
  reducers: {
    setBrowseFilters(state, action: PayloadAction<{ media: ListMedia; filters: ListFilters }>) {
      state[action.payload.media] = action.payload.filters;
    },
  },
});

export const { setBrowseFilters } = browseFiltersSlice.actions;
export default browseFiltersSlice.reducer;
