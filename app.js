import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import pg from 'pg';

dotenv.config();

console.log("📌 ENV változók ellenőrzése:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ OK" : "❌ NINCS MEGADVA");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ OK" : "❌ NINCS MEGADVA");
console.log("EMAIL_PASS:", process.env.EMAIL_PASSWORD ? "✅ OK" : "❌ NINCS MEGADVA");

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    next();
});


// **PostgreSQL kapcsolat Renderhez**
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Render esetén SSL szükséges
    }
});

// Middleware beállítások
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// **Szerver indítása**
console.log("✅ Szerver indítása...");

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

// **Adatbeküldő űrlap útvonal (iframe-hez)**
app.get('/form', (req, res) => {
    res.render('form'); // Ha az űrlap egy külön `form.ejs` fájlban van
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

// **Keep-Alive a Render miatt**
app.get('/keep-alive', (req, res) => {
    console.log('🔄 Keep-Alive hívás érkezett.');
    res.send('Server is running');
});

setInterval(() => {
    console.log('🔄 Keep-Alive ping...');
}, 30000);
