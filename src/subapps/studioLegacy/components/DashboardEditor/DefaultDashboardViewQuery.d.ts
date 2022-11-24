declare const DEFAULT_DASHBOARD_VIEW_QUERY =
  '# This is a simple example query\n# You can directly edit this\nprefix nxv: <https://bluebrain.github.io/nexus/vocabulary/>\nSELECT DISTINCT ?self ?s\nWHERE {\n?s nxv:self ?self\n}\nLIMIT 20';
export declare const DEFAULT_DASHBOARD_ES_VIEW_QUERY =
  '\n{\n  "query": {\n    "term": {\n      "_deprecated": false\n    }\n  }\n}';
export default DEFAULT_DASHBOARD_VIEW_QUERY;
