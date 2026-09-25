const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database lưu tạm trong RAM
const KEYS_DATABASE = {
  "PREMIUM-ADMIN-8888": {
    owner: "Admin System",
    type: "PREMIUM",
    features: ["ALL"],
    maxUses: 999,
    usedCount: 0,
    active: true
  }
};

function generateRandomKey(type) {
  const prefix = type === 'PREMIUM' ? 'PREMIUM' : 'KEY';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r1 = '', r2 = '';
  for (let i = 0; i < 4; i++) r1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) r2 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `\({prefix}-\){r1}-${r2}`;
}

// Route trang chủ
app.get('/', (req, res) => {
  res.status(200).send('Auth Server Online & Working!');
});

// API Kiểm tra Key
app.post('/api/verify-key', (req, res) => {
  const { key } = req.body || {};

  if (!key || !KEYS_DATABASE[key]) {
    return res.status(403).json({ success: false, message: "Key không tồn tại hoặc sai định dạng!" });
  }

  const keyData = KEYS_DATABASE[key];

  if (!keyData.active) {
    return res.status(403).json({ success: false, message: "Key đã bị Admin khóa!" });
  }

  if (keyData.usedCount >= keyData.maxUses) {
    return res.status(403).json({ success: false, message: `Key đã hết lượt kích hoạt (\({keyData.usedCount}/\){keyData.maxUses})!` });
  }

  return res.json({
    success: true,
    message: `Kích hoạt thành công! Gói: ${keyData.type}`,
    owner: keyData.owner,
    type: keyData.type,
    features: keyData.features
  });
});

// Route Admin Dashboard
app.get('/admin', (req, res) => {
  let rows = '';
  for (const [k, v] of Object.entries(KEYS_DATABASE)) {
    const featText = v.type === 'PREMIUM' ? '**MỞ TẤT CẢ**' : v.features.join(', ');
    const statusText = v.active ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA';
    
    rows += `
