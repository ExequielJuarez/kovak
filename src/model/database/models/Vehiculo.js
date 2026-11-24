// Una unidad del stock. "publicado" decide si se ve en la web; "destacado" la pone en el carrusel.
module.exports = (sequelize, DataTypes) => {
  const Vehiculo = sequelize.define(
    "Vehiculo",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
      marca: { type: DataTypes.STRING(60), allowNull: false },
      modelo: { type: DataTypes.STRING(120), allowNull: false },
      anio: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
      segmento: { type: DataTypes.STRING(40), allowNull: false },
      condicion: { type: DataTypes.STRING(40), allowNull: false, defaultValue: "Usado Seleccionado" },
      km: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      transmision: { type: DataTypes.STRING(30), allowNull: false },
      combustible: { type: DataTypes.STRING(30), allowNull: false },
      precio: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      descripcion: { type: DataTypes.TEXT, allowNull: true },
      destacado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      publicado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "vehiculos" }
  );

  Vehiculo.associate = (db) => {
    Vehiculo.hasMany(db.VehiculoImagen, { as: "fotos", foreignKey: "vehiculoId", onDelete: "CASCADE" });
    Vehiculo.hasMany(db.Consulta, { as: "consultas", foreignKey: "vehiculoId" });
  };

  return Vehiculo;
};
