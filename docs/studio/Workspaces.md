# Workspaces

## What is a workspace?

A workspace is a collection of Dashboards paired with a View. You can have any number of dashboard-view pairings organized into a workspace.
You can label a workspace and add a description to help uses understand what kind of content they can expect to find there.

```json
{
  "@context": "https://bluebrainnexus.io/studio/context",
  "@type": "StudioWorkspace",
  "dashboards": [
    {
      "dashboard": "https://bbp.epfl.ch/neurosciencegraph/data/8751df37-a75f-4858-b174-742264deb4e9",
      "view": "nxv:defaultSparqlIndex"
    },
    {
      "dashboard": "https://bbp.epfl.ch/neurosciencegraph/data/99982da8-ec3a-4f18-9388-a0cc81bfff0c",
      "view": "nxv:defaultSparqlIndex"
    }
  ],
  "description": "",
  "label": "MorphoTester"
}
```

## Creating a workspace?

Inside any studio view, click the `Add workspace` button.

![Add a workspace](../assets/add-workspace-button.png)

..and fill in a form providing the following:

- `Label`: the name of your new Workspace (required field)
- `Description` for your Workspace

![Create a workspace form](../assets/create-workspace-form.png)

- Click `Save` and you will be navigated to the new workspace section of your studio view, which is given a navigable URI.

![Empty Workspace Example](../assets/empty-workspace-example.png)

Your Workspace is created, but it will need to have at lease one dashboard/view association for anything to show there.

You can also find your Workspaces as raw `JSON` configurations in the Resource List (for example, filter by type `StudioWorkspace`, or Search by id) and view it in the Resource View.

## Updating a workspace?

Inside any studio view, hover over a workspace tab label and click on the hovering edit icon

![Edit a workspace](../assets/edit-workspace-button.png)

Then you'll be provided with a dialogue where you can review and edit the workspace configuration.

- `Select View`: The view of which to pair with _each dashboard inside the follow transfer list_. The dashboard queries will be ran against the view listed inside this box. For now, using this edit form, you can only pair one view for all dashboards. If you were to create the configurations manually, you can pair each dashboard with a different view.
- `Add or Remove Dashboards`: Add or remove a dashboard to the `dashboards` collection of your workspace configuration. The dashboards listed are all the dashboards inside the project.
- `Name`: the name of your new Workspace (required field)
- `Description` for your Workspace

![Workspace Updating Form](../assets/edit-workspace-form.png)

After your forms have been edited, simple click save to update the changes.

## Removing a workspace?

You can remove a workspace by deprecating it from the Resource view
