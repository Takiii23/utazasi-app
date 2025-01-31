import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

async function testOpenAI() {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Ez egy egyszerű teszt.' }],
                max_tokens: 200,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
            }
        );
        console.log('OpenAI API válasz:', response.data.choices[0].message.content.trim());
    } catch (error) {
        console.error('Hiba történt az OpenAI API hívás során:', error);
    }
}

testOpenAI();
