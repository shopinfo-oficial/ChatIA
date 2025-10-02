 import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";

        // Recupera dados do localStorage
        let customSessionId = localStorage.getItem("customSessionId");
        let dataHora = localStorage.getItem("dataHora");

        // Verifica se já passou de 24h
        const expirou = !dataHora || (new Date() - new Date(dataHora)) > (24 * 60 * 60 * 1000);

        if (!customSessionId || expirou) {
            // Gera nova sessão
            customSessionId = crypto.randomUUID();
            localStorage.setItem("customSessionId", customSessionId);
            localStorage.setItem("dataHora", new Date().toISOString());
            console.log("🆕 Nova sessão criada:", customSessionId);
        } else {
            console.log("♻️ Sessão existente:", customSessionId);
        }

        // Inicializa o chat
        const chat = createChat({
            webhookUrl: "https://primary-2mym-production.up.railway.app/webhook/0671a930-f3bf-4eb4-9139-8b1cc2a8f61e/chat",
            target: "#simon-chat",
            webhookConfig: {
                method: "POST",
                headers: {
                    "customSessionId": customSessionId
                }
            },
            metadata: {
                customSessionId: customSessionId
            },
            mode: "window",
            loadPreviousSession: true,
            initialMessages: [],
            i18n: {
                en: {
                    inputPlaceholder: "Digite sua mensagem..."
                }
            },

        });