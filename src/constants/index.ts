// Report Constants
export const DEFAULT_SCALE = 50;

export const DEFAULT_REPORT_TYPES = [
  {
    label: 'Analysis',
    description:
      'Any other report that is neither "Validation" not "Prediction".',
  },
  {
    label: 'Validation',
    description:
      'A report that compares a property against a target value that is derived from experimental data.',
  },
];

export const DEFAULT_REPORT_CATEGORIES = {
  DetailedCircuit: [
    {
      label: 'Anatomical',
      description:
        'A report relating to the cellular contents and placement of the circuit. For example, to neurons and the locations of their somata or dendrites.',
    },
    {
      label: 'Connectivity',
      description:
        'A report relating to the structure and topology of synaptic connections, analyzing the underlying directed connectivity graph.',
    },
    {
      label: 'Volumetric',
      description:
        'A report that explicitly considers the volume and/or shape of the modeled space. For example, the density of dendrites of synapses within a cubic volume.',
    },
    {
      label: 'Morphometric',
      description:
        'A report relating to the shape or morphology of the cells in the circuit. For example, counting the number of dendrite bifurcations.',
    },
    {
      label: 'Synapse',
      description:
        'A report relating to properties of synaptic connections. Unlike Connectivity it does not reduce them to a graph and instead considers properties of individual synapses, such as their dendritic locations or physiological parameters',
    },
  ],
  Simulation: [
    {
      label: 'Spiking',
      description:
        'An analysis report based on the spiking activity of the simulated neurons.',
    },
    {
      label: 'Soma voltage',
      description:
        'An analysis report based on the (subthreshold) soma voltage traces of the simulated neurons.',
    },
    {
      label: 'LFP',
      description:
        'An analysis report based on traces of extracellular potential calculated from the simulations.',
    },
    {
      label: 'VSD',
      description:
        'An analysis report based on predicted VSD images calculated from the simulations.',
    },
    {
      label: 'Plasticity',
      description:
        'An analysis report based on the temporal evolution of plasticity-related synapse parameters.',
    },
  ],
};

export const DEFAULT_ANALYSIS_DATA_SPARQL_QUERY = `PREFIX s:<http://schema.org/>
PREFIX prov:<http://www.w3.org/ns/prov#>
PREFIX nsg:<https://neuroshapes.org/>
PREFIX nxv:<https://bluebrain.github.io/nexus/vocabulary/>
SELECT ?container_resource_id  ?container_resource_name ?analysis_report_id ?analysis_report_name ?analysis_report_description ?analysis_report_categories ?analysis_report_types ?created_by ?created_at ?updated_by ?updated_at ?self
WHERE {
  OPTIONAL {
    BIND(<{resourceId}> as ?container_resource_id) .
    BIND(<{resourceId}> as ?self) .
    ?derivation_id        ^prov:derivation       ?analysis_report_id .
    ?derivation_id        nsg:entity             ?container_resource_id .
    OPTIONAL {
      ?container_resource_id        nsg:name                   ?container_resource_name .
    }
    ?analysis_report_id    nsg:name            ?analysis_report_name .
    ?analysis_report_id    nsg:description       ?analysis_report_description .
    OPTIONAL {
      ?analysis_report_id    nsg:categories       ?analysis_report_categories .
      ?analysis_report_id    nsg:types       ?analysis_report_types .
    }
    ?analysis_report_id nxv:createdBy ?created_by .
    ?analysis_report_id nxv:createdAt ?created_at .
    ?analysis_report_id nxv:updatedBy ?updated_by .
    ?analysis_report_id nxv:updatedAt ?updated_at .
  }
  OPTIONAL {
    BIND(<{resourceId}> as ?analysis_report_id) .
    BIND(<{resourceId}> as ?self) .
    ?derivation_id        ^prov:derivation       ?analysis_report_id .
    ?derivation_id        nsg:entity             ?container_resource_id .
    OPTIONAL {
      ?container_resource_id        nsg:name                   ?container_resource_name .
    }
    ?analysis_report_id    nsg:name            ?analysis_report_name .
    ?analysis_report_id    nsg:description       ?analysis_report_description .
    OPTIONAL {
      ?analysis_report_id    nsg:categories       ?analysis_report_categories .
      ?analysis_report_id    nsg:types       ?analysis_report_types .
    }
    ?analysis_report_id nxv:createdBy ?created_by .
    ?analysis_report_id nxv:createdAt ?created_at .
    ?analysis_report_id nxv:updatedBy ?updated_by .
    ?analysis_report_id nxv:updatedAt ?updated_at .
  }
}
LIMIT 1000`;
