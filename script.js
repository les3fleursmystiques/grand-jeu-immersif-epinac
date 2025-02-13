console.log("🚀 Chargement du script...");

// Récupération des variables d'environnement de Netlify
window.TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || "Non défini";
window.TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || "Non défini";

console.log("🔍 TELEGRAM_BOT_TOKEN :", window.TELEGRAM_BOT_TOKEN);
console.log("🔍 TELEGRAM_CHAT_ID :", window.TELEGRAM_CHAT_ID);

console.log("✅ script.js est bien chargé et exécuté !");

window.testTelegram = function() {
    alert("🚀 testTelegram() fonctionne !");
    console.log("✅ testTelegram() a été appelée !");
};

window.redirectToPayPal = function(event) {
    event.preventDefault();
    alert("🚀 Redirection vers PayPal !");
    console.log("✅ redirectToPayPal() a été appelée !");
};

// Vérifier que les fonctions sont bien enregistrées
console.log("🔍 typeof testTelegram :", typeof window.testTelegram);
console.log("🔍 typeof redirectToPayPal :", typeof window.redirectToPayPal);

console.log("✅ script_clean.js est bien chargé et exécuté !");

window.testTelegram = function() {
    alert("🚀 testTelegram() fonctionne !");
    console.log("✅ testTelegram() a été appelée !");
};

window.redirectToPayPal = function(event) {
    event.preventDefault();
    alert("🚀 Redirection vers PayPal !");
    console.log("✅ redirectToPayPal() a été appelée !");
};

// Vérifier que les fonctions sont bien enregistrées
console.log("🔍 typeof testTelegram :", typeof window.testTelegram);
console.log("🔍 typeof redirectToPayPal :", typeof window.redirectToPayPal);
