// Repülőút adatokat kereső szolgáltatás

async function getFlightData(origin, destination, date) {
    // Ez lehet egy valós API-hívás is, de most példaként egy helyi válasz
    return {
        flights: [
            {
                origin: origin,
                destination: destination,
                date: date,
                price: "$250",
                airline: "Example Airline"
            }
        ]
    };
}

module.exports = { getFlightData };
