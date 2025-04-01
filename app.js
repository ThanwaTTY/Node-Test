const express = require('express');
const mysql = require('mysql2');
const app = express();

// สร้างการเชื่อมต่อกับฐานข้อมูล MySQL
const db = mysql.createConnection({
    host: 'localhost',    // Host ของฐานข้อมูล
    user: 'root',         // ชื่อผู้ใช้
    password: '',         // รหัสผ่าน
    database: 'test_db'   // ชื่อฐานข้อมูล
});

// ตรวจสอบการเชื่อมต่อ
db.connect((err) => {
    if (err) {
        console.error('การเชื่อมต่อฐานข้อมูลล้มเหลว:', err.stack);
        return;
    }
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
});

// Route สำหรับดึงข้อมูลจากฐานข้อมูล
app.get('/users', (req, res) => {
    // ตัวอย่าง query ดึงข้อมูลจากตาราง users
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving data from the database');
        }
        res.json(results);  // ส่งผลลัพธ์เป็น JSON
    });
});

app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving data from the database');
        }
        if (results.length > 0) {
            res.json(results[0]);  // ส่งผลลัพธ์แค่ผู้ใช้คนเดียว
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Middleware เพื่อให้ Express รองรับการรับข้อมูลจาก body ใน POST request
app.use(express.urlencoded({ extended: true })); // สำหรับข้อมูลแบบ x-www-form-urlencoded
app.use(express.json()); // สำหรับข้อมูลแบบ JSON

app.post('/addUser', (req, res) => {
    const { name, email } = req.body;
    // res.status(201).send(req.body);
    db.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err, results) => {
        if (err) {
            return res.status(500).send('Error inserting data into the database');
        }
        res.status(201).send('User added successfully');
    });
});



// Route สำหรับ '/'
app.get('/', (req, res) => {
    res.send('Hello, World!'); // แสดงคำว่า "Hello, World!"
});

// Route สำหรับ '/test' พร้อม query parameter
app.get('/test', (req, res) => {
    // ดึงค่า parameter 'a' จาก query string
    const paramA = parseInt(req.query.a, 10);  // แปลงค่า 'a' เป็นตัวเลข
    
    // ตรวจสอบว่า paramA เป็นตัวเลขหรือไม่
    if (isNaN(paramA)) {
        return res.status(400).send('Parameter "a" must be a number!');
    }

    // บวกค่า paramA กับ 2
    const result = paramA + 2;
    res.send(`The value of parameter a is: ${result}`);
});

// Route สำหรับ '/test' พร้อม query parameter
app.get('/testloop', (req, res) => {
    // ดึงค่า parameter 'a' จาก query string
    const paramA = parseInt(req.query.a, 10);  // แปลงค่า 'a' เป็นตัวเลข
    const paramB = parseInt(req.query.b, 10);  // แปลงค่า 'a' เป็นตัวเลข
    
    // ตรวจสอบว่า paramA เป็นตัวเลขหรือไม่
    if (isNaN(paramA)) {
        return res.status(400).send('Parameter "a" must be a number!');
    }    
    // ตรวจสอบว่า paramB เป็นตัวเลขหรือไม่
    if (isNaN(paramB)) {
        return res.status(400).send('Parameter "b" = must be b number!');
    }

    // บวกค่า paramA กับ 2
    // const result = paramA + paramB;
    // const result = 0;
    // // res.send(`The value of parameter a is: ${result}`);
    // res.send(`The value of parameter a is: ${result}`);

    // for (let i = paramB; i <= 1; i--) {
    
        // result += (paramA + paramB);
        // res.send(`The value of parameter a is: ${result}`);
    // }
    let result = 1;
    for (let i = 1; i <= paramB; i++) {
        result *= i;
    }
    // res.send(result);
    res.send(`The value ${paramB}! is: ${result}`);
});

// Route สำหรับ '/testpost' ด้วย POST method
app.post('/testpost', (req, res) => {
    // ตรวจสอบว่า req.body มีค่าหรือไม่
    const paramA = req.body.a;  // ดึงค่า parameter 'a' จาก body
    if (paramA) {
        res.send(`The value of parameter a is: ${paramA}`);
    } else {
        res.status(400).send('Parameter "a" is missing in the body!');
    }
});

// สตาร์ทเซิร์ฟเวอร์ที่พอร์ต 3000
const server = app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// ปิดการเชื่อมต่อเมื่อเซิร์ฟเวอร์หยุดทำงาน (ใช้ SIGINT สำหรับการหยุดด้วย ctrl+c)
process.on('SIGINT', () => {
    console.log('Server is shutting down...');

    // ปิดการเชื่อมต่อกับฐานข้อมูล
    db.end((err) => {
        if (err) {
            console.error('Error closing the database connection:', err);
        } else {
            console.log('Database connection closed.');
        }

        // ปิดเซิร์ฟเวอร์
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);  // Exit the process
        });
    });
});

// ปิดการเชื่อมต่อเมื่อได้รับ SIGTERM (ใช้ในการหยุดการทำงานจากระบบ)
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down...');

    // ปิดการเชื่อมต่อกับฐานข้อมูล
    db.end((err) => {
        if (err) {
            console.error('Error closing the database connection:', err);
        } else {
            console.log('Database connection closed.');
        }

        // ปิดเซิร์ฟเวอร์
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);  // Exit the process
        });
    });
});
