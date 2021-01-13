const DEFAULT_DASHBOARD_VIEW_QUERY = `# This is a simple example query
# You can directly edit this
prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/>
SELECT DISTINCT ?self ?s
WHERE {
?s nxv:self ?self
}
LIMIT 20`;

export const DEFAULT_DASHBOARD_ES_VIEW_QUERY = `
{
  "query": {
    "term": {
      "_deprecated": false
    }
  }
}`;

export default DEFAULT_DASHBOARD_VIEW_QUERY;
