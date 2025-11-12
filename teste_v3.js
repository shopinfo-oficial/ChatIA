const linkChatSimon = document.createElement("link");
linkChatSimon.rel = "stylesheet";
linkChatSimon.href = "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css";

const scriptJsonLd = document.createElement("script");
scriptJsonLd.src = "https://unpkg.com/jsonld/dist/jsonld.min.js";

document.head.appendChild(linkChatSimon);
document.head.appendChild(scriptJsonLd);

document.body.insertAdjacentHTML(
  "beforeend",
  `
            <div class="chatbot-assistant-ia">
                <div id="simon-chat"></div>
            </div>
        `
);

document.head.insertAdjacentHTML(
  "beforeend",
  '<link rel="stylesheet" href="https://shopinfo-oficial.github.io/ChatIA/chatIA.css">'
);

import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";

// Recupera dados do localStorage
let customSessionId = localStorage.getItem("customSessionId");
let dataHora = localStorage.getItem("dataHora");
let isVishPinou = localStorage.getItem("isVishPinou") === "true";

// Verifica se já passou de 24h
const agora = new Date();
const expirou = !dataHora || agora - new Date(dataHora) > 24 * 60 * 60 * 1000;

// 🔹 Caso tenha passado 24h, limpa sessão e feedback
if (expirou) {
  console.log("🕒 Mais de 24h se passaram — limpando sessão e feedback...");

  // Remove dados antigos
  localStorage.removeItem("feedbackEnviado");
  localStorage.removeItem("pageSessionData");
  localStorage.removeItem("customSessionId");
  localStorage.removeItem("dataHora");
  localStorage.removeItem("isVishPinou");

  // Gera nova sessão e data
  customSessionId = crypto.randomUUID();
  localStorage.setItem("customSessionId", customSessionId);

  console.log("🆕 Nova sessão criada após 24h:", customSessionId);
} else {
  console.log("♻️ Sessão existente:", customSessionId);
}

// 🔹 Recupera novamente após o possível reset
isVishPinou = localStorage.getItem("isVishPinou") === "true";

// Inicializa o chat
const chat = createChat({
  webhookUrl:
    "https://primary-2mym-production.up.railway.app/webhook/0671a930-f3bf-4eb4-9139-8b1cc2a8f61e/chat",
  target: "#simon-chat",
  webhookConfig: {
    method: "POST",
    headers: {
      customSessionId: customSessionId,
      isVishPinou: isVishPinou,
    },
  },
  metadata: {
    customSessionId: customSessionId,
    isVishPinou: isVishPinou,
  },
  mode: "window",
  loadPreviousSession: true,
  initialMessages: [],
  i18n: {
    en: {
      inputPlaceholder: "Digite sua mensagem...",
    },
  },
});

