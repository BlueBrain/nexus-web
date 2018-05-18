import React from "react";
import List from "./List";
import { Instance, WithStore } from "@bbp/nexus-react";
import { navigate } from "../store/actions";
import BreadCrumb from './BreadCrumb';

function mapStateToInstanceContainerProps({ instance, pick }) {
  if (instance.data) {
    instance.data.metaFields = [
      "distribution",
      "@id",
      "@context",
      "@type",
      "nxv:deprecated",
      "nxv:rev",
      "links",
      "resolvedLinks",
      "metaFields",
      "numFields"
    ];
    instance.data.numFields = Object.keys(instance).filter(
      key => instance.data.metaFields.indexOf(key) < 0
    ).length;
  }
  return {
    ...instance,
    open: !!pick.instance
  };
}


const Explore = () => {
  const schemasPattern = new RegExp(/schemas\/[^/]*\/[^/]*\//);
  return (
    <React.Fragment>
      <BreadCrumb />
      <main className="flex padding half">
        <List name="Organizations" entity="org" />
        <List name="Domains" entity="domain" />
        <List name="Schemas" entity="schema" splitPattern={schemasPattern} />
        <List name="Instances" entity="instance" />
        <WithStore
        mapStateToProps={mapStateToInstanceContainerProps}
        mapDispatchToProps={{
          goDown: navigate.goDown,
          goToEntityByID: navigate.goToEntityByID
        }}
      >
        {({ data, open, goToEntityByID, goDown }) => (
          <Instance
            goDown={goDown}
            goToEntityByID={goToEntityByID}
            data={data}
            open={open}
          />
        )}
      </WithStore>
      </main>
    </React.Fragment>
  );
};

export default Explore;
