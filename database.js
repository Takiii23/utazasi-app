import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Környezeti változók betöltése

const { Pool } = pkg;

// **Függvény az új adatbázis kapcsolat létrehozására**
function createPool() {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
}

let pool = createPool(); // Elsődleges kapcsolat

// **Adatbázis inicializálása**
async function initializeDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS requests (
            id SERIAL PRIMARY KEY,
            destination VARCHAR(255) NOT NULL,
            peopleCount INT NOT NULL,
            childrenAge TEXT,
            departureDate DATE NOT NULL,
            returnDate DATE NOT NULL,
            duration INT NOT NULL,
            travelMethod VARCHAR(100),
            accommodationType VARCHAR(100),
            mealPlan VARCHAR(100),
            extraNeeds TEXT,
            budget VARCHAR(50),
            contactName VARCHAR(255) NOT NULL,
            contactEmail VARCHAR(255) NOT NULL,
            contactPhone VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createTableQuery);
        console.log('✅ Az adatbázis tábla ellenőrizve vagy létrehozva!');
    } catch (error) {
        console.error('❌ Hiba a tábla létrehozásakor:', error);
    }
}

// **Keep-Alive mechanizmus**
async function checkDatabaseConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL kapcsolat aktív:', res.rows[0].now);
    } catch (error) {
        console.error('❌ PostgreSQL kapcsolat ellenőrzése sikertelen:', error);
    }
}

// **Hibakezelés - automatikus újracsatlakozás**
pool.on('error', async (err) => {
    console.error('❌ PostgreSQL kapcsolat megszakadt:', err);
    console.log('🔄 Újracsatlakozás...');

    try {
        pool = createPool(); // **Új kapcsolat létrehozása**
        await checkDatabaseConnection();
        console.log('✅ Újracsatlakozás sikeres!');
    } catch (reconnectError) {
        console.error('⚠️ Újracsatlakozás sikertelen:', reconnectError);
    }
});

// **Szerver indításakor futtatott ellenőrzések**
(async () => {
    try {
        console.log('🔍 PostgreSQL kapcsolat tesztelése...');
        await checkDatabaseConnection();
        await initializeDatabase();

        const res = await pool.query('SELECT COUNT(*) FROM requests;');
        console.log('📊 Adatok a requests táblából:', res.rows[0].count);
    } catch (error) {
        console.error('❌ Nem sikerült csatlakozni az adatbázishoz:', error);
    }
})();

// **Keep-Alive mechanizmus időzítése**
setInterval(checkDatabaseConnection, 60000); // 60 mp-ként ellenőrizzük

export default pool;
