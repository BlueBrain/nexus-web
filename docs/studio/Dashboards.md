# Dashboards

## What is a dashboard?

A `Dashboard` is simply a query with a description and label. This will be used by the `Workspace` to query against the view paired with it inside the `Workspace` configuration. This way, you can write one query, and re-use it against multiple potential views.

An example `Dashbaord` resource looks like this:

```json
{
  "@context": "https://bluebrainnexus.io/studio/context",
  "@type": "StudioDashboard",
  "dataQuery": "# This is a simple example query\n# You can directly edit this\nprefix nxv: <https://bluebrain.github.io/nexus/vocabulary/>\nprefix s: <http://schema.org/>\nSELECT DISTINCT ?self ?familyName ?givenName\nWHERE {\n?s nxv:constrainedBy <https://neuroshapes.org/dash/person> ;\n  nxv:self ?self ;\n  s:familyName ?familyName ; \n  s:givenName ?givenName\n}\nLIMIT 20",
  "description": "A list of every scientist",
  "label": "Scientists",
  "plugins": ["nexus-plugin-example"]
}
```

The `Dashboard`, once configured, will present the results of your sparql query in a table. Each item in the row will be clickable and lead to a details page showing the `Resource`, in this case, a list of scientists that have contributed data to the project.

![Create a workspace form](../assets/dashboards-list.png)

## Plugins (Experimental!)

There's also an experimantal `plugin` key in the configuration that can be used to load experimental nexus plugins. These plugins will be loaded into the `Details` page of a resource.

## Creating a dashboard?

Inside any `Studio View` that has a `Workspace` and a `Workspace` selected, click the `Add Dashboard` button.

![Add a workspace](../assets/add-dashboard-button.png)

..and fill in a form providing the following:

- `Label`: the name of your new `Dashboard` (required field)
- `Description`: an optional description for your `Dashboard`
- `Sparql Query`: a valid [SPARQL](https://www.w3.org/TR/rdf-sparql-query/)query that conforms to the `dataQuery` field in the configuration.

![Create a workspace form](../assets/edit-dashboard-form.png)

> You can click on the "view query in Sparql Editor" to open the `Sparql Editor` in a new tab to work on your query while querying it against a `Sparql View` in your project, so you can make sure it works and provides the fields you want. Then, you can copy and past that back in the form.

- Click `Save` and the `Dashboard` and its query results should show up!

You can now also add this `Dashboard` to other `Workspaces` accross the project.

## Updating a dashboard?

You'll find the edit `Dashboard` button by hovering over the label of a dashboard

![Edit a workspace](../assets/edit-dashboard-button.png)

Clicking that will lead you to a similar form as in the "Creating a dashboard?" section.

After your forms have been edited, simple click save to update the changes.

## Removing a dashboard?

You can remove a workspace by deprecating it from the `Resource View`
