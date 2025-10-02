  document.addEventListener('DOMContentLoaded', (event) => {
            const chatWrapper = document.querySelector('.chat-window-wrapper');
            const chatToggle = document.querySelector('.chat-window-toggle');

            if (!chatWrapper || !chatToggle) return;

            // Backdrop invisível (clicar fecha o chat)
            const backdrop = document.createElement('div');
            backdrop.classList.add('chat-backdrop-invisible');
            document.body.appendChild(backdrop);

            // Âncora para restaurar o toggle ao lugar original
            const toggleAnchor = document.createComment('toggle-anchor');
            if (chatToggle.parentElement) {
                chatToggle.parentElement.insertBefore(toggleAnchor, chatToggle.nextSibling);
            }

            // Move o toggle para logo abaixo de .chat-info dentro do header
            function moveToggleIntoHeader() {
                const header = document.querySelector('.chat-header');
                const chatInfo = header?.querySelector('.chat-info');
                if (!header || !chatInfo || !chatToggle) return;
                chatInfo.insertAdjacentElement('afterend', chatToggle);
                chatToggle.classList.add('toggle-inside');
                chatToggle.setAttribute('aria-label', 'Fechar chat');
            }

            // Restaura o toggle exatamente ao lugar original
            function restoreToggleToOriginalPlace() {
                if (toggleAnchor?.parentNode && chatToggle) {
                    toggleAnchor.parentNode.insertBefore(chatToggle, toggleAnchor.nextSibling);
                    chatToggle.classList.remove('toggle-inside');
                    chatToggle.setAttribute('aria-label', 'Abrir chat');

                    // 🔹 restaura o SVG padrão
                    chatToggle.innerHTML = `
                            <svg viewBox="0 0 24 24" width="32" height="32">
                                <path fill="currentColor" d="M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.24 0-2.43-.18-3.53-.5C5.55 21 2 21 2 21c2.33-2.33 2.7-3.9 2.75-4.5C3.05 15.07 2 13.13 2 11c0-4.42 4.5-8 10-8"></path>
                            </svg>
                            `;
                }
            }


            function openChat() {
                chatWrapper.classList.add('is-open');
                moveToggleIntoHeader();
            }

            function closeChat() {
                chatWrapper.classList.remove('is-open');
                restoreToggleToOriginalPlace();
            }

            // Clique no próprio toggle: abre se fechado, fecha (e restaura) se aberto
            chatToggle.addEventListener('click', function () {
                if (chatWrapper.classList.contains('is-open')) {
                    closeChat();
                } else {
                    openChat();
                }
            });

            // Clique no backdrop fecha e restaura
            backdrop.addEventListener('click', closeChat);

            // Se seu tema tiver algum botão .close-button, mantemos consistente
            const closeButton = document.querySelector('.close-button');
            if (closeButton) {
                closeButton.addEventListener('click', closeChat);
            }

            function moveToggleIntoHeader() {
                const header = document.querySelector('.chat-header');
                const chatInfo = header?.querySelector('.chat-info');
                if (!header || !chatInfo || !chatToggle) return;

                chatInfo.insertAdjacentElement('afterend', chatToggle);
                chatToggle.classList.add('toggle-inside');
                chatToggle.setAttribute('aria-label', 'Fechar chat');

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
                const chatHeader = document.querySelector('.chat-header');
                if (!chatHeader) return;

                // Seletores genéricos para imagem e nome do produto
                const productImgElement = document.querySelector(
                    '#image-main, .product-main-image, .product-image img, .image-gallery-container img'
                );

                const productNameElement = document.querySelector(
                    '.productName, .product-title, h1.product-name, .product__info--name h1, .product-details__title'
                );

                if (productImgElement && productNameElement) {
                    const productImgSrc = productImgElement.src;
                    const productName = productNameElement.textContent.trim();
                    const limitedProductName =
                        productName.length > 60 ? productName.substring(0, 60) + '...' : productName;

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
                    if (chatWrapper.classList.contains('is-open')) {
                        moveToggleIntoHeader();
                    }
                } else {
                    console.error('Erro: Não foi possível encontrar a imagem ou o nome do produto na DOM.');
                }
            }

            // Função para adicionar uma mensagem de boas-vindas ao corpo do chat
            function showWelcomeMessage(limitedProductName) {
                const chatBody = document.querySelector('.chat-body');

                if (chatBody) {
                    const welcomeContainer = document.createElement('div');
                    welcomeContainer.classList.add('chat-welcome-message');

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
                            <h2 class="welcome-title">Bem-vindo ao ClarityAssist</h2>
                            <p class="welcome-text">Pergunte-me qualquer coisa sobre o ${limitedProductName}!</p>
                        </div>
                    `;
                    welcomeContainer.innerHTML = welcomeContent;

                    const chatMessagesList = chatBody.querySelector('.chat-messages-list');
                    if (chatMessagesList) {
                        chatBody.insertBefore(welcomeContainer, chatMessagesList);
                    } else {
                        chatBody.appendChild(welcomeContainer);
                    }
                }
            }


            if (chatWrapper.classList.contains('is-open')) {
                moveToggleIntoHeader();
            } else {
                restoreToggleToOriginalPlace();
            }

            updateChatHeader()
        });