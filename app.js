import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import pool from './database.js';

dotenv.config();

console.log("📌 ENV változók ellenőrzése:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ OK" : "❌ NINCS MEGADVA");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ OK" : "❌ NINCS MEGADVA");
console.log("EMAIL_PASS:", process.env.EMAIL_PASSWORD ? "✅ OK" : "❌ NINCS MEGADVA");

const app = express();
const port = process.env.PORT || 3000;

// Middleware beállítások
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// **Szerver indítása**
console.log("✅ Szerver indítása...");
console.log("🔍 Ellenőrzött ENV változók:");
console.log(" - EMAIL_USER:", process.env.EMAIL_USER ? "OK" : "❌ HIÁNYZIK!");
console.log(" - DATABASE_URL:", process.env.DATABASE_URL ? "OK" : "❌ HIÁNYZIK!");

// **PostgreSQL kapcsolat ellenőrzése**
(async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL kapcsolat aktív:', res.rows[0].now);
    } catch (error) {
        console.error('❌ PostgreSQL kapcsolat sikertelen:', error);
        process.exit(1);
    }
})();

// **Főoldal betöltése**
app.get('/', async (req, res) => {
    try {
        console.log('✅ Főoldal betöltése...');
        res.render('index', { successMessage: null, errorMessage: null });
    } catch (error) {
        console.error('❌ Hiba az index oldal betöltésekor:', error);
        res.status(500).send('Szerverhiba');
    }
});

// **POST - Űrlap beküldése**
app.post('/submit-form', async (req, res) => {
    try {
        console.log('📥 Beérkezett űrlap:', req.body);

        let {
            destination, peopleCount, childrenAge, departureDate, returnDate,
            duration, travelMethod, accommodationType, mealPlan, extraNeeds,
            budget, contactName, contactEmail, contactPhone,
        } = req.body;

        if (!destination || !peopleCount || !departureDate || !returnDate || !budget || !contactEmail) {
            throw new Error("🚨 Hiányzó kötelező mezők!");
        }

        budget = budget.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        const query = `
            INSERT INTO requests (
                destination, peopleCount, childrenAge, departureDate, returnDate, 
                duration, travelMethod, accommodationType, mealPlan, extraNeeds, 
                budget, contactName, contactEmail, contactPhone
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;
        await pool.query(query, [
            destination, peopleCount, childrenAge, departureDate, returnDate,
            duration, travelMethod, accommodationType, mealPlan, extraNeeds,
            budget, contactName, contactEmail, contactPhone,
        ]);

        console.log('✅ Adatok sikeresen mentve az adatbázisba.');

        console.log('📨 Felhasználói e-mail küldése folyamatban...');
        await sendUserEmail(contactName, contactEmail, destination, peopleCount, budget, departureDate, returnDate);

        console.log('📨 Admin e-mail küldése folyamatban...');
        await sendAdminEmail(destination, peopleCount, childrenAge, departureDate, returnDate, duration, travelMethod, accommodationType, mealPlan, extraNeeds, budget, contactName, contactEmail, contactPhone);

        res.redirect('/thankyou');
    } catch (error) {
        console.error('❌ Hiba az űrlap feldolgozása során:', error);
        res.status(500).send('Szerverhiba');
    }
});

// **"Köszönjük" oldal**
app.get('/thankyou', (req, res) => {
    try {
        console.log('✅ Thank You oldal betöltése...');
        res.render('thankyou');
    } catch (error) {
        console.error('❌ Hiba a thankyou oldal betöltésekor:', error);
        res.status(500).send('Szerverhiba');
    }
});

// **📌 Teszt útvonal az e-mail küldéshez**
app.get('/test-email', async (req, res) => {
    try {
        console.log("📨 Teszt email küldése...");
        await sendEmail("teszt@pelda.com", "Teszt tárgy", "Ez egy teszt email.");
        res.send("✅ Email sikeresen elküldve!");
    } catch (error) {
        res.status(500).send("❌ Hiba az email küldés során: " + error.message);
    }
});

/* eslint-disable no-unused-vars */  // **IDE figyelmeztetés kikapcsolása**
// **E-mail küldés**
async function sendEmail(to, subject, text) {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Utazók Kézikönyve" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });

        console.log(`✅ Email elküldve: ${subject}`);
    } catch (error) {
        console.error(`❌ Hiba az email küldésekor: ${error}`);
    }
}

async function sendUserEmail(name, email, destination, peopleCount, budget, departureDate, returnDate) {
    const text = `Kedves ${name}!\n\n
Köszönjük, hogy az Utazók Kézikönyvét választotta!\n
Az ajánlatkérés részletei:\n
- Úticél: ${destination}
- Utazók száma: ${peopleCount}
- Költségkeret: ${budget} Ft
- Időszak: ${departureDate} - ${returnDate}\n
Csapatunk hamarosan felveszi Önnel a kapcsolatot.\n
Üdvözlettel,\nUtazók Kézikönyve Csapata`;

    await sendEmail(email, "Köszönjük az ajánlatkérést!", text);
}

async function sendAdminEmail(destination, peopleCount, childrenAge, departureDate, returnDate, duration, travelMethod, accommodationType, mealPlan, extraNeeds, budget, contactName, contactEmail, contactPhone) {
    const text = `Új ajánlatkérés érkezett:\n
- Úticél: ${destination}
- Utazók száma: ${peopleCount}
- Gyermekek életkora: ${childrenAge}
- Időszak: ${departureDate} - ${returnDate}
- Időtartam: ${duration} nap
- Utazás módja: ${travelMethod}
- Szállás típusa: ${accommodationType}
- Ellátás típusa: ${mealPlan}
- Extra igények: ${extraNeeds}
- Kapcsolattartó neve: ${contactName}
- E-mail: ${contactEmail}
- Telefonszám: ${contactPhone}`;

    await sendEmail(process.env.EMAIL_USER, "Új ajánlatkérés érkezett!", text);
}

// **Szerver indítása**
app.listen(port, () => {
    console.log(`🚀 Szerver fut: http://localhost:${port}`);
});

app.get('/keep-alive', (req, res) => {
    console.log('🔄 Keep-Alive hívás érkezett.');
    res.send('Server is running');
});

setInterval(() => {
    console.log('🔄 Keep-Alive ping...');
}, 30000);
