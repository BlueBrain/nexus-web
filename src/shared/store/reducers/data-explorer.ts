import { createSlice } from '@reduxjs/toolkit';
import { slice, clone, dropRight, nth, last, concat } from 'lodash';

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
  limited: boolean;
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
  limited: false,
};

const calculateNewDigest = (state: TDataExplorerState) => {
  const clonedState = clone(state);
  const digest = btoa(JSON.stringify(clonedState));
  sessionStorage.setItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST, digest);
};

const isShrinkable = (links: TDELink[]) => {
  return links.length > MAX_NAVIGATION_ITEMS_IN_STACK;
};
function insert(arr: any[], index: number, item: any) {
  arr.splice(index, 0, item);
}

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
      { payload: { source, current, limited, referer } }
    ) => {
      const newState = {
        ...state,
        referer,
        current,
        limited,
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
      calculateNewDigest(newState);
      return newState;
    },
    AddNewNodeDataExplorerGraphFlow: (state, action) => {
      if (action.payload._self === state.current?._self) {
        console.log('@@same node');
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
      calculateNewDigest(newState);
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
      calculateNewDigest(newState);
      return newState;
    },
    ReturnBackDataExplorerGraphFlow: state => {
      const current = last(state.leftNodes.links) as TDELink;
      const newrightNodesLinks = state.rightNodes.links;
      const newleftNodesLinks = dropRight(state.leftNodes.links) as TDELink[];
      insert(newrightNodesLinks, 0, state.current);
      const rightNodes = {
        links: newrightNodesLinks,
        shrinked: isShrinkable(newrightNodesLinks),
      };
      const newState = {
        ...state,
        current,
        rightNodes,
        leftNodes: {
          links: newleftNodesLinks,
          shrinked: isShrinkable(newleftNodesLinks),
        },
      };
      calculateNewDigest(newState);
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
      calculateNewDigest(newState);
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
      calculateNewDigest(newState);
      return newState;
    },
    ResetDataExplorerGraphFlow: (_, action) => {
      return action.payload.initialState ?? initialState;
    },
    InitDataExplorerGraphFlowLimitedVersion: (state, action) => {
      const newState = {
        ...state,
        limited: action.payload ?? !state.limited,
      };
      calculateNewDigest(newState);
      return newState;
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
  ResetDataExplorerGraphFlow,
  InitDataExplorerGraphFlowLimitedVersion,
} = dataExplorerSlice.actions;

export default dataExplorerSlice.reducer;
