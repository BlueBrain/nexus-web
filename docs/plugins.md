# Plugins and Deployment

## Plugin Manifest

The plugin manifest should be available at the same remote endpoint as the plugins. This is so Nexus can find the plugins and apply them dynamically.

The plugin manifest is a json object with keys that correspond to the plugin name with a value that corresponds to a descriptive payload of where to find the manifest, as well as some information about it's development. It's similar to a package.json file.

```{
    "circuit": {
      "modulePath": "circuit.f7755e13c8b410efdf02.js",
      "name": "Circuit",
      "description": "",
      "version": "",
      "tags": [],
      "author": "",
      "license": "",
      "mapping": {}
    }
}
```

## Plugin Config

The plugin config should be available as an object under the `mapping` key of the plugin manifest. This tells nexus when a plugin should be displayed, by matching a resource to a shape.

### Matching all resources

The following will show `nexus-plugin-test` for _every_ resource inside Nexus Web.

```json
{
  "nexus-plugin-test": {
    "modulePath": "nexus-plugin-test.js",
    "name": "Nexus Plugin Test",
    "description": "",
    "version": "",
    "tags": [],
    "author": "",
    "license": "",
    "mapping": {}
  }
}
```

### Matching a resource with a specific type and shape

The following will show `nexus-plugin-test` for any resource of type `File` but only if they have a `distribution.encodingFormat` property that's `application/swc`

```json
{
    "nexus-plugin-test": {
      "modulePath": "nexus-plugin-test.js",
      "name": "Nexus Plugin Test",
      "description": "",
      "version": "",
      "tags": [],
      "author": "",
      "license": "",
      "mapping": {
        "@type": "File",
        "distribution:" {
            "encodingFormat": "application/swc"
        }
    }
}
```
