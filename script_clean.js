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
