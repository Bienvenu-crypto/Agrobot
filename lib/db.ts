import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'agrobot.db');

// Singleton pattern for database connection
const globalForDb = global as unknown as { db: Database.Database | undefined };

export const db = globalForDb.db ?? new Database(dbPath);

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');
// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    district TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    user_email TEXT,
    role TEXT,
    content TEXT,
    image_url TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS market_prices_cache (
    crop_name TEXT PRIMARY KEY,
    data_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS weather_cache (
    location_key TEXT PRIMARY KEY,
    data_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS marketplace_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    district TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('seller', 'buyer')),
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_users_email_role ON marketplace_users(email, role);

  CREATE TABLE IF NOT EXISTS marketplace_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES marketplace_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL,
    crop TEXT NOT NULL,
    quantity_kg REAL NOT NULL,
    price_per_kg REAL NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'sold', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES marketplace_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS buy_orders (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    crop TEXT NOT NULL,
    quantity_kg REAL NOT NULL,
    max_price_per_kg REAL NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'fulfilled', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES marketplace_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    buy_order_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    crop TEXT NOT NULL,
    quantity_kg REAL NOT NULL,
    agreed_price_per_kg REAL NOT NULL,
    total_value REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'disputed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (buy_order_id) REFERENCES buy_orders(id),
    FOREIGN KEY (seller_id) REFERENCES marketplace_users(id),
    FOREIGN KEY (buyer_id) REFERENCES marketplace_users(id)
  );

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_chats_user_email ON chats(user_email);
  CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
  CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
  CREATE INDEX IF NOT EXISTS idx_listings_crop ON listings(crop);
  CREATE INDEX IF NOT EXISTS idx_buy_orders_buyer ON buy_orders(buyer_id);
  CREATE INDEX IF NOT EXISTS idx_buy_orders_crop ON buy_orders(crop);
  CREATE INDEX IF NOT EXISTS idx_trades_seller ON trades(seller_id);
  CREATE INDEX IF NOT EXISTS idx_trades_buyer ON trades(buyer_id);
  CREATE INDEX IF NOT EXISTS idx_marketplace_sessions_user ON marketplace_sessions(user_id);

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- Can be null for system-wide or app-user email
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
`);

try {
  db.exec('ALTER TABLE users ADD COLUMN district TEXT');
} catch (e) {
  // Column might already exist
}

try {
  db.exec('ALTER TABLE chats ADD COLUMN timestamp DATETIME DEFAULT CURRENT_TIMESTAMP');
} catch (e) {
  // Column might already exist
}

export default db;
