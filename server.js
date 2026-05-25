import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.json({ status: 'CabsOnline API running' });
});

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Date formatting
function formatDate(mysqlDate) {
  const d = new Date(mysqlDate);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// --- BOOKING ---
app.post('/api/booking', async (req, res) => {
  const {
    cname,
    phone,
    unumber,
    snumber,
    stname,
    sbname,
    dsbname,
    date,
    time,
  } = req.body;

  // Convert date from DD/MM/YYYY to YYYY-MM-DD
  const dateParts = date.split('/');
  const pickupDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

  try {
    const [result] = await db.execute(
      `INSERT INTO bookings (cname, phone, unumber, snumber, stname, sbname, dsbname, pickup_date, pickup_time)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cname,
        phone,
        unumber,
        snumber,
        stname,
        sbname,
        dsbname,
        pickupDate,
        time,
      ]
    );

    const id = result.insertId;
    const brn = `BRN${String(id).padStart(5, '0')}`;
    const displayDate = `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`;
    const timeParts = time.split(':');
    const displayTime = `${timeParts[0]}:${timeParts[1]}`;

    res.json({
      success: true,
      brn,
      pickup_date: displayDate,
      pickup_time: displayTime,
    });
  } catch (err) {
    res.json({
      success: false,
      error: 'Booking could not be completed. Please try again.',
    });
  }
});

// --- STATUS CHECK ---
app.get('/api/status', async (req, res) => {
  const { brn } = req.query;

  if (!brn || !/^BRN\d{5}$/.test(brn)) {
    return res.json({
      success: false,
      error: 'Invalid booking reference number format.',
    });
  }

  const id = parseInt(brn.substring(3));

  try {
    const [rows] = await db.execute('SELECT * FROM bookings WHERE id = ?', [
      id,
    ]);

    if (rows.length === 0) {
      return res.json({
        success: false,
        error: `No booking found for ${brn}.`,
      });
    }

    const row = rows[0];
    const displayDate = formatDate(row.pickup_date);
    const timeParts = row.pickup_time.split(':');
    const displayTime = `${timeParts[0]}:${timeParts[1]}`;

    res.json({
      success: true,
      brn: `BRN${String(row.id).padStart(5, '0')}`,
      cname: row.cname,
      phone: row.phone,
      unumber: row.unumber,
      snumber: row.snumber,
      stname: row.stname,
      sbname: row.sbname,
      dsbname: row.dsbname,
      pickup_date: displayDate,
      pickup_time: displayTime,
      status: row.status,
    });
  } catch (err) {
    console.error('Status error:', err);
    res.json({ success: false, error: err.message });
  }
});

// --- ADMIN SEARCH ---
app.post('/api/admin/search', async (req, res) => {
  const { bsearch } = req.body;

  try {
    let rows;

    if (bsearch && bsearch !== '') {
      const id = parseInt(bsearch.substring(3));
      [rows] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
    } else {
      [rows] = await db.execute(
        `SELECT * FROM bookings 
                 WHERE TIMESTAMP(pickup_date, pickup_time) 
                 BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)`
      );
    }

    const formatted = rows.map((row) => {
      const displayDate = formatDate(row.pickup_date);
      const timeParts = row.pickup_time.split(':');
      const displayTime = `${timeParts[0]}:${timeParts[1]}`;

      return {
        brn: `BRN${String(row.id).padStart(5, '0')}`,
        cname: row.cname,
        phone: row.phone,
        sbname: row.sbname,
        dsbname: row.dsbname,
        pickup_date: displayDate,
        pickup_time: displayTime,
        status: row.status,
      };
    });

    res.json({ success: true, bookings: formatted });
  } catch (err) {
    console.error('Search error:', err);
    res.json({ success: false, error: err.message });
  }
});

// --- ADMIN ASSIGN ---
app.post('/api/admin/assign', async (req, res) => {
  const { brn } = req.body;
  const id = parseInt(brn.substring(3));

  try {
    await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [
      'assigned',
      id,
    ]);
    res.json({ success: true, brn });
  } catch (err) {
    res.json({ success: false, error: 'Assignment could not be completed.' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
