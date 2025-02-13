console.log("🚀 Chargement du script...");

// Récupérer les variables d'environnement en les injectant dynamiquement
fetch("/.env")
  .then(response => response.text())
  .then(text => {
      let env = text.split("\n");
      let envVars = {};
      env.forEach(line => {
          let [key, value] = line.split("=");
          if (key && value) envVars[key.trim()] = value.trim();
      });

      console.log("🚀 Variables chargées :", envVars);
      window.TELEGRAM_BOT_TOKEN = envVars["VITE_TELEGRAM_BOT_TOKEN"];
      window.TELEGRAM_CHAT_ID = envVars["VITE_TELEGRAM_CHAT_ID"];

      console.log("🔍 TELEGRAM_BOT_TOKEN :", window.TELEGRAM_BOT_TOKEN || "Non défini");
      console.log("🔍 TELEGRAM_CHAT_ID :", window.TELEGRAM_CHAT_ID || "Non défini");
  })
  .catch(error => console.error("❌ Erreur lors du chargement des variables :", error));

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
