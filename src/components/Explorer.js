import React from "react";
import List from "./List";
import Instance from "./Instance";
import BreadCrumb from './BreadCrumb';

const Explore = () => {
  const schemasPattern = new RegExp(/schemas\/[^/]*\/[^/]*\//);
  return (
    <React.Fragment>
      <BreadCrumb />
      <main className="flex">
        <List name="Organizations" entity="org" />
        <List name="Domains" entity="domain" />
        <List name="Schemas" entity="schema" splitPattern={schemasPattern} />
        <List name="Instances" entity="instance" />
        <Instance />
      </main>
    </React.Fragment>
  );
};

export default Explore;
