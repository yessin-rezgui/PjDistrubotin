const now = () => new Date().toISOString();

const format = (emoji, label, message) => `${now()} ${emoji} ${label} ${message}`;

const info = (message, meta) => {
  console.log(format('ℹ️', 'INFO', message));
  if (meta) console.log(meta);
};

const success = (message, meta) => {
  console.log(format('✅', 'OK', message));
  if (meta) console.log(meta);
};

const warn = (message, meta) => {
  console.warn(format('⚠️', 'WARN', message));
  if (meta) console.warn(meta);
};

const error = (message, meta) => {
  console.error(format('❌', 'ERROR', message));
  if (meta) console.error(meta);
};

const banner = ({ port, env, db }) => {
  console.log('🎟️  StellarTickets Backend');
  console.log(`🚀 Environment: ${env}`);
  console.log(`🔌 API: http://localhost:${port}`);
  if (db) {
    console.log(`🗄️  Database: ${db}`);
  }
};

module.exports = {
  info,
  success,
  warn,
  error,
  banner
};
