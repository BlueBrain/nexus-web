import { createSlice } from '@reduxjs/toolkit';
import { slice, omit, clone, dropRight, nth } from 'lodash';

type TProject = string;
type TOrganization = string;
type TResourceID = string;
type TVersionTag = number;
export type TDEResource = [TOrganization, TProject, TResourceID, TVersionTag];
export type TDELink = {
  _self: string;
  title: string;
  types?: string | string[];
  resource?: TDEResource;
};
export type TDataExplorerState = {
  links: TDELink[];
  current: TDELink | null;
  shrinked: boolean;
  limited: boolean;
  highlightIndex: number;
};

const initialState: TDataExplorerState = {
  links: [],
  current: null,
  shrinked: false,
  limited: false,
  highlightIndex: -1,
};

export const DATA_EXPLORER_GRAPH_FLOW_DIGEST = 'data-explorer-last-navigation';
export const MAX_NAVIGATION_ITEMS_IN_STACK = 5;
const calculateNewDigest = (state: TDataExplorerState) => {
  const clonedState = clone(state);
  const digest = btoa(
    JSON.stringify({
      ...clonedState,
      links: clonedState.links.map(i => omit(i, ['highlight'])),
      current: omit(clonedState.current, ['highlight']),
    })
  );
  localStorage.setItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST, digest);
};

const isShrinkable = (links: TDELink[]) => {
  return links.length > MAX_NAVIGATION_ITEMS_IN_STACK;
};

export const dataExplorerSlice = createSlice({
  initialState,
  name: 'data-explorer-graph-flow',
  reducers: {
    PopulateDataExplorerGraphFlow: (state, action) => {
      const digest = action.payload;
      const newState: TDataExplorerState = JSON.parse(atob(digest));
      try {
        return {
          ...newState,
          shrinked: isShrinkable(newState.links),
        };
      } catch (error) {
        return state;
      }
    },
    InitNewVisitDataExplorerGraphView: (
      state,
      { payload: { source, current, limited } }
    ) => {
      const newState = {
        ...state,
        current,
        limited,
        links:
          source && current
            ? source._self === current._self
              ? []
              : [source]
            : [],
      };
      calculateNewDigest(newState);
      return newState;
    },
    AddNewNodeDataExplorerGraphFlow: (state, action) => {
      const linkIndex = state.links.findIndex(
        item => item._self === action.payload._self
      );
      const isCurrentLink = state.current?._self === action.payload._self;
      const newLinks = isCurrentLink
        ? state.links
        : linkIndex !== -1
        ? state.links
        : [...state.links, state.current!];
      const newCurrent =
        isCurrentLink || linkIndex !== -1 ? state.current : action.payload;
      const newState: TDataExplorerState = {
        ...state,
        links: newLinks,
        current: newCurrent,
        highlightIndex: linkIndex,
        shrinked: linkIndex !== -1 ? false : isShrinkable(newLinks),
      };
      calculateNewDigest(newState);
      return newState;
    },
    JumpToNodeDataExplorerGraphFlow: (state, action) => {
      const newLinks = slice(state.links, 0, action.payload);
      const newState: TDataExplorerState = {
        ...state,
        links: newLinks,
        current: state.links[action.payload],
        shrinked: isShrinkable(newLinks),
      };
      calculateNewDigest(newState);
      return newState;
    },
    ReturnBackDataExplorerGraphFlow: state => {
      const lastItem = state.links.length ? nth(state.links, -1) : null;
      const newLinks = dropRight(state.links);
      const newState = lastItem
        ? {
            ...state,
            links: newLinks,
            current: lastItem,
            shrinked: isShrinkable(newLinks),
          }
        : state;
      calculateNewDigest(newState);
      return newState;
    },
    ExpandNavigationStackDataExplorerGraphFlow: state => {
      const newState = {
        ...state,
        shrinked: false,
      };
      calculateNewDigest(newState);
      return newState;
    },
    ShrinkNavigationStackDataExplorerGraphFlow: state => {
      const newState = {
        ...state,
        shrinked: isShrinkable(state.links) ? true : false,
      };
      calculateNewDigest(newState);
      return newState;
    },
    ResetDataExplorerGraphFlow: (state, action) => {
      return action.payload.initialState ?? initialState;
    },
    ResetHighlightedNodeDataExplorerGraphFlow: state => {
      return {
        ...state,
        highlightIndex: -1,
      };
    },
  },
});
export const {
  PopulateDataExplorerGraphFlow,
  InitNewVisitDataExplorerGraphView,
  AddNewNodeDataExplorerGraphFlow,
  JumpToNodeDataExplorerGraphFlow,
  ExpandNavigationStackDataExplorerGraphFlow,
  ShrinkNavigationStackDataExplorerGraphFlow,
  ReturnBackDataExplorerGraphFlow,
  ResetDataExplorerGraphFlow,
  ResetHighlightedNodeDataExplorerGraphFlow,
} = dataExplorerSlice.actions;

export default dataExplorerSlice.reducer;
