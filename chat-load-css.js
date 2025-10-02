(function loadChatCss() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://shopinfo-oficial.github.io/ChatIA/chatIA.css";
    document.head.appendChild(link);

    console.log("🎨 CSS do chat injetado:", link.href);
})();
