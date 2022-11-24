export declare const DEFAULT_SCALE = 50;
export declare const DEFAULT_REPORT_TYPES: {
  label: string;
  description: string;
}[];
export declare const DEFAULT_REPORT_CATEGORIES: {
  DetailedCircuit: {
    label: string;
    description: string;
  }[];
  SimulationCampaignConfiguration: {
    label: string;
    description: string;
  }[];
};
export declare const DEFAULT_ANALYSIS_DATA_SPARQL_QUERY =
  'PREFIX s:<http://schema.org/>\nPREFIX prov:<http://www.w3.org/ns/prov#>\nPREFIX nsg:<https://neuroshapes.org/>\nPREFIX nxv:<https://bluebrain.github.io/nexus/vocabulary/>\nSELECT ?container_resource_id  ?container_resource_name ?analysis_report_id ?analysis_report_name ?analysis_report_description ?analysis_report_categories ?analysis_report_types ?created_by ?created_at ?updated_by ?updated_at ?self\nWHERE {\n  OPTIONAL {\n    BIND(<{resourceId}> as ?container_resource_id) .\n    BIND(<{resourceId}> as ?self) .\n    ?derivation_id        ^prov:derivation       ?analysis_report_id .\n    ?derivation_id        nsg:entity             ?container_resource_id .\n    OPTIONAL {\n      ?container_resource_id        nsg:name                   ?container_resource_name .\n    }\n    ?analysis_report_id    nsg:name            ?analysis_report_name .\n    ?analysis_report_id    nsg:description       ?analysis_report_description .\n    OPTIONAL {\n      ?analysis_report_id    nsg:categories       ?analysis_report_categories .\n      ?analysis_report_id    nsg:types       ?analysis_report_types .\n    }\n    ?analysis_report_id nxv:createdBy ?created_by .\n    ?analysis_report_id nxv:createdAt ?created_at .\n    ?analysis_report_id nxv:updatedBy ?updated_by .\n    ?analysis_report_id nxv:updatedAt ?updated_at .\n  }\n  OPTIONAL {\n    BIND(<{resourceId}> as ?analysis_report_id) .\n    BIND(<{resourceId}> as ?self) .\n    ?derivation_id        ^prov:derivation       ?analysis_report_id .\n    ?derivation_id        nsg:entity             ?container_resource_id .\n    OPTIONAL {\n      ?container_resource_id        nsg:name                   ?container_resource_name .\n    }\n    ?analysis_report_id    nsg:name            ?analysis_report_name .\n    ?analysis_report_id    nsg:description       ?analysis_report_description .\n    OPTIONAL {\n      ?analysis_report_id    nsg:categories       ?analysis_report_categories .\n      ?analysis_report_id    nsg:types       ?analysis_report_types .\n    }\n    ?analysis_report_id nxv:createdBy ?created_by .\n    ?analysis_report_id nxv:createdAt ?created_at .\n    ?analysis_report_id nxv:updatedBy ?updated_by .\n    ?analysis_report_id nxv:updatedAt ?updated_at .\n  }\n}\nLIMIT 1000';
