const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// 📁 ملف حفظ البيانات
const DB_FILE = 'database.json';

// تحميل البيانات
let leaves = [];
try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    leaves = JSON.parse(data);
} catch (err) {
    leaves = [];
}

// توليد رقم إجازة
function generateLeaveId() {
    let numbers = "";
    for (let i = 0; i < 11; i++) {
        numbers += Math.floor(Math.random() * 10);
    }
    return "GSL" + numbers;
}

// ✅ إضافة إجازة
app.post('/api/leaves', (req, res) => {
    const leave = req.body;

    leave.sickleave_id = generateLeaveId();

    leaves.push(leave);

    // حفظ في الملف
    fs.writeFileSync(DB_FILE, JSON.stringify(leaves, null, 2));

    res.json({
        message: "تمت الإضافة",
        id: leave.sickleave_id
    });
});

// ✅ استعلام
app.get('/api/leaves', (req, res) => {
    const search = req.query.search || "";

    const result = leaves.filter(l =>
        l.personal_id.includes(search)
    );

    res.json({
        result: result,
        totalRows: result.length,
        pages: 1
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});