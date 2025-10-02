const linkN8n = document.createElement("link");
linkN8n.rel = "stylesheet";
linkN8n.href = "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css";

const scriptJsonLd = document.createElement("script");
scriptJsonLd.src = "https://unpkg.com/jsonld/dist/jsonld.min.js";

document.head.appendChild(linkN8n);
document.head.appendChild(scriptJsonLd);

document.body.insertAdjacentHTML(
  "beforeend",
  `
            <div class="chatbot-assistant-ia">
                <div id="simon-chat"></div>
            </div>
        `
);
