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

// Vérifier le format du numéro
async function validatePhoneNumber(phoneNumber) {
    if (!window.env || !window.env.ABSTRACT_API_KEY) {
        console.error("❌ Clé API AbstractAPI manquante !");
        return { valid: false, message: "❌ Impossible de vérifier le numéro." };
    }

    let url = `https://phonevalidation.abstractapi.com/v1/?api_key=${window.env.ABSTRACT_API_KEY}&phone=${phoneNumber}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        console.log("📞 Résultat API AbstractAPI :", data);
        return data.valid ? { valid: true, message: "✅ Numéro valide et existant." } : { valid: false, message: "❌ Numéro invalide." };
    } catch (error) {
        console.error("❌ Erreur API AbstractAPI :", error);
        return { valid: false, message: "⚠ Erreur de connexion à AbstractAPI." };
    }
}

// Envoyer un code de validation à TON compte Telegram personnel
async function sendVerificationCodeToLaurie(playerTelegram) {
    let verificationCode = Math.floor(100000 + Math.random() * 900000);
    window.verificationCode = verificationCode;

    let message = `🔑 **Code de validation pour l'inscription :** ${verificationCode}\n👤 Joueur : ${playerTelegram}`;
    let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=123456789&text=${encodeURIComponent(message)}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        if (data.ok) {
            alert("📩 Code envoyé à Laurie !");
            return true;
        } else {
            alert("❌ Erreur Telegram.");
            return false;
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du code :", error);
        return false;
    }
}

// Envoyer les questions du jeu au joueur
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

// Vérifier et envoyer les informations
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

    let codeSent = await sendVerificationCodeToLaurie(playerTelegram);
    if (!codeSent) return;

    alert("✅ Inscription réussie !");
    sendGameQuestionsToPlayer(playerTelegram);
};

console.log("✅ script.js chargé !");