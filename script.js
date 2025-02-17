// Clé API pour vérifier l'existence du numéro (Inscription gratuite sur numverify.com)
const NUMVERIFY_API_KEY = "VOTRE_CLÉ_API_ICI";

// Récupérer les variables d’environnement depuis Netlify
fetch("/.netlify/functions/env")
    .then(response => response.json())
    .then(env => {
        window.env = env;

        let token = env.VITE_TELEGRAM_BOT_TOKEN || "NON DÉFINI";
        let chatId = env.VITE_TELEGRAM_CHAT_ID || "NON DÉFINI";

        console.log("🟢 Token Telegram :", token);
        console.log("🟢 Chat ID Telegram :", chatId);

        // Ajouter automatiquement +33 si l'utilisateur oublie le préfixe
        document.getElementById("phone-number").addEventListener("input", function () {
            let phoneField = this;
            if (phoneField.value.length > 0 && !phoneField.value.startsWith("+")) {
                phoneField.value = "+33" + phoneField.value;
            }
        });

        // Fonction de validation du numéro de téléphone
        function validatePhoneNumber(phoneNumber) {
            let regex = /^\+?[1-9]\d{7,14}$/;
            if (!regex.test(phoneNumber)) {
                return { valid: false, message: "❌ Format de numéro invalide. Utilisez + suivi du code pays." };
            }
            return { valid: true, message: "✅ Format valide" };
        }

        // Vérification du numéro via API NumVerify
        async function checkPhoneNumberExists(phoneNumber) {
            let url = `https://apilayer.net/api/validate?access_key=${NUMVERIFY_API_KEY}&number=${phoneNumber}&format=1`;

            try {
                let response = await fetch(url);
                let data = await response.json();
                console.log("📞 Résultat API NumVerify :", data);

                if (data.valid) {
                    return { valid: true, message: "✅ Numéro valide et existant." };
                } else {
                    return { valid: false, message: "❌ Numéro invalide ou inexistant." };
                }
            } catch (error) {
                console.error("❌ Erreur API NumVerify :", error);
                return { valid: false, message: "⚠ Erreur de vérification du numéro." };
            }
        }

        // Fonction testTelegram (envoi Telegram avec validation)
        window.testTelegram = async function () {
            let teamName = document.getElementById("team-name").value;
            let phoneNumber = document.getElementById("phone-number").value;
            let participants = document.getElementById("participants").value;

            if (!teamName || !phoneNumber || !participants) {
                alert("❌ Erreur : Remplissez tous les champs avant d'envoyer !");
                return;
            }

            // Vérification format
            let validation = validatePhoneNumber(phoneNumber);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            // Vérification existence (API)
            let check = await checkPhoneNumberExists(phoneNumber);
            if (!check.valid) {
                alert(check.message);
                return;
            }

            let message = `📌 **Nouvelle Inscription !**\n\n👥 **Équipe** : ${teamName}\n📞 **Téléphone** : ${phoneNumber}\n🎟️ **Participants** : ${participants}`;

            let url = `https://api.telegram.org/bot${window.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${window.env.VITE_TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

            console.log("🚀 Tentative d'envoi Telegram :", url);

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        alert("✅ Inscription validée et envoyée sur Telegram !");
                    } else {
                        console.error("❌ Erreur Telegram :", data);
                        alert("❌ Erreur : Impossible d'envoyer l'inscription sur Telegram.");
                    }
                })
                .catch(error => {
                    console.error("❌ Erreur réseau :", error);
                    alert("❌ Erreur : Problème avec la connexion à Telegram.");
                });
        };

        console.log("✅ script.js est bien chargé et exécuté !");
    })
    .catch(error => {
        console.error("❌ Erreur lors de la récupération des variables d’environnement :", error);
    });
