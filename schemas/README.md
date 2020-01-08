# Nexus Web Schemas

This folder contains schemas that can be used to validate resources that Nexus Web uses for its `Studio` feature.

# Using Schemas

Schemas should be uploaded as `Resources` that are constrained by `nxs:shacl-20170720.ttl` shacl.

They should be uploaded to a central project of your nexus instance, for example `apps/datamodels`

Every project that uses the `Studio` feature, should create a `CrossProjectResolver` `Resource` to access them from that project.

You should also upload the `StudioContext.json` as an unconstrained `Resource` so all the `Studio Resources` can reference the same context.
