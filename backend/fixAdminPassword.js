const bcrypt = require('bcryptjs');
const db = require('./config/db');

(async () => {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);

    await db.query(
      "UPDATE admins SET password_hash=? WHERE email=?",
      [hash, "admin@ojasya.com"]
    );

    console.log("✅ Admin password fixed safely");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
