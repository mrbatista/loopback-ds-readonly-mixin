READONLY
=============

[![Circle CI](https://circleci.com/gh/fullcube/loopback-ds-readonly-mixin.svg?style=svg)](https://circleci.com/gh/fullcube/loopback-ds-readonly-mixin) [![Coverage Status](https://coveralls.io/repos/fullcube/loopback-ds-readonly-mixin/badge.svg?branch=master&service=github)](https://coveralls.io/github/fullcube/loopback-ds-readonly-mixin?branch=master) [![Dependencies](http://img.shields.io/david/fullcube/loopback-ds-readonly-mixin.svg?style=flat)](https://david-dm.org/fullcube/loopback-ds-readonly-mixin)


This module is designed for the [Strongloop Loopback](https://github.com/strongloop/loopback) framework.
It provides a mixin that makes it possible to mark models or model properties as
read only. A read only property may not be written to directly when creating or
updating models using remote REST methods.

The property value is an object that details model properties to be
treated as read only properties. Each key in the object must match a property
name defined for the model.

A feature requests exists against the Loopback project for similar functionality
in core: https://github.com/strongloop/loopback/issues/531

INSTALL
=============

```bash
npm install --save loopback-ds-readonly-mixin
```

MIXINSOURCES
=============
With [loopback-boot@v2.8.0](https://github.com/strongloop/loopback-boot/)  [mixinSources](https://github.com/strongloop/loopback-boot/pull/131) have been implemented in a way which allows for loading this mixin without changes to the `server.js` file previously required.

Add the `mixins` property to your `server/model-config.json` like the following:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-ds-readonly-mixin",
      "../common/mixins"
    ]
  }
}
```

SERVER.JS
=============

In your `server/server.js` file add the following line before the
`boot(app, __dirname);` line.

```
...
var app = module.exports = loopback();
...
// Add ReadOnly Mixin to loopback
require('loopback-ds-readonly-mixin')(app);

boot(app, __dirname, function(err) {
  'use strict';
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
```

CONFIG
=============

To use with your Models add the `mixins` attribute to the definition object of
your model config.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string",
      }
    },
    "mixins": {
      "ReadOnly" : true
    }
  }
```

Attempting to update a ReadOnly model will result in a 403 error.

OPTIONS
=============

The specific fields that are to be marked as read only can be set by passing an
object to the mixin options.

In this example we mark the `status` and `role` fields as read only.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string",
      },
      "status": {
        "type": "string",
      },
      "role": {
        "type": "string",
      }
    },
    "mixins": {
      "ReadOnly" : {
        "status" : true,
        "role" : true
      }
    }
  }
```

It is possible to specify a method where fields are accepted:
mark each field with property `skip` in the options
`skip` property should support String or Array types

In this example, the `status` and `role` fields are read only for all methods except `create`.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string",
      },
      "status": {
        "type": "string",
      },
      "role": {
        "type": "string",
      }
    },
    "mixins": {
      "ReadOnly" : {
        "status" : {
          "skip": "create"
        },
        "role" : {
          "skip": ["create"]
        }
      }
    }
  }
```

TESTING
=============

Run the tests in `test.js`

```bash
  npm test
```

Run with debugging output on:

```bash
  DEBUG='loopback-ds-readonly-mixin' npm test
```
