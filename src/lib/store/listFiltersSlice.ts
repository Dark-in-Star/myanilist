import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_LIST_FILTERS, type ListFilters } from "@/lib/list-filters";

export type ListMedia = "anime" | "manga";

export interface ListBrowserState {
  status: string;
  type: string;
  sort: string;
  filters: ListFilters;
  query: string;
}

function createDefaultBrowserState(): ListBrowserState {
  return {
    status: "all",
    type: "all",
    sort: "title",
    filters: DEFAULT_LIST_FILTERS,
    query: "",
  };
}

export interface ListFiltersState {
  anime: ListBrowserState;
  manga: ListBrowserState;
}

const initialState: ListFiltersState = {
  anime: createDefaultBrowserState(),
  manga: createDefaultBrowserState(),
};

const listFiltersSlice = createSlice({
  name: "listFilters",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<{ media: ListMedia; status: string }>) {
      state[action.payload.media].status = action.payload.status;
    },
    setType(state, action: PayloadAction<{ media: ListMedia; type: string }>) {
      state[action.payload.media].type = action.payload.type;
    },
    setSort(state, action: PayloadAction<{ media: ListMedia; sort: string }>) {
      state[action.payload.media].sort = action.payload.sort;
    },
    setFilters(state, action: PayloadAction<{ media: ListMedia; filters: ListFilters }>) {
      state[action.payload.media].filters = action.payload.filters;
    },
    setQuery(state, action: PayloadAction<{ media: ListMedia; query: string }>) {
      state[action.payload.media].query = action.payload.query;
    },
    clearSearchAndFilters(state, action: PayloadAction<{ media: ListMedia }>) {
      state[action.payload.media].filters = DEFAULT_LIST_FILTERS;
      state[action.payload.media].query = "";
    },
  },
});

export const { setStatus, setType, setSort, setFilters, setQuery, clearSearchAndFilters } = listFiltersSlice.actions;
export default listFiltersSlice.reducer;