function initializeChatUI() {
  const chatWrapper = document.querySelector(".chat-window-wrapper");
  const chatToggle = document.querySelector(".chat-window-toggle");

  if (!chatWrapper || !chatToggle) return;

  // Backdrop invisível (clicar fecha o chat)
  const backdrop = document.createElement("div");
  backdrop.classList.add("chat-backdrop-invisible");
  document.body.appendChild(backdrop);

  // Âncora para restaurar o toggle ao lugar original
  const toggleAnchor = document.createComment("toggle-anchor");
  if (chatToggle.parentElement) {
    chatToggle.parentElement.insertBefore(toggleAnchor, chatToggle.nextSibling);
  }

  // Move o toggle para logo abaixo de .chat-info dentro do header
  function moveToggleIntoHeader() {
    const header = document.querySelector(".chat-header");
    const chatInfo = header?.querySelector(".chat-info");
    if (!header || !chatInfo || !chatToggle) return;
    chatInfo.insertAdjacentElement("afterend", chatToggle);
    chatToggle.classList.add("toggle-inside");
    chatToggle.setAttribute("aria-label", "Fechar chat");
  }

  // Restaura o toggle exatamente ao lugar original
  function restoreToggleToOriginalPlace() {
    if (toggleAnchor?.parentNode && chatToggle) {
      toggleAnchor.parentNode.insertBefore(
        chatToggle,
        toggleAnchor.nextSibling
      );
      chatToggle.classList.remove("toggle-inside");
      chatToggle.setAttribute("aria-label", "Abrir chat");

      // 🔹 restaura o SVG padrão
      chatToggle.innerHTML = `
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <path fill="currentColor" d="M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.24 0-2.43-.18-3.53-.5C5.55 21 2 21 2 21c2.33-2.33 2.7-3.9 2.75-4.5C3.05 15.07 2 13.13 2 11c0-4.42 4.5-8 10-8"></path>
                            </svg>
                            `;
    }
  }

  function openChat() {
    chatWrapper.classList.add("is-open");
    moveToggleIntoHeader();
  }

  function closeChat() {
    chatWrapper.classList.remove("is-open");
    restoreToggleToOriginalPlace();
  }

  // Clique no próprio toggle: abre se fechado, fecha (e restaura) se aberto
  chatToggle.addEventListener("click", async function () {
    // 🔹 Se o chat estiver aberto, vamos fechar e possivelmente abrir o modal
    if (chatWrapper.classList.contains("is-open")) {
      closeChat();

      // 🔸 Espera o fechamento visual
      setTimeout(async () => {
        try {
          const jaEnviado = localStorage.getItem("feedbackEnviado") === "true";
          if (jaEnviado) {
            console.log("✅ Feedback já enviado — modal não será exibido.");
            return;
          }

          // 🔸 Busca histórico
          const history = await getChatHistory();
          const temHistorico = Array.isArray(history) && history.length > 0;

          if (temHistorico) {
            console.log(
              "🟢 Histórico encontrado — exibindo modal de feedback..."
            );
            showFeedbackModal();
          } else {
            console.log("ℹ️ Nenhum histórico encontrado — não exibe modal.");
          }
        } catch (err) {
          console.error("❌ Erro ao verificar histórico:", err);
        }
      }, 150);

      // 🔹 Se o chat estiver fechado, apenas abre normalmente
    } else {
      openChat();
    }
  });

  // Clique no backdrop fecha e restaura
  backdrop.addEventListener("click", closeChat);

  // Se seu tema tiver algum botão .close-button, mantemos consistente
  const closeButton = document.querySelector(".close-button");
  if (closeButton) {
    closeButton.addEventListener("click", closeChat);
  }

  function moveToggleIntoHeader() {
    const header = document.querySelector(".chat-header");
    const chatInfo = header?.querySelector(".chat-info");
    if (!header || !chatInfo || !chatToggle) return;

    chatInfo.insertAdjacentElement("afterend", chatToggle);
    chatToggle.classList.add("toggle-inside");
    chatToggle.setAttribute("aria-label", "Fechar chat");

    // 🔹 troca o conteúdo do botão para a imagem desejada
    chatToggle.innerHTML = `
                        <img src="https://cdn-icons-png.flaticon.com/512/458/458595.png" 
                            alt="Fechar chat" 
                            title="Fechar" 
                            class="img-small" 
                            style="width:24px;height:24px;"/>
                    `;
  }

  // ====== Cabeçalho do chat (mantém seu padrão) ======
  function updateChatHeader() {
    const chatHeader = document.querySelector(".chat-header");
    if (!chatHeader) return;

    const productName = "IA Simon Assist";
    const limitedProductName =
      productName.length > 60
        ? productName.substring(0, 60) + "..."
        : productName;

    // Monta o header SEM o botão X (vamos usar o toggle dentro do header)
    chatHeader.innerHTML = `
      <div class="chat-info">
        <img src="https://media.istockphoto.com/id/1634258551/pt/vetorial/ai-icon-artificial-intelligence-logo-machine-learning-generate-image-amd-text-sign.jpg?s=612x612&w=0&k=20&c=okv6FCtGF2SnfKfSNZMU8EHCzp4QFtIumVO2OKWTWx0=" />
        <div class="chat-heading">
          <h1>${limitedProductName}</h1>
          <div class="chat-status"><div class="status-dot"></div> Simon AI está online</div>
        </div>
      </div>
    `;

    showWelcomeMessage(limitedProductName);

    // Se já estiver aberto quando o header for atualizado, garante o toggle no header
    if (chatWrapper.classList.contains("is-open")) {
      moveToggleIntoHeader();
    }
  }

  // Função para adicionar uma mensagem de boas-vindas ao corpo do chat
  function showWelcomeMessage(limitedProductName) {
    const chatBody = document.querySelector(".chat-body");

    if (chatBody) {
      const welcomeContainer = document.createElement("div");
      welcomeContainer.classList.add("chat-welcome-message");

      const welcomeContent = `
                        <div class="welcome-content">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot mx-auto h-12 w-12 text-primary">
                                <path d="M12 8V4H8"></path>
                                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                                <path d="M2 14h2"></path>
                                <path d="M20 14h2"></path>
                                <path d="M15 13v2"></path>
                                <path d="M9 13v2"></path>
                            </svg>
                            <h2 class="welcome-title">Bem-vindo ao Simon Assist</h2>
                            <p class="welcome-text">Pergunte-me qualquer coisa sobre o ${limitedProductName}!</p>
                        </div>
                    `;
      welcomeContainer.innerHTML = welcomeContent;

      const chatMessagesList = chatBody.querySelector(".chat-messages-list");
      if (chatMessagesList) {
        chatBody.insertBefore(welcomeContainer, chatMessagesList);
      } else {
        chatBody.appendChild(welcomeContainer);
      }
    }
  }

  if (chatWrapper.classList.contains("is-open")) {
    moveToggleIntoHeader();
  } else {
    restoreToggleToOriginalPlace();
  }

  updateChatHeader();
}

