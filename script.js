// ✅ S'assurer que `console` est bien défini (évite les erreurs sur certains navigateurs)
if (typeof console === "undefined") {
    var console = { log: function() {}, error: function() {}, warn: function() {} };
}

// ✅ Initialisation propre pour éviter `undefined`
window.env = {};

// ✅ Charger les variables d’environnement depuis Netlify
async function loadEnvVariables() {
    try {
        let response = await fetch("/.netlify/functions/env");
        let env = await response.json();

        console.log("✅ Variables Netlify récupérées :", env);

        // Vérification et assignation des variables pour éviter `undefined`
        if (env && typeof env === "object") {
            window.env = env;
        } else {
            console.error("❌ Erreur : `env` ne contient pas d'objet valide !");
            window.env = {};
        }

        console.log("🔍 Contenu final de window.env :", window.env);
        return window.env; // ✅ Retourne les variables une fois chargées
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des variables d’environnement :", error);
        window.env = {};
        return window.env;
    }
}

// ✅ Lancer la récupération des variables et attendre la fin du chargement
loadEnvVariables().then(env => {
    console.log("✅ Test Debug : window.env après chargement →", env);

    // Vérifier si les variables sont bien assignées
    if (!env.VITE_TELEGRAM_BOT_TOKEN || !env.VITE_TELEGRAM_CHAT_ID) {
        console.warn("⚠ Attention : une variable Netlify semble manquante !");
    } else {
        console.log("🎉 Les variables sont bien récupérées et prêtes à être utilisées !");
    }
}).catch(error => {
    console.error("❌ Erreur lors de l'exécution de loadEnvVariables() :", error);
});

// ✅ Vérification finale après chargement pour éviter `undefined`
setTimeout(() => {
    console.log("🔍 Vérification après chargement :", window.env);
    if (!window.env.VITE_TELEGRAM_BOT_TOKEN || !window.env.VITE_TELEGRAM_CHAT_ID) {
        console.warn("⚠ Attention : une variable Netlify semble toujours manquante !");
    }
}, 3000);

// ✅ Vérifier que les variables sont bien définies avant utilisation
function checkEnv() {
    if (!window.env || !window.env.VITE_TELEGRAM_BOT_TOKEN || !window.env.VITE_TELEGRAM_CHAT_ID) {
        console.warn("⚠ Les variables Netlify ne sont pas encore chargées !");
        return false;
    }
    return true;
}

// ✅ Récupérer le chat_id d'un joueur au lieu de son pseudo
async function getChatIdFromUsername(username) {
    if (!checkEnv()) return null;

    try {
        let response = await fetch(`https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/getUpdates`);
        let data = await response.json();

        console.log("🔍 Réponse getUpdates :", data);

        if (!data.result || data.result.length === 0) {
            console.warn("⚠ Aucune mise à jour reçue du bot.");
            return null;
        }

        let user = data.result.find(update => update.message && update.message.from.username === username.replace("@", ""));
        return user ? user.message.from.id : null;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération du chat_id :", error);
        return null;
    }
}

// ✅ Envoyer un code de validation via Telegram
async function sendVerificationCodeToPlayer(playerTelegram) {
    if (!checkEnv()) {
        alert("❌ Erreur interne. Réessayez plus tard.");
        return false;
    }

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

        if (data.ok) {
            alert("📩 Un code de validation a été envoyé sur votre Telegram !");
            document.getElementById("verification-section").style.display = "block";
            return true;
        } else {
            console.error("❌ Erreur lors de l'envoi du message :", data);
            alert("❌ Impossible d'envoyer le code via Telegram.");
            return false;
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du code Telegram :", error);
        alert("❌ Erreur réseau. Vérifiez votre connexion.");
        return false;
    }
}

// ✅ Tester si tout fonctionne
console.log("✅ script.js chargé !");