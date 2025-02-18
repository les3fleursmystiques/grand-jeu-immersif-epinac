// Récupérer les variables d’environnement depuis Netlify
fetch("/.netlify/functions/env")
    .then(response => response.text()) // Récupérer la réponse en texte brut
    .then(data => {
        console.log("🔎 Réponse brute de Netlify :", data);

        try {
            let env = JSON.parse(data); // Convertir en JSON
            console.log("✅ JSON parsé avec succès :", env);

            // Vérifier si les variables sont bien récupérées
            if (!env || Object.keys(env).length === 0) {
                console.error("❌ Erreur : Les variables d'environnement sont vides !");
                return;
            }

            window.env = env; // Stocker les variables

            console.log("🟢 Token Telegram :", env.VITE_TELEGRAM_BOT_TOKEN);
            console.log("🟢 Chat ID Telegram :", env.VITE_TELEGRAM_CHAT_ID);
            console.log("🟢 Clé API AbstractAPI :", env.ABSTRACT_API_KEY);
            console.log("🟢 Clé API SMS :", env.SMS_API_KEY);
        } catch (error) {
            console.error("❌ Erreur lors du parsing JSON :", error);
        }
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

// Fonction de validation du format du numéro de téléphone
function validatePhoneNumber(phoneNumber) {
    let regex = /^\+?[1-9]\d{7,14}$/;
    return regex.test(phoneNumber) ? { valid: true, message: "✅ Format valide" }
                                   : { valid: false, message: "❌ Format invalide. Utilisez + suivi du code pays." };
}

// Vérification du numéro via AbstractAPI
async function checkPhoneNumberExists(phoneNumber) {
    let url = `https://phonevalidation.abstractapi.com/v1/?api_key=${window.env.ABSTRACT_API_KEY}&phone=${phoneNumber}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        console.log("📞 Résultat API AbstractAPI :", data);

        return data.valid ? { valid: true, message: "✅ Numéro valide et existant." }
                          : { valid: false, message: "❌ Numéro invalide ou inexistant." };
    } catch (error) {
        console.error("❌ Erreur API AbstractAPI :", error);
        return { valid: false, message: "⚠ Erreur de connexion à AbstractAPI." };
    }
}

// Envoi d'un SMS avec un code de validation
async function sendVerificationSMS(phoneNumber) {
    let verificationCode = Math.floor(100000 + Math.random() * 900000); // Générer un code à 6 chiffres
    window.verificationCode = verificationCode; // Stocker le code pour vérification

    let url = `https://api.smsprovider.com/send?api_key=${window.env.SMS_API_KEY}&to=${phoneNumber}&message=Votre code de validation: ${verificationCode}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        console.log("📩 SMS envoyé :", data);

        return data.success ? (alert("📩 Un code a été envoyé !"), true)
                            : (alert("❌ Erreur : Impossible d'envoyer le SMS."), false);
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du SMS :", error);
        return false;
    }
}

// Vérifier le code de validation entré par l'utilisateur
function validateSMSCode() {
    let userCode = document.getElementById("sms-code").value;
    if (parseInt(userCode) === window.verificationCode) {
        alert("✅ Code validé !");
        window.smsVerified = true;
    } else {
        alert("❌ Code incorrect.");
    }
}

// Fonction testTelegram (envoi Telegram après double validation)
window.testTelegram = async function () {
    let teamName = document.getElementById("team-name").value;
    let phoneNumber = document.getElementById("phone-number").value;
    let participants = document.getElementById("participants").value;

    if (!teamName || !phoneNumber || !participants) {
        alert("❌ Erreur : Remplissez tous les champs !");
        return;
    }

    // Vérifier format
    let validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
        alert(validation.message);
        return;
    }

    // Vérifier existence
    let check = await checkPhoneNumberExists(phoneNumber);
    if (!check.valid) {
        alert(check.message);
        return;
    }

    // Envoyer le SMS de validation
    let smsSent = await sendVerificationSMS(phoneNumber);
    if (!smsSent) return;

    // Attendre la validation du code
    let checkInterval = setInterval(() => {
        if (window.smsVerified) {
            clearInterval(checkInterval);

            let message = `📌 **Nouvelle Inscription !**\n\n👥 **Équipe** : ${teamName}\n📞 **Téléphone** : ${phoneNumber}\n🎟️ **Participants** : ${participants}`;
            let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${window.env.VITE_TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

            console.log("🚀 Envoi Telegram :", url);

            fetch(url)
                .then(response => response.json())
                .then(data => alert(data.ok ? "✅ Inscription validée !" : "❌ Erreur Telegram."))
                .catch(error => alert("❌ Erreur réseau :", error));
        }
    }, 1000);
};

console.log("✅ script.js est bien chargé !");
