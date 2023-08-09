import {
  createListenerMiddleware,
  createSlice,
  isAnyOf,
} from '@reduxjs/toolkit';
import {
  slice,
  clone,
  dropRight,
  nth,
  last,
  concat,
  first,
  drop,
} from 'lodash';

type TProject = string;
type TOrganization = string;
type TResourceID = string;
type TVersionTag = number;
type TMediaType = string;

export type TDEResourceWithoutMedia = [
  TOrganization,
  TProject,
  TResourceID,
  TVersionTag
];
export type TDEResourceWithMedia = [
  TOrganization,
  TProject,
  TResourceID,
  TVersionTag,
  TMediaType
];
export type TDEResource = TDEResourceWithoutMedia | TDEResourceWithMedia;

export type TDELink = {
  _self: string;
  title: string;
  types?: string | string[];
  resource?: TDEResource;
  isDownloadable?: boolean;
};

export type TDataExplorerState = {
  leftNodes: {
    links: TDELink[];
    shrinked: boolean;
  };
  rightNodes: {
    links: TDELink[];
    shrinked: boolean;
  };
  current: TDELink | null;
  referer?: {
    pathname: string;
    search: string;
    state: Record<string, any>;
  } | null;
  fullscreen: boolean;
  origin?: string;
};

export type TNavigationStackSide = 'left' | 'right';
export const DATA_EXPLORER_GRAPH_FLOW_PATH = '/data-explorer/graph-flow';
export const DATA_EXPLORER_GRAPH_FLOW_DIGEST = 'data-explorer-last-navigation';
export const MAX_NAVIGATION_ITEMS_IN_STACK = 3;

const initialState: TDataExplorerState = {
  leftNodes: { links: [], shrinked: false },
  rightNodes: { links: [], shrinked: false },
  current: null,
  referer: null,
  fullscreen: false,
  origin: '',
};

const calculateDateExplorerGraphFlowDigest = (state: TDataExplorerState) => {
  const clonedState = clone(state);
  const digest = btoa(JSON.stringify(clonedState));
  sessionStorage.setItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST, digest);
};

const isShrinkable = (links: TDELink[]) => {
  return links.length > MAX_NAVIGATION_ITEMS_IN_STACK;
};

const DataExplorerFlowSliceName = 'data-explorer-graph-flow';
const DataExplorerFlowSliceListener = createListenerMiddleware();

