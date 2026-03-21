import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

async function getMarketplaceUser(role?: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('mp_session')?.value;
  if (!sessionId) return null;

  const session = db
    .prepare('SELECT user_id, expires_at FROM marketplace_sessions WHERE id = ?')
    .get(sessionId) as any;
  if (!session || new Date(session.expires_at) < new Date()) return null;

  const query = role
    ? 'SELECT * FROM marketplace_users WHERE id = ? AND role = ?'
    : 'SELECT * FROM marketplace_users WHERE id = ?';
  const params = role ? [session.user_id, role] : [session.user_id];
  return db.prepare(query).get(...params) as any;
}

// GET /api/marketplace/listings — fetch all active listings (public)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const crop = searchParams.get('crop');
    const sellerId = searchParams.get('seller_id');

    let query = `
      SELECT l.*, mu.name as seller_name, mu.district as seller_district, mu.phone as seller_phone
      FROM listings l
      JOIN marketplace_users mu ON l.seller_id = mu.id
      WHERE l.status = 'active'
    `;
    const params: any[] = [];

    if (crop) {
      query += ' AND LOWER(l.crop) LIKE ?';
      params.push(`%${crop.toLowerCase()}%`);
    }
    if (sellerId) {
      query += ' AND l.seller_id = ?';
      params.push(sellerId);
    }
    query += ' ORDER BY l.created_at DESC';

    const listings = db.prepare(query).all(...params);
    return NextResponse.json({ listings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST /api/marketplace/listings — seller creates a new listing
export async function POST(req: Request) {
  try {
    const seller = await getMarketplaceUser('seller');
    if (!seller) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in as a seller.' }, { status: 401 });
    }

    const { crop, quantity_kg, price_per_kg, description } = await req.json();
    if (!crop || !quantity_kg || !price_per_kg) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (quantity_kg <= 0 || price_per_kg <= 0) {
      return NextResponse.json({ error: 'Quantity and price must be positive' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    db.prepare(
      'INSERT INTO listings (id, seller_id, crop, quantity_kg, price_per_kg, description) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, seller.id, crop.trim(), quantity_kg, price_per_kg, description || null);

    // === REVERSE MATCHING ENGINE (PARTIAL FULFILLMENT) ===
    const openOrders = db.prepare(`
      SELECT * FROM buy_orders
      WHERE LOWER(crop) = LOWER(?)
        AND max_price_per_kg >= ?
        AND status = 'open'
        AND buyer_id != ?
      ORDER BY max_price_per_kg DESC, created_at ASC
    `).all(crop.trim(), price_per_kg, seller.id) as any[];

    let remainingListingQty = quantity_kg;
    const tradesCreated = [];

    for (const order of openOrders) {
      if (remainingListingQty <= 0) break;

      const matchQty = Math.min(remainingListingQty, order.quantity_kg);
      const tradeId = crypto.randomUUID();
      const agreedPrice = price_per_kg; 
      const totalValue = agreedPrice * matchQty;

      db.prepare(
        'INSERT INTO trades (id, listing_id, buy_order_id, seller_id, buyer_id, crop, quantity_kg, agreed_price_per_kg, total_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(tradeId, id, order.id, seller.id, order.buyer_id, crop.trim(), matchQty, agreedPrice, totalValue);

      // Update Listing: Subtract quantity (we'll do final status update outside loop)
      remainingListingQty -= matchQty;

      // Update Order: Subtract quantity and close if 0
      const newOrderQty = order.quantity_kg - matchQty;
      db.prepare("UPDATE buy_orders SET quantity_kg = ?, status = ? WHERE id = ?")
        .run(newOrderQty, newOrderQty <= 0.01 ? 'fulfilled' : 'open', order.id);

      // Notifications
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message) 
        VALUES (?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), order.buyer_id, 'trade_match', 'Order Matched!', `We found ${matchQty}kg of ${crop} from ${seller.name}.`);

      const tRecord = db.prepare(`
        SELECT t.*, 
          s.name as seller_name, s.phone as seller_phone, s.email as seller_email,
          b.name as buyer_name, b.phone as buyer_phone, b.email as buyer_email
        FROM trades t
        JOIN marketplace_users s ON t.seller_id = s.id
        JOIN marketplace_users b ON t.buyer_id = b.id
        WHERE t.id = ?
      `).get(tradeId);
      tradesCreated.push(tRecord);
    }

    // Final Listing Update
    db.prepare("UPDATE listings SET quantity_kg = ?, status = ? WHERE id = ?")
      .run(remainingListingQty, remainingListingQty <= 0.01 ? 'sold' : 'active', id);

    if (tradesCreated.length > 0) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message) 
        VALUES (?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), seller.id, 'trade_match', 'Multiple Sales!', `You sold a total of ${quantity_kg - remainingListingQty}kg to ${tradesCreated.length} buyers.`);
    }

    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    return NextResponse.json({ listing, trade: tradesCreated[0] || null, allTrades: tradesCreated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

// DELETE /api/marketplace/listings — cancel a listing
export async function DELETE(req: Request) {
  try {
    const seller = await getMarketplaceUser('seller');
    if (!seller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    const listing = db
      .prepare('SELECT * FROM listings WHERE id = ? AND seller_id = ?')
      .get(id, seller.id) as any;
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    db.prepare("UPDATE listings SET status = 'cancelled' WHERE id = ?").run(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel listing' }, { status: 500 });
  }
}
