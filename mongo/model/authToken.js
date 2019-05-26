var mongoose = require('mongoose'),
	modelName = 'authToken',
	schemaDefinition = require('../schema/' + modelName),
	schemaInstance = mongoose.Schema(schemaDefinition);

schemaInstance.index({ "expiresAt": 1 });

var modelInstance = mongoose.model(modelName, schemaInstance);

module.exports = modelInstance;