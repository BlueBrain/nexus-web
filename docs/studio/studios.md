## Studio

### What is a Studio?

A studio is a collection of organized queries organized in a table layout for users to quickly access relevant data in a customizable way. Studio authors can create a studio to match a specific topic, and create organization schemes called workspaces and dashboards to access various aspects of that data.

For example, a studio might cover all datasets from the `Neocortex`, with a workspace called `Physiology` and a dashboard called `Morphology Pipeline`.

In essence, a studio is a UI layer that performs queries according to a configuration that lives in a Nexus instance as a Resource. It has a `label` for a meaningful title and a `description` field to convey to the users what sort of data they can expect to find there. Most importantly, a studio configuration has a `workspace` collection.

```json
{
  "@context": "https://bluebrainnexus.io/studio/context",
  "@type": "https://bluebrainnexus.io/studio/vocabulary/Studio",
  "description": "",
  "label": "test",
  "workspaces": [
    "https://nexussandbox.io/org/project/3bdf8b08-7b9a-443b-b04d-be2a048893ba"
  ]
}
```

> Note: A studio will be given a URI for navigation or sharing.

### Creating a studio

To create a new studio, select a project.
In the Project View, you will see a list of Studios with the `Create Studio` button.

Click the `Create Studio` button.

![Create a studio](../assets/create-a-studio.png)

..and fill in a form providing the following:

- `Label`: the name of your new Studio (required field)
- `Description` for your Studio

![Create a studio form](../assets/create-a-studio-form.png)

- Click `Save` and you will be navigated to the Studio View.

![Empty Studio Example](../assets/empty-studio-example.png)

That's it! Your new Studio is empty for now, but don't worry!
We will add Workspaces and Dashboards later.

You can also find your Studios in the Resource List (for example, filter by type `Studio`, or Search by id) and view it in the Resource View.

### Updating a studio

Once created, a label and a description of a Studio can be changed.
Just click `Edit Studio` button and update `Label` and `Description` fields.

### Removing a studio

To remove an unwanted Studio, deprecate it in the Resource View.
