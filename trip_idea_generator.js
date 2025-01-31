// Opcionális modul, ha később szeretnéd strukturáltabbá tenni az API-kat és kiszervezni a kéréseket

import axios from 'axios';

export async function
generateTripIdea(prompt) {
    const response = await axios.post('https://api.openai.com/v1/completions', {
        model: 'gpt-4-turbo',
        prompt,
        max_tokens: 500,
        n: 3,
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
    });

    return response.data.choices.map(choice => choice.text.trim());
}
