     function loadChatCss() {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "https://shopinfo-oficial.github.io/ChatIA/chatIA.css";
            document.head.appendChild(link);
        }


        // chama quando a página carregar
        document.addEventListener("DOMContentLoaded", loadChatCss);
