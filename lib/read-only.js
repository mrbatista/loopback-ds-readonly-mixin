var debug = require('debug')('loopback-ds-readonly-mixin');
var defaultMethod = ['create', 'upsert', 'prototype.updateAttributes', 'updateAll'];

module.exports = function(Model, options) {
  'use strict';

  debug('ReadOnly mixin for Model %s', Model.modelName);

  Model.stripReadOnlyProperties = function(ctx, method, next) {
    var body;

    body = ctx.req.body || ctx.args.data;
    if (!body) return next();

    var properties = (Object.keys(options).length) ? options : null;

    if (properties) {
      // Added support to array of instances
      body = Array.isArray(body) ? body : [body];
      body.forEach(function(data) {
        debug('Creating %s : Read only properties are %j', Model.modelName, properties);
        Object.keys(properties).forEach(function(property) {
          var setting = properties[property];
          if (typeof setting === 'object' && [].concat(setting.skip).indexOf(method) !== -1) {
            debug('The read only property \'%s\' is marked as skipped for method \'%s\'', property, method);
          } else {
            debug('The property \'%s\' is read only, removing incoming data', property);
            delete data[property];
          }
        });
      });
      next();
    } else {
      var err = new Error('Unable to update: ' + Model.modelName + ' is read only.');
      err.statusCode = 403;
      next(err);
    }
  };

  var findRelatedModel = function(ctx, relationName, method, next) {
    var relation = Model.relations[relationName];
    var modelTo = relation.modelTo;
    if (modelTo.stripReadOnlyProperties) {
      modelTo.stripReadOnlyProperties(ctx, method, next);
    } else {
      next();
    }
  };

  defaultMethod.forEach(function(method) {
    Model.beforeRemote(method, function(ctx, modelInstance, next) {
      Model.stripReadOnlyProperties(ctx, method, next);
    });
  });

  Model.stripHasManyRemoting = function(relationName) {
    Model.beforeRemote('prototype.__create__' + relationName, function(ctx, modelInstance, next) {
      findRelatedModel(ctx, relationName, 'create', next);
    });
    Model.beforeRemote('prototype.__updateById__' + relationName, function(ctx, modelInstance, next) {
      findRelatedModel(ctx, relationName, 'updateAttributes', next);
    });
  };

  Model.stripHasOneRemoting = function(relationName) {
    Model.beforeRemote('prototype.__create__' + relationName, function(ctx, modelInstance, next) {
      findRelatedModel(ctx, relationName, 'create', next);
    });
    Model.beforeRemote('prototype.__update__' + relationName, function(ctx, modelInstance, next) {
      findRelatedModel(ctx, relationName, 'update', next);
    });
  };

  // TODO Find a better way to obtain the defined relations of a model
  Model.on('attached', function() {
    if (Model.settings.relations) {
      var relations = Model.settings.relations;
      Object.keys(relations).forEach(function(relationName) {
        var relation = relations[relationName];
        if (relation.type === 'hasMany' || relation.type === 'embedsMany') {
          Model.stripHasManyRemoting(relationName);
        } else if (relation.type === 'hasOne' || relation.type === 'embedsOne') {
          Model.stripHasOneRemoting(relationName);
        } else {
          debug('The relation \'%s\' with type \'%s\' is not supported.', relationName, relation.type);
        }
      });
    }
  });
};
