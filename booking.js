const resp = await fetch(
    `https://developers.booking.com/_mock/metasearch/connect-api/open-api/demand-api-v3-compatible/search`,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer <YOUR_string_HERE>'
        },
        body: JSON.stringify({
            checkin: '2019-08-24',
            checkout: '2019-08-24',
            booker: {
                country: 'string',
                platform: 'ANDROID',
                travel_purpose: 'BUSINESS',
                user_groups: ['AUTHENTICATED']
            },
            currency: 'EUR',
            city: 0,
            country: 'nl',
            guests: {
                number_of_adults: 0,
                number_of_rooms: 0,
                allocation: [
                    {
                        children: [17],
                        number_of_adults: 1
                    }
                ],
                children: [17]
            },
            extras: ['EXTRA_CHARGES'],
            accommodations: [0],
            accommodation_facilities: [0],
            room_facilities: [0],
            accommodation_types: [0],
            brands: [0],
            airport: 'AMS',
            district: 0,
            landmark: 0,
            coordinates: {
                latitude: 0.1,
                longitude: 0.1,
                radius: 0.1
            },
            region: 0,
            rows: 1000,
            page: 'string'
        })
    }
);

const data = await resp.json();
console.log(data);