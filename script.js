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

// Vérification du format du numéro de téléphone
function validatePhoneNumber(phoneNumber) {
    let regex = /^\+?[1-9]\d{7,14}$/;
    return regex.test(phoneNumber) ? { valid: true, message: "✅ Format valide" }
                                   : { valid: false, message: "❌ Format invalide. Utilisez + suivi du code pays." };
}

// Vérifier la présence de Telegram avant l'inscription
function checkTelegramInstallation() {
    let confirmTelegram = confirm("⚠ Avez-vous bien installé Telegram ?\nToutes les instructions et validations seront envoyées dessus.");
    return confirmTelegram;
}

// Envoyer un code de validation sur Telegram
async function sendVerificationCode(phoneNumber) {
    let verificationCode = Math.floor(100000 + Math.random() * 900000);
    window.verificationCode = verificationCode;

    let message = `🔑 **Code de validation pour votre inscription :** ${verificationCode}`;
    let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${window.env.VITE_TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        if (data.ok) {
            alert("📩 Un code de validation a été envoyé sur Telegram. Veuillez le saisir ci-dessous.");
            document.getElementById("verification-section").style.display = "block";
            return true;
        } else {
            alert("❌ Erreur : Impossible d'envoyer le code via Telegram.");
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
    let participants = document.getElementById("participants").value;

    if (!teamName || !phoneNumber || !participants) {
        alert("❌ Erreur : Remplissez tous les champs !");
        return;
    }

    let validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
        alert(validation.message);
        return;
    }

    let codeSent = await sendVerificationCode(phoneNumber);
    if (!codeSent) return;

    let checkInterval = setInterval(() => {
        if (window.telegramVerified) {
            clearInterval(checkInterval);

            let message = `📌 **Nouvelle Inscription !**\n👥 **Équipe** : ${teamName}\n📞 **Téléphone** : ${phoneNumber}\n🎟️ **Participants** : ${participants}`;
            let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${window.env.VITE_TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

            fetch(url)
                .then(response => response.json())
                .then(data => alert(data.ok ? "✅ Inscription validée !" : "❌ Erreur Telegram."))
                .catch(error => alert("❌ Erreur réseau :", error));
        }
    }, 1000);
};

console.log("✅ script.js est bien chargé !");