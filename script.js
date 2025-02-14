// Récupérer les variables Telegram depuis window.env
const token = window.env ? window.env.VITE_TELEGRAM_BOT_TOKEN : "";
const chatId = window.env ? window.env.VITE_TELEGRAM_CHAT_ID : "";

// Vérifier si les variables sont bien récupérées
console.log("🟢 Token Telegram :", token ? "OK" : "NON DÉFINI");
console.log("🟢 Chat ID Telegram :", chatId ? "OK" : "NON DÉFINI");

// Vérifier que les fonctions sont bien enregistrées
console.log("🔍 typeof testTelegram :", typeof window.testTelegram);
console.log("🔍 typeof redirectToPayPal :", typeof window.redirectToPayPal);

console.log("✅ script.js est bien chargé et exécuté !");

// Fonction testTelegram
window.testTelegram = function() {
    alert("🚀 testTelegram() fonctionne !");
    console.log("✅ testTelegram() a été appelée !");
};

// Fonction redirectToPayPal
window.redirectToPayPal = function(event) {
    event.preventDefault();
    alert("🚀 Redirection vers PayPal !");
    console.log("✅ redirectToPayPal() a été appelée !");
};