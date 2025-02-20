// ✅ Charger les variables d’environnement depuis Netlify
async function loadEnvVariables() {
    try {
        let response = await fetch("/.netlify/functions/env");
        let env = await response.json();
        console.log("✅ Variables Netlify récupérées :", env);

        // Vérification et assignation des variables
        if (env.VITE_TELEGRAM_BOT_TOKEN && env.VITE_TELEGRAM_CHAT_ID) {
            window.env = env;
        } else {
            console.error("❌ Certaines variables Netlify sont manquantes !");
            window.env = {};
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des variables d’environnement :", error);
        window.env = {};
    }
}

// Appeler la fonction au chargement du script
loadEnvVariables();

// ✅ Récupérer le chat_id d'un joueur au lieu de son pseudo
async function getChatIdFromUsername(username) {
    if (!window.env || !window.env.VITE_TELEGRAM_BOT_TOKEN) {
        console.error("❌ Les variables d’environnement ne sont pas encore chargées !");
        return null;
    }

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
    if (!window.env || !window.env.VITE_TELEGRAM_BOT_TOKEN) {
        console.error("❌ Les variables d’environnement ne sont pas chargées !");
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