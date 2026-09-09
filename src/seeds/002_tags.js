exports.seed = async function (knex) {
  await knex('tags').del();

  await knex('tags').insert([
    { name: 'veredas', icon: '🚶' },
    { name: 'calles', icon: '🛣️' },
    { name: 'puentes', icon: '🌉' },
    { name: 'semaforos', icon: '🚦' },
    { name: 'alumbrado', icon: '💡' },
    { name: 'basureros', icon: '🗑️' },
    { name: 'agua_potable', icon: '🚰' },
    { name: 'alcantarillado', icon: '🕳️' },
    { name: 'recoleccion', icon: '🚛' },
    { name: 'juegos_infantiles', icon: '🎠' },
    { name: 'parques', icon: '🌳' },
    { name: 'plazas', icon: '🏛️' },
    { name: 'canchas', icon: '⚽' },
    { name: 'iluminacion', icon: '🔦' },
    { name: 'vandalismo', icon: '🪟' },
    { name: 'baches', icon: '🕳️' },
    { name: 'arboles', icon: '🌳' },
    { name: 'contaminacion', icon: '🏭' },
    { name: 'inundaciones', icon: '🌊' },
  ]);
};
