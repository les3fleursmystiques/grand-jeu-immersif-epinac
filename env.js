// Mise à jour forcée pour Netlify - Vérification de la fonction serverless
exports.handler = async function () {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" }, // Ajout du header JSON
        body: JSON.stringify({
            VITE_TELEGRAM_BOT_TOKEN: process.env.VITE_TELEGRAM_BOT_TOKEN || "",
            VITE_TELEGRAM_CHAT_ID: process.env.VITE_TELEGRAM_CHAT_ID || ""
        })
    };
};