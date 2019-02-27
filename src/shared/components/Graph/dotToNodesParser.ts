export interface Attribute {
  eq: string;
  id: 'label';
  type: 'attr';
}

export interface Edge {
  id: string;
  type: 'node_id';
}

export interface EdgeStatement {
  attr_list: Attribute[];
  edge_list: Edge[];
  type: 'edge_stmt';
}

export interface ParsedDotObject {
  children: EdgeStatement[];
  type: 'digraph';
}

export interface NodeEdgeCollection {
  nodes: {
    id: string;
  }[];
  edges: {
    source: string;
    label: string;
    target: string;
  }[];
}

export default (dotObject: ParsedDotObject): NodeEdgeCollection => {
  return dotObject.children.reduce(
    (collections: NodeEdgeCollection, statements: EdgeStatement) => {
      return collections;
    },
    {
      nodes: [],
      edges: [],
    }
  );
};
