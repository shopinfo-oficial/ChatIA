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



document.head.insertAdjacentHTML(
  "beforeend",
  '<link rel="stylesheet" href="https://shopinfo-oficial.github.io/ChatIA/chatIA.css">'
);


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
  chatToggle.addEventListener("click", function () {
    if (chatWrapper.classList.contains("is-open")) {
      closeChat();
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

    // Seletores genéricos para imagem e nome do produto
    const productImgElement = document.querySelector(
      "#image-main, .product-main-image, .product-image img, .image-gallery-container img"
    );

    const productNameElement = document.querySelector(
      ".productName, .product-title, h1.product-name, .product__info--name h1, .product-details__title"
    );

    if (productImgElement && productNameElement) {
      const productImgSrc = productImgElement.src;
      const productName = productNameElement.textContent.trim();
      const limitedProductName =
        productName.length > 60
          ? productName.substring(0, 60) + "..."
          : productName;

      // Monta o header SEM o botão X (vamos usar o toggle dentro do header)
      chatHeader.innerHTML = `
                        <div class="chat-info">
                        <img src="${productImgSrc}" alt="${productName}" />
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
    } else {
      console.error(
        "Erro: Não foi possível encontrar a imagem ou o nome do produto na DOM."
      );
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


initializeChatUI()




function getProductInfo() {
  const product = {
    name: "",
    image: "",
    price: "",
    currency: "BRL",
    availability: "",
    url: window.location.href,
    rating: "",
    reviewCount: "",
  };

  const scripts = [
    ...document.querySelectorAll('script[type="application/ld+json"]'),
  ];
  for (let s of scripts) {
    try {
      const parsed = JSON.parse(s.innerText);

      if (parsed["@type"] === "Product") {
        product.name = parsed.name || product.name;
        product.image = parsed.image || product.image; // <--- Extrai a imagem do JSON-LD
        product.price = parsed.offers?.price || product.price;
        product.currency = parsed.offers?.priceCurrency || product.currency;
        product.availability =
          parsed.offers?.availability || product.availability;
        product.rating = parsed.aggregateRating?.ratingValue || product.rating;
        product.reviewCount =
          parsed.aggregateRating?.reviewCount || product.reviewCount;
      }

      if (parsed["@graph"]) {
        parsed["@graph"].forEach((p) => {
          if (p["@type"] === "Product") {
            product.name = p.name || product.name;
            product.image = p.image || product.image; // <--- Extrai a imagem do JSON-LD
            product.price = p.offers?.price || product.price;
            product.currency = p.offers?.priceCurrency || product.currency;
            product.availability =
              p.offers?.availability || product.availability;
            product.rating = p.aggregateRating?.ratingValue || product.rating;
            product.reviewCount =
              p.aggregateRating?.reviewCount || product.reviewCount;
          }
        });
      }
    } catch {}
  }
  // ---

  // === 2. Meta tags ===
  const metaSelectors = [
    'meta[property="og:title"]',
    'meta[name="title"]',
    'meta[name="product:title"]',
    'meta[property="product:title"]',
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="product:price:amount"]',
    'meta[property="product:price:amount"]',
    'meta[name="price"]',
    'meta[itemprop="price"]',
    'meta[itemprop="name"]',
    'meta[property="og:price:amount"]',
  ];
  metaSelectors.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      if (!product.name && /title|description|name/i.test(sel)) {
        product.name = el.content.trim();
      }
      if (!product.price && /price/i.test(sel)) {
        product.price = el.content.trim();
      }
    }
  });

  // --- Adicionando a extração de imagem via Meta Tags ---
  const imageMetaSelectors = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'meta[itemprop="image"]',
  ];
  imageMetaSelectors.forEach((sel) => {
    if (!product.image) {
      const el = document.querySelector(sel);
      if (el && el.content) {
        product.image = el.content.trim();
      }
    }
  });
  // ---

  // === 3. Nome via DOM ===
  if (!product.name) {
    const nameEl = document.querySelector(
      "h1, h2.product-title, .productName, .product_title, .product-title, " +
        ".pdp-title, .product-heading, .product__name, .product-detail-name, " +
        "[class*='product__info--name'], .descricao, .descricao-curta, .description, .titulo"
    );
    if (nameEl) product.name = nameEl.innerText.trim();
  }

  // --- Adicionando a extração de imagem via DOM ---
  if (!product.image) {
    const imageSelectors = [
      ".product-image img",
      ".pdp-image-main img",
      ".product__image img",
      "#product-image",
      "[data-testid='main-product-image'] img",
    ];
    for (const selector of imageSelectors) {
      const imgEl = document.querySelector(selector);
      if (imgEl && imgEl.src) {
        product.image = imgEl.src.trim();
        break;
      }
    }
  }
  // ---

  // Restante do código (preço, disponibilidade, etc.)
  if (!product.price) {
    const priceEl = [
      ...document.querySelectorAll(
        ".price, .product-price, .product__price, .pdp-price, .sale-price, " +
          ".regular-price, .final-price, [itemprop='price'], " +
          "span, strong, div, p"
      ),
    ].find((el) => /(\$|R\$)\s?\d+([.,]\d{2})/.test(el.textContent));
    if (priceEl) product.price = priceEl.textContent.trim();
  }
  if (!product.availability) {
    const buyBtn = [...document.querySelectorAll("button, a")].find((el) =>
      /compr(ar|e)|add to cart|buy now/i.test(el.textContent)
    );
    const soldOut = [
      ...document.querySelectorAll("button, a, p, div, span"),
    ].find((el) =>
      /esgotado|indispon[ií]vel|out of stock|sold out/i.test(el.textContent)
    );
    if (buyBtn) product.availability = "InStock";
    if (soldOut) product.availability = "OutOfStock";
  }
  if (!product.rating) {
    const ratingEl = document.querySelector(
      "[itemprop='ratingValue'], .rating, .star-rating"
    );
    if (ratingEl) product.rating = ratingEl.textContent.trim();
  }
  if (!product.reviewCount) {
    const reviewEl = document.querySelector(
      "[itemprop='reviewCount'], .review-count, .reviews"
    );
    if (reviewEl) product.reviewCount = reviewEl.textContent.trim();
  }
  console.log("📦 Produto detectado:", product);
  return product;
}

// O resto do seu código pode ser mantido como está.

async function sendProductToBackend(product) {
  const sessionId = localStorage.getItem("customSessionId");
  const payload = {
    sessionId: sessionId || null,
    product,
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
  } catch (e) {}
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

  function buildHistoryFragment(list) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < list.length; i++) {
      var pair = list[i] || {};
      var q = pair.Q != null ? String(pair.Q) : "";
      var a = pair.A != null ? String(pair.A) : "";
      if (q) frag.appendChild(createMessageEl("user", q));
      if (a) frag.appendChild(createMessageEl("bot", a));
    }
    return frag;
  }

  function addSectionTitleIfNeeded(container) {
    if (!ADD_SECTION_TITLE) return null;
    if (container.querySelector('[data-history-title="1"]')) return null;

    var t = el("div", "chat-message chat-message-from-bot");
    t.setAttribute("data-history-title", "1");
    var md = el("div", "chat-message-markdown");
    var p = el("p", "");
    p.textContent = "— Histórico —";
    md.appendChild(p);
    t.appendChild(md);
    return t;
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
    var list = RENDER_OLDEST_FIRST
      ? history.slice()
      : history.slice().reverse();

    // ====== RENDER (PREPEND) ======
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
      if (q && !alreadyRendered(container, "user", q)) {
        anyNew = true;
        break;
      }
      if (a && !alreadyRendered(container, "bot", a)) {
        anyNew = true;
        break;
      }
    }
    if (!anyNew) return list; // nada novo

    // Monta fragmento com o histórico (já deduplicado ao inserir)
    var frag = document.createDocumentFragment();
    var titleEl = addSectionTitleIfNeeded(container);
    if (titleEl) frag.appendChild(titleEl);

    // Recria os elementos garantindo dedupe
    for (var j = 0; j < list.length; j++) {
      var pair2 = list[j] || {};
      var q2 = pair2.Q != null ? String(pair2.Q) : "";
      var a2 = pair2.A != null ? String(pair2.A) : "";
      if (q2 && !alreadyRendered(container, "user", q2))
        frag.appendChild(createMessageEl("user", q2));
      if (a2 && !alreadyRendered(container, "bot", a2))
        frag.appendChild(createMessageEl("bot", a2));
    }

    // âncora: antes do bloco de "digitando" OU, se não existir, antes do primeiro .chat-message;
    // se não houver nada, vira append (fim).
    var typingEl = container.querySelector(
      '.chat-message-typing, [data-test-id="chat-message-typing"]'
    );
    var firstMsg = container.querySelector(":scope > .chat-message");
    var anchor = typingEl || firstMsg || null;

    if (typingEl) {
      container.insertBefore(frag, typingEl);
    } else {
      // senão, apenas adiciona no final
      container.appendChild(frag);
    }

    // mantém scroll no final para que novas mensagens apareçam abaixo do histórico
    container.scrollTop = container.scrollHeight;

    return list;
  } catch (e) {
    console.error("❌ Erro ao buscar histórico:", e);
    return [];
  }
}

// Executa automático ao abrir a página
const product = getProductInfo();

// Envia produto
setTimeout(() => {
  sendProductToBackend(product);
}, 1500);

// Busca histórico da conversa
setTimeout(() => {
  getChatHistory();
}, 2000);
