const fetch = require('node-fetch');
require('abort-controller/polyfill');
const { createNexusClient } = require('@bbp/nexus-sdk');

(async function() {
  try {
    const orgLabel = 'search';
    const projectLabel = 'studio-2';

    // Example projects
    const targetProjects = [
      'jdc-org-emodelcoll-1/jdc-projectproj38',
      'jdc-org-emodelcoll-1/jdc-projectproj55',
    ];

    const nexus = createNexusClient({
      uri: process.env.API_ENDPOINT,
      token: process.env.TOKEN,
      fetch,
    });

    // Lets create an aggregate view!
    const aggView = await nexus.View.create(orgLabel, projectLabel, {
      '@type': ['AggregateSparqlView'],
      views: targetProjects.map(name => ({
        project: name,
        viewId:
          'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
      })),
    });

    // Faceted (Aggregations) Queries
    const facets = `
    prefix nxs: <https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/>
prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/>
prefix prov: <http://www.w3.org/ns/prov#>
prefix schema: <http://schema.org/>
prefix nshapes: <https://neuroshapes.org/dash/>

SELECT DISTINCT ?speciesLabel ?speciesID  ?brainRegionID ?brainRegionLabel ?agentID ?fName ?strainID ?strainLabel
{
  {
    ?s1 nxs:brainLocation / nxs:brainRegion ?brainRegionID .
    # ?s1 nxv:constrainedBy nshapes:dataset .
      OPTIONAL { ?brainRegionID rdfs:label ?brainRegionLabel }
  } UNION {
  	?s2 nxs:subject / nxs:species ?speciesID .
    # ?s2 nxv:constrainedBy nshapes:dataset .
    OPTIONAL { ?speciesID rdfs:label ?speciesLabel }
  } UNION {
  	?s2 nxs:subject / nxs:strain ?strainID .
    # ?s2 nxv:constrainedBy nshapes:dataset .
    OPTIONAL { ?strainID rdfs:label ?strainLabel }
  } UNION {
     ?s3 nxs:contribution / prov:agent ?agentID .
     # ?s3 nxv:constrainedBy nshapes:dataset .
     OPTIONAL{ ?agentID schema:familyName ?fName }
  }
  }
    `;

    // DatesetQueries
    // This is how aggregatoions are applied to filter data
    const datasetQueryConfig = {
      vocab: `
        prefix nxs: <https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/>
        prefix nxv: <https://bluebrain.github.io/nexus/vocabulary/>
        prefix prov: <http://www.w3.org/ns/prov#>
        prefix schema: <http://schema.org/>
        prefix nshapes: <https://neuroshapes.org/dash/>
      `,
      graphs: {
        brainRegion: `
        Graph ?g {
          VALUES ?search { #{values} }
          ?s nxs:brainLocation / nxs:brainRegion ?search .
        }
        `,
      },
    };

    // lets create a searchConfig!
    const searchViewConfig = await nexus.Resource.create(
      orgLabel,
      projectLabel,
      {
        '@type': ['nxv:SearchViewConfig'],
        view: aggView['@id'],
        facets,
        datasetQueryConfig,
      }
    );

    console.log(aggView, searchViewConfig);
  } catch (error) {
    console.log(error);
  }
})();
