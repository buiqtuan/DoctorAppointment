const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const sequelize = require('../db/conn');
const db = {};

// Read all model files in the current directory
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && // Ignore hidden files
      file !== basename && // Ignore this file
      file.slice(-3) === '.js' && // Only JS files
      file !== 'index.js' // Double check to exclude this file
    );
  })
  .forEach(file => {
    // Import each model file and initialize it with the sequelize instance
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Set up associations between models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add the sequelize instance and Sequelize class to the exported object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;