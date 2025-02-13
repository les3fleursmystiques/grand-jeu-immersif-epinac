console.log("✅ script.js est bien chargé !");

window.testTelegram = function() {
    alert("🚀 Le bouton fonctionne !");
    console.log("✅ testTelegram() a été appelée !");
};

window.redirectToPayPal = function(event) {
    event.preventDefault();
    alert("🚀 Redirection vers PayPal !");
    console.log("✅ redirectToPayPal() a été appelée !");
};