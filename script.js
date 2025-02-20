// ✅ Charger les variables d’environnement depuis Netlify
fetch("/.netlify/functions/env")
    .then(response => response.json())
    .then(env => {
        console.log("✅ Variables Netlify récupérées :", env);
        window.env = env;
    })
    .catch(error => {
        console.error("❌ Erreur lors de la récupération des variables d’environnement :", error);
    });

// ✅ Remettre le pré-remplissage automatique du champ téléphone
document.addEventListener("DOMContentLoaded", function() {
    let phoneInput = document.getElementById("phone-number");

    if (phoneInput) {
        phoneInput.addEventListener("focus", function() {
            if (!phoneInput.value.startsWith("+")) {
                phoneInput.value = "+33" + phoneInput.value.replace(/^0/, "");
            }
        });

        phoneInput.addEventListener("input", function() {
            if (phoneInput.value === "+") {
                phoneInput.value = "+33";
            }
        });
    }
});

// ✅ Vérifier et valider un numéro existant avec AbstractAPI
async function validatePhoneNumber(phoneNumber) {
    if (!window.env || !window.env.ABSTRACT_API_KEY) {
        console.error("❌ Clé API AbstractAPI manquante !");
        return { valid: false, message: "❌ Impossible de vérifier le numéro." };
    }

    // Ajouter +33 si le numéro commence par 0 et n'a pas de préfixe
    if (phoneNumber.startsWith("0") && !phoneNumber.startsWith("+")) {
        phoneNumber = "+33" + phoneNumber.substring(1);
    }

    let url = `https://phonevalidation.abstractapi.com/v1/?api_key=${window.env.ABSTRACT_API_KEY}&phone=${phoneNumber}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        console.log("📞 Résultat API AbstractAPI :", data);

        // Vérifications pour bloquer les numéros fictifs
        if (
            data.valid &&
            data.format &&
            data.format.international &&
            data.country &&
            data.country.code &&
            data.carrier &&
            data.carrier !== "" &&
            (data.type === "mobile" || data.type === "fixed_line")
        ) {
            return { valid: true, message: "✅ Numéro valide et existant." };
        } else {
            return { valid: false, message: "❌ Numéro invalide ou inexistant." };
        }
    } catch (error) {
        console.error("❌ Erreur API AbstractAPI :", error);
        return { valid: false, message: "⚠ Erreur de connexion à AbstractAPI." };
    }
}

// ✅ Envoyer un code de validation au JOUEUR via Telegram
async function sendVerificationCodeToPlayer(playerTelegram) {
    if (!playerTelegram.startsWith("@")) {
        alert("❌ Erreur : L'identifiant Telegram doit commencer par '@'. Exemple : @monpseudo");
        return false;
    }

    let verificationCode = Math.floor(100000 + Math.random() * 900000);
    window.verificationCode = verificationCode;

    let message = `🔑 **Code de validation pour votre inscription :** ${verificationCode}\n\n📩 Répondez avec ce code sur le site pour finaliser votre inscription.`;
    let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${playerTelegram}&text=${encodeURIComponent(message)}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.ok) {
            alert("📩 Un code de validation a été envoyé sur votre Telegram !");
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

// ✅ Vérifier le code de validation saisi par le joueur
function validateTelegramCode() {
    let userCode = document.getElementById("verification-code").value;
    if (parseInt(userCode) === window.verificationCode) {
        alert("✅ Code validé !");
        window.telegramVerified = true;
    } else {
        alert("❌ Code incorrect. Veuillez réessayer.");
    }
}

// ✅ Envoyer les questions du jeu au JOUEUR après validation
async function sendGameQuestionsToPlayer(playerTelegram) {
    let message = `🎮 **Bienvenue dans le Grand Jeu Immersif !**\n\n💬 Voici ta première énigme :\n\n"Quelle est la couleur du cheval blanc d'Henri IV ?" 🏇\n\nRéponds directement ici pour continuer l’aventure !`;

    let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${playerTelegram}&text=${encodeURIComponent(message)}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        return data.ok ? alert("📩 Questions envoyées au joueur !") : alert("❌ Erreur Telegram.");
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi des questions :", error);
    }
}

// ✅ Vérifier et envoyer les informations
window.testTelegram = async function () {
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

    let codeSent = await sendVerificationCodeToPlayer(playerTelegram);
    if (!codeSent) return;

    // Attendre la validation du joueur
    let checkInterval = setInterval(() => {
        if (window.telegramVerified) {
            clearInterval(checkInterval);

            let message = `📌 **Nouvelle Inscription !**\n👥 **Équipe** : ${teamName}\n📞 **Téléphone** : ${phoneNumber}\n🎟️ **Participants** : ${participants}\n💬 **Telegram Joueur** : ${playerTelegram}`;
            let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${window.env.VITE_TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

            fetch(url)
                .then(response => response.json())
                .then(data => alert(data.ok ? "✅ Inscription validée !" : "❌ Erreur Telegram."))
                .catch(error => alert("❌ Erreur réseau :", error));

            // Envoyer les questions après validation
            sendGameQuestionsToPlayer(playerTelegram);
        }
    }, 1000);
};

console.log("✅ script.js chargé !");