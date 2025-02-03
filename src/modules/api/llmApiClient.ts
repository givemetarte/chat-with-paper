import { config } from "../../../package.json";
import { getLocaleID, getString } from "../../utils/locale";
import { getPref } from '../../utils/prefs';

export function getApiKey(): string {
    const apiKey = getPref('apiKey') as string || '';
    // ztoolkit.log(`Getting API key, value: ${apiKey}`);
    return apiKey;
}

export async function getChatGPTResponse(question: string, context: string): Promise<string> {
    const apiKey = getApiKey(); // API 키를 가져옵니다.

    if (!apiKey || apiKey.trim() === '') {
        return "API key is not set. Please set it in the addon preferences.";
    }
    const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;
    ztoolkit.log(`Prompt: ${prompt}`);
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-2024-08-06",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = (errorData as { error?: { message?: string } }).error?.message || 'Unknown error';
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
        }

        const data = await response.json() as { choices?: { message: { content: string } }[] };

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            throw new Error("Received an empty response from ChatGPT.");
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get response from ChatGPT: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
}