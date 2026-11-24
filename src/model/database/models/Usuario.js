// Usuario del panel de administración (la clave se guarda encriptada con bcrypt)
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(80), allowNull: false },
      usuario: { type: DataTypes.STRING(60), allowNull: false, unique: true },
      clave: { type: DataTypes.STRING(100), allowNull: false },
    },
    { tableName: "usuarios" }
  );
  return Usuario;
};
