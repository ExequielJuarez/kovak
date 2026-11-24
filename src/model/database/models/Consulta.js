// Consulta enviada desde el modal "Consultar con asesor"
module.exports = (sequelize, DataTypes) => {
  const Consulta = sequelize.define(
    "Consulta",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      vehiculoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      nombre: { type: DataTypes.STRING(80), allowNull: false },
      telefono: { type: DataTypes.STRING(20), allowNull: false },
      motivo: { type: DataTypes.STRING(160), allowNull: false },
      mensaje: { type: DataTypes.STRING(500), allowNull: true },
      leida: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { tableName: "consultas", updatedAt: false }
  );

  Consulta.associate = (db) => {
    Consulta.belongsTo(db.Vehiculo, { as: "vehiculo", foreignKey: "vehiculoId" });
  };

  return Consulta;
};
