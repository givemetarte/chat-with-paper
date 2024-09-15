import { config } from "../../../package.json";
import { getLocaleID, getString } from "../../utils/locale";
import { getPref } from '../../utils/prefs';

export function getApiKey(): string {
    const apiKey = getPref('apiKey') as string || '';
    ztoolkit.log(`Getting API key, value: ${apiKey}`);
    return apiKey;
}

export function getChatGPTResponse(question: string): Promise<string> {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error("API key is not set. Please set it in the addon preferences.");
    }
    
    const responses = [
        "That's an interesting question. Let me think about it.",
        "I understand your query. Here's what I think...",
        "Based on the information available, I would say...",
        "That's a complex topic. Here's a simplified explanation:",
        "Great question! Here's my perspective on that:",
    ];
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            resolve(`${randomResponse}\n\nRegarding "${question}": This is a placeholder response. In a real implementation, this would be replaced with an actual AI-generated answer.`);
        }, 1000); // 1초 지연을 주어 응답 시간을 시뮬레이션합니다.
    });
}