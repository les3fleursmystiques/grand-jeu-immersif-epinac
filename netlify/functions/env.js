// Fonction serverless pour exposer les variables d’environnement sur Netlify
exports.handler = async function () {
    console.log("🔍 Vérification des variables d’environnement Netlify :", {
        VITE_TELEGRAM_BOT_TOKEN: process.env.VITE_TELEGRAM_BOT_TOKEN,
        VITE_TELEGRAM_CHAT_ID: process.env.VITE_TELEGRAM_CHAT_ID,
    });

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" }, // Ajout du header JSON
        body: JSON.stringify({
            VITE_TELEGRAM_BOT_TOKEN: process.env.VITE_TELEGRAM_BOT_TOKEN || "",
            VITE_TELEGRAM_CHAT_ID: process.env.VITE_TELEGRAM_CHAT_ID || "",
        })
    };
};