const { DataTypes } = require('sequelize');

/**
 * Appointment Model for MySQL using Sequelize
 * 
 * @param {Object} sequelize - Sequelize instance
 * @returns {Object} Appointment model
 */
module.exports = (sequelize) => {
  /**
   * Appointment Model
   * Stores details about doctor appointments including patient information,
   * scheduling details, and appointment status
   */
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Reference to the patient user
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Reference to the doctor user
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Appointment date
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    // Appointment time
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    // Patient age
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Patient blood group (optional)
    bloodGroup: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    // Patient gender
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false
    },
    // Contact number
    number: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    // Family medical history (optional)
    familyDiseases: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Appointment status (defaults to Pending)
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Pending'
    }
    // Future implementation
    // prescription: {
    //   type: DataTypes.TEXT,
    //   allowNull: true
    // }
  }, {
    // Enable timestamps (createdAt, updatedAt)
    timestamps: true
  });

  // Define associations
  Appointment.associate = (models) => {
    // Association with User model (patient)
    Appointment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'patient',
      onDelete: 'CASCADE'
    });
    
    // Association with User model (doctor)
    Appointment.belongsTo(models.User, {
      foreignKey: 'doctorId',
      as: 'doctor',
      onDelete: 'CASCADE'
    });
  };

  return Appointment;
};