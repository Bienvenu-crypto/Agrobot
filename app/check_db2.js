const db = require('better-sqlite3')('agrobot.db');
try {
  const columns = db.pragma('table_info(chats)');
  console.log(columns);
} catch (e) {
  console.error(e);
}
