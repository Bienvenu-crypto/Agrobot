const db = require('better-sqlite3')('agrobot.db');
const columns = db.pragma('table_info(chats)');
console.log(columns);
