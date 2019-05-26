var mongoose = require('mongoose'),
	modelName = 'refreshToken',
	schemaDefinition = require('../schema/' + modelName),
	schemaInstance = mongoose.Schema(schemaDefinition);

schemaInstance.index({ "refreshTokenExpiresAt": 1 }, { expireAfterSeconds: 0 });

var modelInstance = mongoose.model(modelName, schemaInstance);

module.exports = modelInstance;
