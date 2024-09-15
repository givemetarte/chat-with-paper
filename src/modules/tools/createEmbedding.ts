import { getPref } from '../../utils/prefs';

export async function createEmbedding(text: string): Promise<number[]> {
    //   ztoolkit.log("Creating embedding for text:", text);

    const apiKey = getPref('apiKey') as string || '';
    if (!apiKey || apiKey.trim() === '') {
        return "API key is not set. Please set it in the addon preferences.";
    }

    const apiUrl = 'https://api.openai.com/v1/embeddings';
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
            input: text,
            model: "text-embedding-ada-002"
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
        }

        const result = await response.json();
        return result.data[0].embedding;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get response from ChatGPT: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
}

