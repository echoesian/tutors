module.exports = function(sequelize, DataTypes) {

    var User = sequelize.define("User", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            isEmail: true
        },

    }, {
        classMethods: {
            associate: function(models) {
                User.belongsTo(models.Tutor, {
                    foreignKey: {
                        allowNull: false
                    }
                });
                User.belongsTo(models.Student, {
                    foreignKey: {
                        allowNull: false
                    }
                });
            },
        }
    });
    return User;
};
