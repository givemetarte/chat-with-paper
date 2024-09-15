import { config } from "../../package.json";
import { getLocaleID, getString } from "../utils/locale";
import { addMessage } from './components/ChatMessage';
import { getChatGPTResponse } from './components/ChatGPT';

export function registerChatWithPDFPaneSection() {
    Zotero.ItemPaneManager.registerSection({
        paneID: "chat-with-pdf-tabpanel",
        pluginID: config.addonID,
        header: {
            l10nID: getLocaleID("item-section-chatwithpdf-head-text"),
            icon: `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`,
        },
        sidenav: {
            l10nID: getLocaleID("item-section-chatwithpdf-sidenav-tooltip"),
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
            const chatMessages = body.querySelector('#chat-messages') as HTMLElement;
            const input = body.querySelector('#chat-input') as HTMLTextAreaElement;
            
            if (chatContainer && chatMessages && input) {
                const adjustContainerHeight = () => {
                    const windowHeight = window.outerHeight;
                    chatContainer.style.height = `${windowHeight - 130}px`;
                    adjustMessagesHeight();
                };

                const adjustMessagesHeight = () => {
                    const containerHeight = chatContainer.clientHeight;
                    const inputHeight = input.offsetHeight;
                    chatMessages.style.height = `${containerHeight - inputHeight - 10}px`; 
                };

                const adjustInputHeight = () => {
                    input.style.height = '10px';
                    input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
                    input.scrollTop = 0;
                    adjustMessagesHeight();
                };

                input.addEventListener('input', () => {
                    adjustInputHeight();
                    input.setSelectionRange(input.value.length, input.value.length);
                });

                input.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const question = input.value.trim();
                        if (question) {
                            ztoolkit.log("Question:", question);
                            addMessage(chatMessages, question, 'user');
                            input.value = "";
                            adjustInputHeight();

                            // deactivate the input field
                            input.disabled = true; 

                            addMessage(chatMessages, "Thinking...", "ai");
                            const thinkingMessage = chatMessages.lastElementChild as HTMLElement;
                            
                            try {
                                const response = await getChatGPTResponse(question);

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
                    }
                });

                // Initial height adjustments
                adjustContainerHeight();
                adjustInputHeight();

                // resize when window is resized
                window.addEventListener('resize', adjustContainerHeight);

                // Clean up function
                return () => {
                    window.removeEventListener('resize', adjustContainerHeight);
                };
            }     
        },
    });
}
