// Récupérer les variables d’environnement depuis Netlify
fetch("/.netlify/functions/env")
    .then(response => response.json())
    .then(env => {
        console.log("✅ Variables Netlify récupérées :", env);
        window.env = env;
    })
    .catch(error => {
        console.error("❌ Erreur lors de la récupération des variables d’environnement :", error);
    });

// Ajouter automatiquement +33 si l'utilisateur oublie le préfixe
document.getElementById("phone-number").addEventListener("input", function () {
    let phoneField = this;
    if (phoneField.value.length > 0 && !phoneField.value.startsWith("+")) {
        phoneField.value = "+33" + phoneField.value;
    }
});

// Vérification stricte du format et de l'existence du numéro
async function validatePhoneNumber(phoneNumber) {
    if (!window.env || !window.env.ABSTRACT_API_KEY) {
        console.error("❌ Clé API AbstractAPI manquante !");
        return { valid: false, message: "❌ Impossible de vérifier le numéro. Problème de configuration." };
    }

    let url = `https://phonevalidation.abstractapi.com/v1/?api_key=${window.env.ABSTRACT_API_KEY}&phone=${phoneNumber}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        console.log("📞 Résultat API AbstractAPI :", data);

        if (data.valid && data.number && data.number.length >= 10) {
            return { valid: true, message: "✅ Numéro valide et existant." };
        } else {
            return { valid: false, message: "❌ Numéro invalide ou inexistant." };
        }
    } catch (error) {
        console.error("❌ Erreur API AbstractAPI :", error);
        return { valid: false, message: "⚠ Erreur de connexion à AbstractAPI." };
    }
}

// Vérifier la présence de Telegram avant l'inscription
function checkTelegramInstallation() {
    let confirmTelegram = confirm("⚠ Avez-vous bien installé Telegram et activé votre identifiant public ?");
    return confirmTelegram;
}

// Envoyer un code de validation au joueur via Telegram
async function sendVerificationCode(playerTelegram) {
    if (!playerTelegram.startsWith("@")) {
        alert("❌ Erreur : L'identifiant Telegram doit commencer par '@'. Exemple : @monpseudo");
        return false;
    }

    let verificationCode = Math.floor(100000 + Math.random() * 900000);
    window.verificationCode = verificationCode;

    let message = `🔑 **Code de validation pour votre inscription :** ${verificationCode}`;
    let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${playerTelegram}&text=${encodeURIComponent(message)}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.ok) {
            alert("📩 Un code de validation a été envoyé sur votre Telegram.");
            document.getElementById("verification-section").style.display = "block";
            return true;
        } else {
            alert("❌ Erreur : Impossible d'envoyer le code via Telegram. Vérifiez votre identifiant.");
            return false;
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du code Telegram :", error);
        return false;
    }
}

// Vérifier le code de validation saisi
function validateTelegramCode() {
    let userCode = document.getElementById("verification-code").value;
    if (parseInt(userCode) === window.verificationCode) {
        alert("✅ Code validé !");
        window.telegramVerified = true;
    } else {
        alert("❌ Code incorrect. Veuillez réessayer.");
    }
}

// Envoyer l'inscription après validation
window.testTelegram = async function () {
    if (!checkTelegramInstallation()) {
        alert("❌ Veuillez installer Telegram avant de vous inscrire !");
        return;
    }

    let teamName = document.getElementById("team-name").value;
    let phoneNumber = document.getElementById("phone-number").value;
    let playerTelegram = document.getElementById("telegram-username").value;
    let participants = document.getElementById("participants").value;

    if (!teamName || !phoneNumber || !playerTelegram || !participants) {
        alert("❌ Erreur : Remplissez tous les champs !");
        return;
    }

    let validation = await validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
        alert(validation.message);
        return;
    }

    let codeSent = await sendVerificationCode(playerTelegram);
    if (!codeSent) return;

    let checkInterval = setInterval(() => {
        if (window.telegramVerified) {
            clearInterval(checkInterval);

            let message = `📌 **Nouvelle Inscription !**\n👥 **Équipe** : ${teamName}\n📞 **Téléphone** : ${phoneNumber}\n🎟️ **Participants** : ${participants}\n💬 **Telegram Joueur** : ${playerTelegram}`;
            let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${window.env.VITE_TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

            fetch(url)
                .then(response => response.json())
                .then(data => alert(data.ok ? "✅ Inscription validée !" : "❌ Erreur Telegram."))
                .catch(error => alert("❌ Erreur réseau :", error));
        }
    }, 1000);
};

console.log("✅ script.js est bien chargé !");