initializeChatUI();

function CTA() {
  // ======== BLOCO DE CRIAÇÃO DO CTA ========
  function createSimonCTA(isMobile) {
    const wrapper = document.createElement("div");
    wrapper.id = "simon-help-box";
    wrapper.style.cssText = `
      display:flex;
      justify-content:center;
      margin-top:${isMobile ? "20px" : "0px"};
      margin-bottom:0px;
      width:100%;
      animation:fadeIn .4s ease;
    `;

    wrapper.innerHTML = `
      <section style="
       
      
        padding:${isMobile ? "16px" : "15px"};
        color:#ddd;
        max-width:${isMobile ? "95%" : "103%"};
        text-align:center;
        font-family:'Roboto',sans-serif;
        display: flex;
        position: absolute;
      ">
        <h3 style="
          color:#fff;
          font-size:${isMobile ? "16px" : "14px"};
          font-weight:700;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          margin-bottom:0px;
              text-align: left;
        ">
          <img src="https://cdn-icons-png.flaticon.com/512/764/764690.png" width="24" height="24" alt="Simon" style="filter: brightness(0) saturate(100%) invert(79%) sepia(94%) saturate(7472%) hue-rotate(117deg) brightness(105%) contrast(101%);">
          Precisa de ajuda para decidir?
        </h3>
        <p style="
          font-size:${isMobile ? "14px" : "13px"};
          text-align: left;
          margin-left: 11px;
          color:#bbb;
          display: flex;
          align-items: center;
          margin-bottom:${isMobile ? "14px" : "0px"};
        ">
          Descubra em segundos se este produto é ideal para você!
        </p>
        <button id="btn-open-simon-chat" style="
          background:linear-gradient(90deg,#00ffa3,#00c0ff);
          color:#000;
          border:none;
          border-radius:8px;
          padding:${isMobile ? "10px 20px" : "14px 12px"};
          font-weight:700;
          width: 285px;
          cursor:pointer;
          font-size:${isMobile ? "15px" : "14px"};
          box-shadow:0 0 12px rgba(0,255,170,0.4);
          transition:all .3s ease;
        " onmouseover="this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='brightness(1)'">
          💬 Falar com o Simon
        </button>
      </section>

      <style>
        @keyframes fadeIn {
          from {opacity:0;transform:translateY(10px);}
          to {opacity:1;transform:translateY(0);}
        }
      </style>
    `;

    // 🔹 Ao clicar no botão, abre o modal do chat
    setTimeout(() => {
      const btn = wrapper.querySelector("#btn-open-simon-chat");
      if (btn) {
        btn.addEventListener("click", function () {
          const chatWrapper = document.querySelector(".chat-window-wrapper");
          const toggle = document.querySelector(".chat-window-toggle");

          if (chatWrapper && toggle) {
            if (!chatWrapper.classList.contains("is-open")) {
              toggle.click(); // abre o chat
            } else {
              chatWrapper.classList.add("is-open");
            }

            // foca no campo de mensagem (melhor UX)
            setTimeout(() => {
              const input = chatWrapper.querySelector(
                "textarea, input[type='text']"
              );
              if (input) input.focus();
            }, 400);
          } else {
            console.warn("⚠️ Chat do Simon não encontrado para abrir.");
          }
        });
      }
    }, 1000);

    return wrapper;
  }

  function injectSimonCTAOnVishPinou() {
    const interval = setInterval(() => {
      const section = document.querySelector(
        ".empty-search__title .container > div"
      );
      const p = section?.querySelector("p");
      const a = section?.querySelector("a.call-to-action");

      if (section && p && a && !document.querySelector("#simon-help-box")) {
        clearInterval(interval);

        // 🔹 Marca no localStorage que é a página "Vish, Pinou"
        localStorage.setItem("isVishPinou", "true");
        console.log("📍 Página Vish, Pinou detectada — isVishPinou: true");

        const wrapper = document.createElement("div");
        wrapper.id = "simon-help-box";
        wrapper.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin: 15px 0;
      `;

        wrapper.innerHTML = `
        <button id="btn-open-simon-chat" style="
          background:linear-gradient(90deg,#00ffa3,#00c0ff);
          color:#000;
          border:none;
          border-radius:8px;
          padding:12px 22px;
          font-weight:700;
          font-size:15px;
          cursor:pointer;
          box-shadow:0 0 12px rgba(0,255,170,0.4);
          transition:all .3s ease;
        " onmouseover="this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='brightness(1)'">
          💬 Falar com o Simon
        </button>
        <p style="margin-top:8px;color:#aaa;font-size:13px;text-align:center;">
          Nosso assistente virtual pode te ajudar a encontrar o que procura 👇
        </p>
      `;

        // 🔹 Insere o CTA logo entre o <p> e o <a>
        p.insertAdjacentElement("afterend", wrapper);
        console.log("✅ CTA Simon inserido na página Vish, Pinou.");

        // 🔹 Ação do botão
        const btn = wrapper.querySelector("#btn-open-simon-chat");
        btn.addEventListener("click", () => {
          const chatWrapper = document.querySelector(".chat-window-wrapper");
          const toggle = document.querySelector(".chat-window-toggle");

          if (chatWrapper && toggle) {
            if (!chatWrapper.classList.contains("is-open")) {
              toggle.click();
            } else {
              chatWrapper.classList.add("is-open");
            }

            setTimeout(() => {
              const input = chatWrapper.querySelector(
                "textarea, input[type='text']"
              );
              if (input) input.focus();
            }, 400);
          } else {
            console.warn("⚠️ Chat do Simon não encontrado para abrir.");
          }
        });
      }
    }, 500);
  }

  // ✅ Executa automaticamente
  injectSimonCTAOnVishPinou();

  // ======== WEB (DESKTOP) ========
  function injectSimonWebCTASeparate() {
    // 1) Caso "Vish, Pinou" (resultado vazio): insere entre <p> e <a.call-to-action>
    var emptyP = document.querySelector(".container > div > p");
    var emptyA = document.querySelector(".container > div > a.call-to-action");
    if (emptyP && emptyA) {
      if (document.querySelector("#simon-help-box")) return;
      var isMobile = window.innerWidth <= 768;
      var ctaEmpty = createSimonCTA(isMobile);
      emptyP.insertAdjacentElement("afterend", ctaEmpty);
      console.log(
        "✅ CTA Simon inserido entre <p> e <a.call-to-action> (Vish, Pinou)."
      );
      return;
    }

    // 2) Comportamento original da PDP (desktop)
    const firstBlock = document.querySelector(
      ".productDescription-hexagon.mobile-notshow"
    );
    if (!firstBlock || document.querySelector("#simon-help-box")) return;

    // Cria a segunda div com a mesma classe
    const secondBlock = document.createElement("div");
    secondBlock.className = "productDescription-hexagon mobile-notshow";
    secondBlock.style.top = "545px";
    secondBlock.style.setProperty("box-shadow", "none", "important");

    // Adiciona o CTA dentro
    const cta = createSimonCTA(false);
    secondBlock.appendChild(cta);

    // Insere logo abaixo do primeiro bloco
    firstBlock.insertAdjacentElement("afterend", secondBlock);
    console.log(
      "🖥️ CTA Simon adicionado no desktop dentro de nova div .productDescription-hexagon."
    );

    // ======== CSS EXTRA (somente desktop) — evita duplicar
    if (!document.querySelector("#simon-cta-desktop-style")) {
      const style = document.createElement("style");
      style.id = "simon-cta-desktop-style";
      style.textContent = `
      .product__wrapper.product__single {
        margin-bottom: 180px !important;
      }
    `;
      document.head.appendChild(style);
    }
  }

  // ======== MOBILE ========
  function injectSimonMobileCTA() {
    const skuInfo = document.querySelector(".product__info--sku");
    const buyButton = document.querySelector(".buy-button-ref");
    if (!skuInfo || !buyButton || document.querySelector("#simon-help-box"))
      return;

    const cta = createSimonCTA(true);
    buyButton.parentElement.insertAdjacentElement("afterend", cta);
    console.log("📱 CTA Simon adicionado abaixo do botão Comprar (mobile).");
  }

  // ======== EXECUÇÃO ========
  const isMobile = window.innerWidth <= 768;

  const check = setInterval(() => {
    if (
      !isMobile &&
      document.querySelector(".productDescription-hexagon.mobile-notshow")
    ) {
      injectSimonWebCTASeparate();
      clearInterval(check);
    }
    if (isMobile && document.querySelector(".buy-button-ref")) {
      injectSimonMobileCTA();
      clearInterval(check);
    }
  }, 500);
}

CTA();

// O resto do seu código pode ser mantido como está

async function sendProductToBackend(pageText) {
  const sessionId = localStorage.getItem("customSessionId");
  const dataHora = localStorage.getItem("dataHora");
  const vishPinou = localStorage.getItem("isVishPinou");

  // Recupera o ID referente à URL atual
  const currentUrl = window.location.href;
  const pageKey = "pageSessionData";
  const storedData = JSON.parse(localStorage.getItem(pageKey) || "{}");
  const pageSession = storedData[currentUrl] || {};

  const payload = {
    sessionId: sessionId || null,
    pageInfo: {
      id: pageSession.id || null,
      dataHora: pageSession.dataHora || dataHora || null,
      url: currentUrl,
      isVishPinou: vishPinou === "true",
    },
    pageText,
  };

  try {
    await fetch(
      "https://primary-2mym-production.up.railway.app/webhook/b8c05d47-b218-4706-9552-e4dbd6de7ddc",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    console.log("📤 Dados enviados com sucesso:", payload);
  } catch (e) {
    console.error("❌ Erro ao enviar dados:", e);
  }
}

function getOnlyTextFromBody() {
  let walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parentTag = node.parentNode.tagName?.toLowerCase();
        if (["script", "style", "noscript"].includes(parentTag)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    },
    false
  );

  let textContent = [];
  let node;

  while ((node = walker.nextNode())) {
    textContent.push(node.nodeValue.trim());
  }

  let fullText = textContent.join(" ");
  fullText = fullText.replace(/\s+/g, " ").trim();

  return fullText;
}

async function getChatHistory() {
  // ====== CONFIG ======
  var RENDER_OLDEST_FIRST = true; // histórico em ordem cronológica
  var ADD_SECTION_TITLE = false; // título opcional "— Histórico —"

  // ====== HELPERS ======
  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function messageKey(role, text) {
    return (role + "|" + (text || "")).trim();
  }

  function createMessageEl(role, text) {
    var wrap = el(
      "div",
      "chat-message " +
        (role === "bot" ? "chat-message-from-bot" : "chat-message-from-user")
    );

    // marca para deduplicar e identificar que veio do histórico
    wrap.setAttribute("data-msg-key", messageKey(role, text));
    wrap.setAttribute("data-history", "1");

    // opcional "actions"
    var actions = el("div", "chat-message-actions");
    wrap.appendChild(actions);

    var md = el("div", "chat-message-markdown");
    var p = el("p", "");
    p.textContent = text || "";
    md.appendChild(p);
    wrap.appendChild(md);

    return wrap;
  }

  function alreadyRendered(container, role, text) {
    var key = messageKey(role, text);
    var sel = '[data-msg-key="' + CSS.escape(key) + '"]';
    return container.querySelector(sel) !== null;
  }

  // ====== FETCH ======
  var sessionId = localStorage.getItem("customSessionId");
  if (!sessionId) {
    console.warn("⚠️ Nenhum customSessionId encontrado no localStorage");
    return [];
  }

  try {
    var res = await fetch(
      "https://primary-2mym-production.up.railway.app/webhook/62893aca-28f9-4d92-8a89-4c20d55b310e?sessionId=" +
        encodeURIComponent(sessionId)
    );
    if (!res.ok) throw new Error("HTTP " + res.status);

    var data = await res.json();

    // [ { history: [...] } ] OU { history: [...] }
    var history = Array.isArray(data)
      ? data[0] && data[0].history
      : data && data.history;
    if (!Array.isArray(history) || !history.length) return [];

    // ordem interna do histórico
    // 🔄 inverte a ordem dos dados antes de renderizar (do mais antigo para o mais novo)
    var list = history.slice().reverse();

    // ====== RENDER ======
    var container = document.querySelector(".chat-messages-list");
    if (!container) {
      console.warn("⚠️ Container .chat-messages-list não encontrado");
      return list;
    }

    // Se já renderizamos todo o histórico antes, pula
    var anyNew = false;
    for (var i = 0; i < list.length; i++) {
      var pair = list[i] || {};
      var q = pair.Q != null ? String(pair.Q) : "";
      var a = pair.A != null ? String(pair.A) : "";
      if (
        (q && !alreadyRendered(container, "user", q)) ||
        (a && !alreadyRendered(container, "bot", a))
      ) {
        anyNew = true;
        break;
      }
    }
    if (!anyNew) return list; // nada novo

    // Monta fragmento com o histórico (já deduplicado ao inserir)
    var frag = document.createDocumentFragment();

    if (ADD_SECTION_TITLE) {
      var title = el("div", "chat-message chat-message-from-bot");
      title.setAttribute("data-history-title", "1");
      var md = el("div", "chat-message-markdown");
      var p = el("p", "");
      p.textContent = "— Histórico —";
      md.appendChild(p);
      title.appendChild(md);
      frag.appendChild(title);
    }

    for (var j = 0; j < list.length; j++) {
      var pair2 = list[j] || {};
      var q2 = pair2.Q != null ? String(pair2.Q) : "";
      var a2 = pair2.A != null ? String(pair2.A) : "";
      if (q2 && !alreadyRendered(container, "user", q2))
        frag.appendChild(createMessageEl("user", q2));
      if (a2 && !alreadyRendered(container, "bot", a2))
        frag.appendChild(createMessageEl("bot", a2));
    }

    // 🔹 HISTÓRICO sempre no topo
    container.prepend(frag);

    // 🔹 Scroll para o fim (pra ver as últimas msgs)
    container.scrollTop = container.scrollHeight;

    return list;
  } catch (e) {
    console.error("❌ Erro ao buscar histórico:", e);
    return [];
  }
}

// ======= MODAL DE FEEDBACK =======
function showFeedbackModal() {
  console.log("🟢 Abrindo modal de feedback...");

  // ======= BACKDROP =======
  const backdrop = document.createElement("div");
  backdrop.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    backdrop-filter: blur(6px);
    background: rgba(0,0,0,0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.03s ease forwards;
  `;

  // ======= MODAL =======
  const modal = document.createElement("div");
  modal.style.cssText = `
    background: radial-gradient(circle at top, #202020 0%, #0e0e0e 100%);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    padding: 28px 30px 25px;
    border-radius: 14px;
    text-align: center;
    max-width: 360px;
    width: 92%;
    box-shadow: 0 0 18px rgba(0,255,163,0.3);
    position: relative;
    transform: scale(0.9);
    opacity: 0;
    animation: popIn 0.035s ease forwards;
    font-family: 'Roboto', sans-serif;
  `;

  // ======= BOTÃO FECHAR =======
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✖";
  closeBtn.style.cssText = `
    position: absolute;
    top: 12px; right: 14px;
    background: none;
    border: none;
    color: #888;
    font-size: 20px;
    cursor: pointer;
    transition: color 0.2s ease;
  `;
  closeBtn.onmouseenter = () => (closeBtn.style.color = "#fff");
  closeBtn.onmouseleave = () => (closeBtn.style.color = "#888");

  // ======= TÍTULO =======
  const title = document.createElement("h3");
  title.textContent = "O Simon conseguiu te ajudar?";
  title.style.cssText = `
    margin-bottom: 18px;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.3px;
  `;

  // ======= DESCRIÇÃO =======
  const desc = document.createElement("p");
  desc.textContent =
    "Sua opinião ajuda a deixar o Simon cada vez mais afiado ⚡";
  desc.style.cssText = `
    color: #aaa;
    font-size: 14px;
    margin-bottom: 24px;
    line-height: 1.4;
  `;

  // ======= BOTÕES =======
  const btnContainer = document.createElement("div");
  btnContainer.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 12px;
  `;

  const btnSim = document.createElement("button");
  btnSim.textContent = "Sim 😄";
  btnSim.style.cssText = `
    background: linear-gradient(90deg,#00ffa3,#00c0ff);
    color: #000;
    border: none;
    padding: 10px 22px;
    border-radius: 8px;Dados enviados com sucesso:
    cursor: pointer;
    font-weight: 700;
    font-size: 14px;
    transition: all 0.25s ease;
    box-shadow: 0 0 10px rgba(0,255,170,0.4);
  `;
  btnSim.onmouseenter = () => (btnSim.style.filter = "brightness(1.2)");
  btnSim.onmouseleave = () => (btnSim.style.filter = "brightness(1)");

  const btnNao = document.createElement("button");
  btnNao.textContent = "Não 😕";
  btnNao.style.cssText = `
    background: linear-gradient(90deg,#ff4d4d,#a80000);
    color: #fff;
    border: none;
    padding: 10px 22px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 14px;
    transition: all 0.25s ease;
    box-shadow: 0 0 10px rgba(255,0,0,0.3);
  `;
  btnNao.onmouseenter = () => (btnNao.style.filter = "brightness(1.2)");
  btnNao.onmouseleave = () => (btnNao.style.filter = "brightness(1)");

  btnContainer.append(btnSim, btnNao);

  // ======= INSERE ELEMENTOS =======
  modal.append(closeBtn, title, desc, btnContainer);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // ======= ANIMAÇÕES =======
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from {opacity:0;} to {opacity:1;}
    }
    @keyframes popIn {
      from {opacity:0; transform:scale(0.85);}
      to {opacity:1; transform:scale(1);}
    }
    @keyframes fadeOut {
      from {opacity:1; transform:scale(1);}
      to {opacity:0; transform:scale(0.9);}
    }
  `;
  document.head.appendChild(style);

  // ======= FECHAR MANUALMENTE =======
  function fecharModal() {
    modal.style.animation = "fadeOut 0.3s ease forwards";
    backdrop.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => {
      document.body.removeChild(backdrop);
      localStorage.setItem("feedbackModalFechado", "true");
      console.log("❌ Modal fechado sem feedback.");
    }, 250);
  }

  closeBtn.addEventListener("click", fecharModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) fecharModal();
  });

  // ======= BOTÕES =======
  btnSim.addEventListener("click", async () => {
    await sendFeedback("sim");
    mostrarAgradecimento("Valeu pelo feedback 💚");
  });

  btnNao.addEventListener("click", async () => {
    await sendFeedback("nao");
    mostrarAgradecimento("Feedback recebido 💪");
  });

  // ======= FUNÇÃO DE AGRADECIMENTO =======
  function mostrarAgradecimento(texto) {
    modal.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;animation:fadeIn 0.4s ease;">
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="#00ffa3" viewBox="0 0 24 24">
          <path d="M12 0C5.372 0 0 5.373 0 12c0 6.628 5.372 12 12 12s12-5.372 12-12C24 5.373 18.628 0 12 0zM10.146 17.854l-4.146-4.146 1.414-1.414 2.732 2.732 7.586-7.586 1.414 1.414-9 9z"/>
        </svg>
        <h3 style="margin-top:16px;font-size:17px;">${texto}</h3>
      </div>
    `;
    setTimeout(() => {
      modal.style.animation = "fadeOut 0.4s ease forwards";
      backdrop.style.animation = "fadeOut 0.4s ease forwards";
      setTimeout(() => document.body.removeChild(backdrop), 400);
    }, 150);
  }
}

// 🔹 Envia feedback para o backend

async function sendFeedback(valor) {
  const sessionId = localStorage.getItem("customSessionId");
  const url = window.location.href;

  localStorage.setItem("feedbackEnviado", "false");

  try {
    await fetch(
      "https://primary-2mym-production.up.railway.app/webhook/7137d3d0-a0f2-4616-a0a8-3b688720e31b",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          url,
          feedback: valor,
          dataHora: new Date().toISOString(),
        }),
      }
    );

    localStorage.setItem("feedbackEnviado", "true");
    console.log("📝 Feedback enviado:", valor);
  } catch (e) {
    console.error("❌ Erro ao enviar feedback:", e);
    localStorage.setItem("feedbackEnviado", "false");
  }
}

function managePageSession() {
  const currentUrl = window.location.href;
  const pageKey = "pageSessionData";

  // Recupera o objeto salvo no localStorage
  let storedData = JSON.parse(localStorage.getItem(pageKey) || "{}");

  // Recupera dataHora global
  const dataHora = localStorage.getItem("dataHora");
  const expirou =
    !dataHora || new Date() - new Date(dataHora) > 24 * 60 * 60 * 1000;

  // 🔹 Se expirou, limpa tudo
  if (expirou) {
    console.log("🧹 Expirou — limpando dados de pageSessionData...");
    localStorage.removeItem(pageKey); // remove todos os IDs de página
    return; // sai da função (vai recriar no próximo carregamento)
  }

  // 🔹 Se ainda válido, verifica se já existe um ID para esta URL
  if (!storedData[currentUrl]) {
    const newId = crypto.randomUUID();

    storedData[currentUrl] = {
      id: newId,
      dataHora: dataHora,
    };

    localStorage.setItem(pageKey, JSON.stringify(storedData));
    console.log("🆕 Novo ID criado para esta página:", newId);
  } else {
    console.log("♻️ ID existente para esta página:", storedData[currentUrl].id);
  }
}

// Executa automático ao abrir a página
const cleanText = getOnlyTextFromBody();

// Envia produto
setTimeout(() => {
  sendProductToBackend(cleanText);
}, 1500);

// Busca histórico da conversa
setTimeout(() => {
  getChatHistory();
}, 2000);



function monitorarLinksShopinfo() {
  const container = document.querySelector(".chat-messages-list");
  if (!container) return;

  // Função que transforma links em botões
  function transformarLinksEmBotoes() {
    container.querySelectorAll(".chat-message-from-bot .chat-message-markdown p").forEach((p) => {
      // Ignora se o <p> já foi convertido
      if (p.dataset.botaoCriado === "true") return;

      const match = p.textContent.match(/https:\/\/www\.shopinfo\.com\.br[^\s)]+/g);
      if (match) {
        const url = match[0];

        // Cria botão clicável
        const botao = document.createElement("a");
        botao.href = url;
        botao.target = "_blank";
        botao.textContent = "🛒 VER PRODUTO";
        botao.style.cssText = `
          display:block;
          text-align:center;
          background:linear-gradient(90deg,#00ffa3,#00c0ff);
          color:#000;
          padding:12px 20px;
          border-radius:8px;
          font-weight:700;
          text-decoration:none;
          margin:14px auto 6px;
          width:fit-content;
          font-family:'Roboto',sans-serif;
          box-shadow:0 0 12px rgba(0,255,170,0.4);
          transition:all .3s ease;
        `;
        botao.onmouseenter = () => (botao.style.filter = "brightness(1.2)");
        botao.onmouseleave = () => (botao.style.filter = "brightness(1)");

        // Substitui o conteúdo do <p> pelo botão
        p.replaceWith(botao);
      }

      // Marca para não processar novamente
      p.dataset.botaoCriado = "true";
    });
  }

  // Executa uma vez ao carregar
  transformarLinksEmBotoes();

  // Observa mudanças no chat (novas mensagens)
  const observer = new MutationObserver(() => transformarLinksEmBotoes());
  observer.observe(container, { childList: true, subtree: true });
}

// Executa 2 segundos após iniciar o chat (tempo de render)
setTimeout(monitorarLinksShopinfo, 2000);
