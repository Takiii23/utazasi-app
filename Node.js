const axios = require('axios');

async function searchFlights() {
    const apiKey = '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'; // Cseréld ki a saját API kulcsodra
    const url = 'https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create';

    try {
        const response = await axios.post(url, {
            query: {
                market: 'HU',
                locale: 'hu-HU',
                currency: 'HUF',
                queryLegs: [
                    {
                        originPlaceId: { iata: 'BUD' },
                        destinationPlaceId: { iata: 'LON' },
                        date: { year: 2024, month: 12, day: 25 }
                    }
                ]
            },
            adults: 1
        }, {
            headers: {
                'x-api-key': apiKey // API kulcs megadása
            }
        });

        console.log(response.data);
    } catch (error) {
        console.error('Error fetching flights:', error);
    }
}

searchFlights();
