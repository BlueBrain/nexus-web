interface Requestable {
  results: any;
  fetching: boolean;
  error?: Error;
}

interface RequestableList extends Requestable {
  results: any[];
}

interface List extends RequestableList {
  query: {
    filters?: {
      [filterKey: string]: string[];
    };
    textQuery?: string;
  };
}

// serialize / deserialze to URL param
// maybe with middleware?
// when something inside lists changes (inisde query, the input)
// then we should update the URL with a serialied array of queries
export interface ListState {
  lists: List[];
}

const DEFAULT_LIST: List = {
  query: {},
  results: [{}],
  fetching: true,
};

const initialState: ListState = {
  lists: [DEFAULT_LIST], // Get Initial State from URL or DEFAULT_LIST
};
