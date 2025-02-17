// Déclaration des variables en haut pour qu'elles soient accessibles globalement
let token = "NON DÉFINI";
let chatId = "NON DÉFINI";

// Attendre que le DOM soit chargé avant de récupérer les variables
document.addEventListener("DOMContentLoaded", function () {
    token = window.env ? window.env.VITE_TELEGRAM_BOT_TOKEN : "NON DÉFINI";
    chatId = window.env ? window.env.VITE_TELEGRAM_CHAT_ID : "NON DÉFINI";

    console.log("🟢 Token Telegram :", token);
    console.log("🟢 Chat ID Telegram :", chatId);
});

// Vérifier si les variables sont bien récupérées
console.log("🟢 Token Telegram :", token ? "OK" : "NON DÉFINI");
console.log("🟢 Chat ID Telegram :", chatId ? "OK" : "NON DÉFINI");

// Vérifier que les fonctions sont bien enregistrées
console.log("🔍 typeof testTelegram :", typeof window.testTelegram);
console.log("🔍 typeof redirectToPayPal :", typeof window.redirectToPayPal);

console.log("✅ script.js est bien chargé et exécuté !");

// Fonction testTelegram (envoi Telegram)
window.testTelegram = function() {
    let teamName = document.getElementById("team-name").value;
    let phoneNumber = document.getElementById("phone-number").value;
    let participants = document.getElementById("participants").value;

    if (!teamName || !phoneNumber || !participants) {
        alert("❌ Erreur : Remplissez tous les champs avant d'envoyer !");
        return;
    }

    let message = `📌 **Nouvelle Inscription !**\n\n👥 **Équipe** : ${teamName}\n📞 **Téléphone** : ${phoneNumber}\n🎟️ **Participants** : ${participants}`;

    let url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

    console.log("🚀 Tentative d'envoi Telegram :", url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alert("✅ Inscription validée et envoyée sur Telegram !");
            } else {
                console.error("❌ Erreur Telegram :", data);
                alert("❌ Erreur : Impossible d'envoyer l'inscription sur Telegram.");
            }
        })
        .catch(error => {
            console.error("❌ Erreur réseau :", error);
            alert("❌ Erreur : Problème avec la connexion à Telegram.");
        });
};

// Fonction redirectToPayPal (paiement)
window.redirectToPayPal = function(event) {
    event.preventDefault();

    let participants = document.getElementById("participants").value;
    if (!participants || participants <= 0) {
        alert("❌ Erreur : Veuillez entrer un nombre de participants valide !");
        return;
    }

    let totalPrice = 5 * participants;
    let paypalLink = `https://www.paypal.me/LaurieBlanot?country.x=FR&locale.x=fr_FR&amount=${totalPrice}EUR`;

    console.log("🚀 Redirection vers PayPal :", paypalLink);
    alert(`✅ Inscription validée ! Montant à payer : ${totalPrice} €`);

    window.open(paypalLink, "_blank"); // Ouvre PayPal dans un nouvel onglet
};

// Vérifier après l'enregistrement des fonctions
console.log("🔄 Vérification après enregistrement...");
console.log("🔍 typeof testTelegram :", typeof window.testTelegram);
console.log("🔍 typeof redirectToPayPal :", typeof window.redirectToPayPal);
console.log("✅ Fonctions enregistrées !");