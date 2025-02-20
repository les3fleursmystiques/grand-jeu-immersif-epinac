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

// ✅ Récupérer le chat_id d'un joueur au lieu de son pseudo
async function getChatIdFromUsername(username) {
    try {
        let response = await fetch(`https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/getUpdates`);
        let data = await response.json();
        console.log("🔍 Réponse getUpdates :", data);

        let user = data.result.find(update => update.message && update.message.from.username === username.replace("@", ""));
        return user ? user.message.from.id : null;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du chat_id :", error);
        return null;
    }
}

// ✅ Envoyer un code de validation via Telegram
async function sendVerificationCodeToPlayer(playerTelegram) {
    let chatId = await getChatIdFromUsername(playerTelegram);
    if (!chatId) {
        alert("❌ Le bot ne connaît pas cet utilisateur. Il doit d'abord lui envoyer un message.");
        return false;
    }

    let verificationCode = Math.floor(100000 + Math.random() * 900000);
    window.verificationCode = verificationCode;

    let message = `🔑 Code de validation : ${verificationCode}`;
    let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        return data.ok ? alert("📩 Code envoyé sur Telegram !") : alert("❌ Erreur Telegram.");
    } catch (error) {
        console.error("❌ Erreur Telegram :", error);
        return false;
    }
}

// ✅ Vérifier et envoyer les informations
window.testTelegram = async function () {
    let teamName = document.getElementById("team-name").value;
    let playerTelegram = document.getElementById("telegram-username").value;
    let participants = document.getElementById("participants").value;

    if (!teamName || !playerTelegram || !participants) {
        alert("❌ Remplissez tous les champs !");
        return;
    }

    let codeSent = await sendVerificationCodeToPlayer(playerTelegram);
    if (!codeSent) return;

    alert("✅ Inscription envoyée !");
};

console.log("✅ script.js chargé !");