export const dataExplorerSlice = createSlice({
  initialState,
  name: DataExplorerFlowSliceName,
  reducers: {
    PopulateDataExplorerGraphFlow: (state, action) => {
      const digest = action.payload;
      const newState: TDataExplorerState = JSON.parse(atob(digest));
      try {
        return {
          ...newState,
          leftNodes: {
            links: newState.leftNodes.links,
            shrinked: isShrinkable(newState.leftNodes.links),
          },
          rightNodes: {
            links: newState.rightNodes.links,
            shrinked: isShrinkable(newState.rightNodes.links),
          },
        };
      } catch (error) {
        return state;
      }
    },
    InitNewVisitDataExplorerGraphView: (
      state,
      { payload: { source, current, fullscreen, referer } }
    ) => {
      const newState = {
        ...state,
        referer,
        current,
        fullscreen,
        leftNodes: {
          links:
            source && current
              ? source._self === current._self
                ? []
                : [source]
              : [],
          shrinked: false,
        },
      };
      calculateDateExplorerGraphFlowDigest(newState);
      return newState;
    },
    AddNewNodeDataExplorerGraphFlow: (state, action) => {
      if (action.payload._self === state.current?._self) {
        return state;
      }
      const newLink = action.payload as TDELink;
      const whichSide = state.leftNodes.links.find(
        link => link._self === newLink._self
      )
        ? 'left'
        : state.rightNodes.links.find(link => link._self === newLink._self)
        ? 'right'
        : null;
      let leftNodesLinks: TDELink[] = [];
      let rightNodesLinks: TDELink[] = [];
      let current: TDELink;
      switch (whichSide) {
        case 'left': {
          const index = state.leftNodes.links.findIndex(
            link => link._self === newLink._self
          );
          rightNodesLinks = concat(
            slice(state.leftNodes.links, index + 1),
            state.current ? [state.current] : [],
            state.rightNodes.links
          );
          leftNodesLinks = slice(state.leftNodes.links, 0, index);
          current = state.leftNodes.links[index];
          break;
        }
        case 'right': {
          const index = state.rightNodes.links.findIndex(
            link => link._self === newLink._self
          );
          // make the new link the current one
          // add the links before that and the current one the left part
          leftNodesLinks = concat(
            state.leftNodes.links,
            state.current ? [state.current] : [],
            slice(state.rightNodes.links, 0, index)
          );
          rightNodesLinks = slice(state.rightNodes.links, index + 1);
          current = state.rightNodes.links[index];
          break;
        }
        case null:
        default: {
          leftNodesLinks = concat(
            state.leftNodes.links,
            state.current ? [state.current] : []
          );
          rightNodesLinks = [];
          current = action.payload;
          break;
        }
      }
      const newState = {
        ...state,
        current,
        leftNodes: {
          links: leftNodesLinks,
          shrinked: isShrinkable(leftNodesLinks),
        },
        rightNodes: {
          links: rightNodesLinks,
          shrinked: isShrinkable(rightNodesLinks),
        },
      };
      return newState;
    },
    JumpToNodeDataExplorerGraphFlow: (state, action) => {
      const index = action.payload.index as number;
      const side = action.payload.side as TNavigationStackSide;
      const realIndex =
        side === 'left' ? index : state.leftNodes.links.length + index + 1;
      const allLinks = concat(
        state.leftNodes.links,
        state.current ? [state.current] : [],
        state.rightNodes.links
      );
      const current = nth(allLinks, realIndex) as TDELink;
      // construct left part
      const leftNodesLinks = slice(allLinks, 0, realIndex);
      const leftNodes = {
        links: leftNodesLinks,
        shrinked: isShrinkable(leftNodesLinks),
      };
      // construct right part
      const rightNodesLinks = slice(allLinks, realIndex + 1);
      const rightNodes = {
        links: rightNodesLinks,
        shrinked: isShrinkable(rightNodesLinks),
      };
      const newState = {
        ...state,
        leftNodes,
        rightNodes,
        current,
      };
      return newState;
    },
    ReturnBackDataExplorerGraphFlow: state => {
      const newCurrent = last(state.leftNodes.links) as TDELink;
      const current = state.current;
      const newRightNodesLinks = concat(
        current ? [current] : [],
        state.rightNodes.links
      );
      const newLeftNodesLinks = dropRight(state.leftNodes.links) as TDELink[];
      const rightNodes = {
        links: newRightNodesLinks,
        shrinked: isShrinkable(newRightNodesLinks),
      };
      const leftNodes = {
        links: newLeftNodesLinks,
        shrinked: isShrinkable(newLeftNodesLinks),
      };
      const newState = {
        ...state,
        rightNodes,
        leftNodes,
        current: newCurrent,
      };
      return newState;
    },
    MoveForwardDataExplorerGraphFlow: state => {
      const newCurrent = first(state.rightNodes.links) as TDELink;
      const current = state.current;
      const newLeftNodesLinks = concat(
        state.leftNodes.links,
        current ? [current] : []
      );
      const newRightNodesLinks = drop(state.rightNodes.links) as TDELink[];
      const rightNodes = {
        links: newRightNodesLinks,
        shrinked: isShrinkable(newRightNodesLinks),
      };
      const leftNodes = {
        links: newLeftNodesLinks,
        shrinked: isShrinkable(newLeftNodesLinks),
      };
      const newState = {
        ...state,
        rightNodes,
        leftNodes,
        current: newCurrent,
      };
      return newState;
    },
    ExpandNavigationStackDataExplorerGraphFlow: (state, action) => {
      const side = action.payload.side as TNavigationStackSide;
      const sideUpdater =
        side === 'left'
          ? {
              leftNodes: {
                ...state.leftNodes,
                shrinked: false,
              },
            }
          : {
              rightNodes: {
                ...state.rightNodes,
                shrinked: false,
              },
            };
      const newState = {
        ...state,
        ...sideUpdater,
      };
      return newState;
    },
    ShrinkNavigationStackDataExplorerGraphFlow: (state, action) => {
      const side = action.payload.side as TNavigationStackSide;
      const sideUpdater =
        side === 'left'
          ? {
              leftNodes: {
                ...state.leftNodes,
                shrinked: isShrinkable(state.leftNodes.links) ? true : false,
              },
            }
          : {
              rightNodes: {
                ...state.rightNodes,
                shrinked: isShrinkable(state.rightNodes.links) ? true : false,
              },
            };
      const newState = {
        ...state,
        ...sideUpdater,
      };
      return newState;
    },
    ResetDataExplorerGraphFlow: (state, action) => {
      return (
        action.payload.initialState ?? {
          ...initialState,
          origin: state.origin,
        }
      );
    },
    InitDataExplorerGraphFlowFullscreenVersion: (
      state,
      { payload: { fullscreen } }: { payload: { fullscreen?: boolean } }
    ) => {
      const newState = {
        ...state,
        fullscreen: fullscreen ?? !state.fullscreen,
      };
      return newState;
    },
    UpdateDataExplorerOrigin: (state, action) => {
      return {
        ...state,
        origin: action.payload,
      };
    },
  },
});

export const {
  PopulateDataExplorerGraphFlow,
  InitNewVisitDataExplorerGraphView,
  AddNewNodeDataExplorerGraphFlow,
  ExpandNavigationStackDataExplorerGraphFlow,
  ShrinkNavigationStackDataExplorerGraphFlow,
  JumpToNodeDataExplorerGraphFlow,
  ReturnBackDataExplorerGraphFlow,
  MoveForwardDataExplorerGraphFlow,
  ResetDataExplorerGraphFlow,
  InitDataExplorerGraphFlowFullscreenVersion,
  UpdateDataExplorerOrigin,
} = dataExplorerSlice.actions;

const DataExplorerMiddlewareMatcher = isAnyOf(
  InitNewVisitDataExplorerGraphView,
  AddNewNodeDataExplorerGraphFlow,
  ExpandNavigationStackDataExplorerGraphFlow,
  ShrinkNavigationStackDataExplorerGraphFlow,
  JumpToNodeDataExplorerGraphFlow,
  ReturnBackDataExplorerGraphFlow,
  MoveForwardDataExplorerGraphFlow,
  InitDataExplorerGraphFlowFullscreenVersion
);
export {
  DataExplorerFlowSliceName,
  DataExplorerMiddlewareMatcher,
  DataExplorerFlowSliceListener,
  calculateDateExplorerGraphFlowDigest,
};
export default dataExplorerSlice.reducer;
