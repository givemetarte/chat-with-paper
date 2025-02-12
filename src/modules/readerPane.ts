import { config } from "../../package.json";
import { getLocaleID, getString } from "../utils/locale";
import { getChatGPTResponse } from './api/llmApiClient';
import { addMessage } from './components/ChatMessage';
import { pdfTextCache } from './tools/pdfTextCache';
import { splitTextIntoChunks } from './tools/splitTextIntoChunks';
import { createEmbedding } from './tools/createEmbedding';
import { SimpleVectorDB } from './tools/simpleVectorDB';
import { searchRelevantContext } from './tools/searchRelevant';

// SimpleVectorDB 인스턴스를 전역 또는 클로저에서 관리
let vectorDB: SimpleVectorDB | null = null;

export function registerChatWithPDFPaneSection() {
    Zotero.ItemPaneManager.registerSection({
        paneID: "chat-with-pdf-tabpanel",
        pluginID: config.addonID,
        header: {
            l10nID: getLocaleID("item-section-chatwithpaper-head-text"),
            icon: `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`,
        },
        sidenav: {
            l10nID: getLocaleID("item-section-chatwithpaper-sidenav-tooltip"),
            icon: `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`,
        },
        bodyXHTML: `
        <div id="chat-with-paper-container" style="display: flex; flex-direction: column; overflow: hidden;">
        <div id="chat-messages" style="flex-grow: 1; overflow-y: auto; margin-bottom: 10px; display: flex; flex-direction: column;">
            <!-- Chat messages will be appended here -->
            </div>
            <div style="background-color: #f0f0f0; border-radius: 8px; padding: 5px;">
                <html:textarea id="chat-input" placeholder="Ask a question about the Paper..." 
                    style="width: 100%; min-height: 20px; max-height: 150px; padding: 6px; border: 1px solid #ccc; border-radius: 8px; font-family: inherit; font-size: 14px; resize: none; overflow-y: auto; box-sizing: border-box; scrollbar-width: none; -ms-overflow-style: none;"/>
            </div>
        </div>
        `,
        onRender: async ({ body, item }) => {
            const chatContainer = body.querySelector('#chat-with-paper-container') as HTMLElement;
            const input = body.querySelector('#chat-input') as HTMLTextAreaElement;
            const chatMessages = body.querySelector('#chat-messages') as HTMLElement;
            
            if (chatContainer && input && chatMessages) {
                const cleanup = adjustContainerHeight(chatContainer, input);

                input.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        await handleUserInput(input, chatMessages, item);
                        
                    }
                });

                // 정리 함수 반환
                return cleanup;
            }
        },
    });
}


function adjustContainerHeight(chatContainer: HTMLElement, input: HTMLTextAreaElement) {
    const chatMessages = chatContainer.querySelector('#chat-messages') as HTMLElement;
    
    const adjustHeight = () => {
        const windowHeight = window.outerHeight;
        chatContainer.style.height = `${windowHeight - 130}px`;
        adjustMessagesHeight();
    };

    const adjustMessagesHeight = () => {
        if (chatMessages) {
            const containerHeight = chatContainer.clientHeight;
            const inputHeight = input.offsetHeight;
            chatMessages.style.height = `${containerHeight - inputHeight - 10}px`; 
        }
    };

    const adjustInputHeight = () => {
        input.style.height = '10px';
        input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
        input.scrollTop = 0;
        adjustMessagesHeight();
    };

    // adjust initial height
    adjustHeight();
    adjustInputHeight();

    // set event listeners
    window.addEventListener('resize', adjustHeight);
    input.addEventListener('input', adjustInputHeight);

    // return cleanup function
    return () => {
        window.removeEventListener('resize', adjustHeight);
        input.removeEventListener('input', adjustInputHeight);
    };
}


async function handleUserInput(input: HTMLTextAreaElement, chatMessages: HTMLElement, item: Zotero.Item) {
    const question = input.value.trim();
    if (!question) return;

    ztoolkit.log("Question:", question);
    addMessage(chatMessages, question, 'user');
    input.value = "";

    // deactivate the input field
    input.disabled = true; 

    addMessage(chatMessages, "💭 Thinking...", "ai");
    const thinkingMessage = chatMessages.lastElementChild as HTMLElement;
    
    try {
        // 벡터 DB가 없을 때만 초기화
        if (!vectorDB) {
            const pdfText = await pdfTextCache.getPDFText(item);
            const chunks = await splitTextIntoChunks(pdfText);
            
            vectorDB = new SimpleVectorDB();
            for (const chunk of chunks) {
                const embedding = await createEmbedding(chunk);
                
                if (embedding.length === 0) {
                    return "API key is not set. Please set it in the addon preferences."; // 함수의 실행을 중단하거나 적절한 처리를 추가
                }

                vectorDB.add(chunk, embedding);
            }
        }

        const relevantContext = await searchRelevantContext(vectorDB, question);
        const response = await getChatGPTResponse(question, relevantContext);

        if (thinkingMessage && chatMessages.contains(thinkingMessage)) {
            // Remove the thinking message
            chatMessages.removeChild(thinkingMessage);
            // Add the response message with the same style as addMessage
            addMessage(chatMessages, response, 'ai');
        } else {
            addMessage(chatMessages, response, 'ai');
        }
    } catch (error) {
        ztoolkit.log("Error getting ChatGPT response:", error);

        if (thinkingMessage && chatMessages.contains(thinkingMessage)) {
            // Remove the thinking message
            chatMessages.removeChild(thinkingMessage);
            // Add the error message with the same style as addMessage
            addMessage(chatMessages, "Sorry, I couldn't get a response. Please try again.", 'ai');
        } else {
            addMessage(chatMessages, "Sorry, I couldn't get a response. Please try again.", 'ai');
        }
    } finally {
        input.disabled = false;
        input.focus();
    }
}

