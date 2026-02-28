const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// 安全访问入口（管理员密钥），从环境变量读取
const ADMIN_SECRET = process.env.ADMIN_SECRET || '123456';

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'qapdb',
  user: process.env.DB_USER || 'qapuser',
  password: process.env.DB_PASSWORD || 'qappassword',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 判断是否为管理员请求
// 通过 Nginx 传递的 X-Admin-Secret Header 来判断
function isAdminRequest(req) {
  const adminSecret = req.headers['x-admin-secret'];
  return adminSecret === ADMIN_SECRET;
}

// 管理员认证中间件
function requireAdmin(req, res, next) {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Initialize database
async function initDatabase() {
  let retries = 30;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('Connected to PostgreSQL');
      break;
    } catch (err) {
      retries--;
      console.log(`Waiting for PostgreSQL... (${retries} retries left)`);
      if (retries === 0) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS websites (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category TEXT,
      icon_url TEXT,
      is_active INTEGER DEFAULT 1,
      access_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    )
  `);

  // Insert default admin
  const adminCount = await pool.query('SELECT COUNT(*) FROM admins');
  if (parseInt(adminCount.rows[0].count) === 0) {
    await pool.query(
      'INSERT INTO admins (username) VALUES ($1)',
      ['admin']
    );
    console.log('==========================================');
    console.log('Admin user initialized');
    console.log('Admin access code:', ADMIN_SECRET);
    console.log('Use /' + ADMIN_SECRET + '/api/admin/* for admin routes');
    console.log('==========================================');
  }

  // Insert sample websites
  const websiteCount = await pool.query('SELECT COUNT(*) FROM websites');
  if (parseInt(websiteCount.rows[0].count) === 0) {
    const sampleWebsites = [
      ['Google', 'https://www.google.com', 'Search engine', 'Search', 'https://www.google.com/favicon.ico'],
      ['GitHub', 'https://github.com', 'Code hosting platform', 'Development', 'https://github.com/favicon.ico'],
      ['Docker Hub', 'https://hub.docker.com', 'Container registry', 'DevOps', 'https://hub.docker.com/favicon.ico'],
      ['Spring', 'https://spring.io', 'Java framework', 'Development', 'https://spring.io/favicon.ico'],
      ['Vue.js', 'https://vuejs.org', 'JavaScript framework', 'Development', 'https://vuejs.org/logo.svg'],
      ['OpenClaw', 'https://openclaw.ai', 'AI assistant platform', 'AI', 'https://openclaw.ai/favicon.ico']
    ];
    for (const site of sampleWebsites) {
      await pool.query(
        'INSERT INTO websites (name, url, description, category, icon_url) VALUES ($1, $2, $3, $4, $5)',
        site
      );
    }
    console.log('Sample websites initialized');
  }

  console.log('Database initialized successfully');
}

// API Routes - 公开路由（普通用户）

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/websites', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM websites WHERE is_active = 1 ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/websites/popular', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM websites WHERE is_active = 1 ORDER BY access_count DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/websites/category/:category', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM websites WHERE is_active = 1 AND category = $1 ORDER BY name', [req.params.category]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM websites WHERE category IS NOT NULL AND is_active = 1 ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/websites/:id/access', async (req, res) => {
  try {
    await pool.query('UPDATE websites SET access_count = access_count + 1 WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 管理员路由 - 需要通过 X-Admin-Secret Header 识别
app.use('/api/admin', requireAdmin, async (req, res, next) => {
  // 更新最后登录时间
  try {
    await pool.query('UPDATE admins SET last_login = NOW() WHERE id = 1');
  } catch (err) {
    console.error('Failed to update last_login:', err);
  }
  next();
});

app.get('/api/admin/admins', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, is_active, created_at, last_login FROM admins');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/websites', async (req, res) => {
  const { name, url, description, category, icon_url, is_active } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }
  try {
    // 确保 is_active 默认为 1
    const isActive = is_active !== undefined ? (is_active ? 1 : 0) : 1;
    const result = await pool.query(
      'INSERT INTO websites (name, url, description, category, icon_url, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, url, description, category, icon_url, isActive]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/websites/:id', async (req, res) => {
  const { name, url, description, category, icon_url, is_active } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM websites WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Website not found' });
    }
    const result = await pool.query(
      `UPDATE websites SET name = $1, url = $2, description = $3, category = $4, icon_url = $5, is_active = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
      [name || existing.rows[0].name, url || existing.rows[0].url, description || existing.rows[0].description,
       category || existing.rows[0].category, icon_url || existing.rows[0].icon_url,
       is_active !== undefined ? is_active : existing.rows[0].is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/websites/:id', async (req, res) => {
  try {
    await pool.query('UPDATE websites SET is_active = 0 WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 管理员路由信息端点
app.get('/api/admin/info', (req, res) => {
  if (isAdminRequest(req)) {
    res.json({
      isAdmin: true,
      adminSecret: ADMIN_SECRET,
      accessPattern: `/${ADMIN_SECRET}/api/admin/*`
    });
  } else {
    res.json({ isAdmin: false });
  }
});

initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QAP Backend running on port ${PORT}`);
    console.log(`Admin access code: ${ADMIN_SECRET}`);
    console.log(`Admin routes: /${ADMIN_SECRET}/api/admin/*`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
