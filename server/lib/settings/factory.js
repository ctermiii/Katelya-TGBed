const { SqliteSettingsStore } = require('./sqlite-store');
const { RedisSettingsStore } = require('./redis-store');

function createSettingsStore({ db, config }) {
  const mode = String(config.settingsStore || 'sqlite').toLowerCase();

  if (mode === 'sqlite') {
    return new SqliteSettingsStore(db);
  }

  if (mode === 'redis') {
    return new RedisSettingsStore(config);
  }

  console.warn(`[settings] Unknown SETTINGS_STORE "${mode}", fallback to sqlite.`);
  return new SqliteSettingsStore(db);
}

module.exports = {
  createSettingsStore,
};
