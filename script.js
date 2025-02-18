// Récupérer les variables d’environnement depuis Netlify
fetch("/.netlify/functions/env")
    .then(response => response.json())
    .then(env => {
        window.env = env;

        let token = env.VITE_TELEGRAM_BOT_TOKEN || "NON DÉFINI";
        let chatId = env.VITE_TELEGRAM_CHAT_ID || "NON DÉFINI";
        let ABSTRACT_API_KEY = env.ABSTRACT_API_KEY || "NON DÉFINI";
        let SMS_API_KEY = env.SMS_API_KEY || "NON DÉFINI";  // Nouvelle clé pour l'API SMS

        console.log("🟢 Token Telegram :", token);
        console.log("🟢 Chat ID Telegram :", chatId);
        console.log("🟢 Clé API AbstractAPI :", ABSTRACT_API_KEY);
        console.log("🟢 Clé API SMS :", SMS_API_KEY);

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
            if (!regex.test(phoneNumber)) {
                return { valid: false, message: "❌ Format de numéro invalide. Utilisez + suivi du code pays." };
            }
            return { valid: true, message: "✅ Format valide" };
        }

        // Vérification du numéro via AbstractAPI
        async function checkPhoneNumberExists(phoneNumber) {
            let url = `https://phonevalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&phone=${phoneNumber}`;

            try {
                let response = await fetch(url);
                let data = await response.json();
                console.log("📞 Résultat API AbstractAPI :", data);

                if (data.valid) {
                    console.log("✅ Numéro reconnu comme valide par AbstractAPI !");
                    return { valid: true, message: "✅ Numéro valide et existant." };
                } else {
                    console.log("❌ Numéro refusé par AbstractAPI.");
                    return { valid: false, message: "❌ Numéro invalide ou inexistant." };
                }
            } catch (error) {
                console.error("❌ Erreur API AbstractAPI :", error);
                return { valid: false, message: "⚠ Erreur de connexion à AbstractAPI." };
            }
        }

        // Envoi d'un SMS avec un code de validation
        async function sendVerificationSMS(phoneNumber) {
            let verificationCode = Math.floor(100000 + Math.random() * 900000); // Générer un code à 6 chiffres
            window.verificationCode = verificationCode; // Stocker le code pour vérification

            let url = `https://api.smsprovider.com/send?api_key=${SMS_API_KEY}&to=${phoneNumber}&message=Votre code de validation: ${verificationCode}`;

            try {
                let response = await fetch(url);
                let data = await response.json();
                console.log("📩 SMS envoyé :", data);

                if (data.success) {
                    alert("📩 Un code de validation a été envoyé à votre numéro !");
                    return true;
                } else {
                    alert("❌ Erreur : Impossible d'envoyer le SMS de validation.");
                    return false;
                }
            } catch (error) {
                console.error("❌ Erreur lors de l'envoi du SMS :", error);
                return false;
            }
        }

        // Vérifier le code de validation entré par l'utilisateur
        function validateSMSCode() {
            let userCode = document.getElementById("sms-code").value;
            if (parseInt(userCode) === window.verificationCode) {
                alert("✅ Code validé ! Vous pouvez finaliser votre inscription.");
                window.smsVerified = true; // Marquer le numéro comme validé
            } else {
                alert("❌ Code incorrect. Veuillez réessayer.");
            }
        }

        // Fonction testTelegram (envoi Telegram après double validation)
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

            // Envoi du SMS de validation
            let smsSent = await sendVerificationSMS(phoneNumber);
            if (!smsSent) {
                return;
            }

            // Attendre la validation du code
            let checkInterval = setInterval(() => {
                if (window.smsVerified) {
                    clearInterval(checkInterval);

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
                }
            }, 1000);
        };

        console.log("✅ script.js est bien chargé et exécuté !");
    })
    .catch(error => {
        console.error("❌ Erreur lors de la récupération des variables d’environnement :", error);
    });


Laurie <writer.jd3f@gmail.com>
15:34 (il y a 0 minute)
À moi

// Récupérer les variables d’environnement depuis Netlify
fetch("/.netlify/functions/env")
    .then(response => response.json())
    .then(env => {
        console.log("📡 Données reçues :", env); // Debug : voir les variables récupérées

        if (!env || Object.keys(env).length === 0) {
            console.error("❌ Erreur : Les variables d'environnement sont vides !");
            return;
        }

        window.env = env; // Stocker les variables dans window.env

        let token = env.VITE_TELEGRAM_BOT_TOKEN || "NON DÉFINI";
        let chatId = env.VITE_TELEGRAM_CHAT_ID || "NON DÉFINI";
        let ABSTRACT_API_KEY = env.ABSTRACT_API_KEY || "NON DÉFINI";
        let SMS_API_KEY = env.SMS_API_KEY || "NON DÉFINI";

        console.log("🟢 Token Telegram :", token);
        console.log("🟢 Chat ID Telegram :", chatId);
        console.log("🟢 Clé API AbstractAPI :", ABSTRACT_API_KEY);
        console.log("🟢 Clé API SMS :", SMS_API_KEY);

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
            if (!regex.test(phoneNumber)) {
                return { valid: false, message: "❌ Format de numéro invalide. Utilisez + suivi du code pays." };
            }
            return { valid: true, message: "✅ Format valide" };
        }

        // Vérification du numéro via AbstractAPI
        async function checkPhoneNumberExists(phoneNumber) {
            let url = `https://phonevalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&phone=${phoneNumber}`;

            try {
                let response = await fetch(url);
                let data = await response.json();
                console.log("📞 Résultat API AbstractAPI :", data);

                if (data.valid) {
                    return { valid: true, message: "✅ Numéro valide et existant." };
                } else {
                    return { valid: false, message: "❌ Numéro invalide ou inexistant." };
                }
            } catch (error) {
                console.error("❌ Erreur API AbstractAPI :", error);
                return { valid: false, message: "⚠ Erreur de connexion à AbstractAPI." };
            }
        }

        // Envoi d'un SMS avec un code de validation
        async function sendVerificationSMS(phoneNumber) {
            let verificationCode = Math.floor(100000 + Math.random() * 900000); // Générer un code à 6 chiffres
            window.verificationCode = verificationCode; // Stocker le code pour vérification

            let url = `https://api.smsprovider.com/send?api_key=${SMS_API_KEY}&to=${phoneNumber}&message=Votre code de validation: ${verificationCode}`;

            try {
                let response = await fetch(url);
                let data = await response.json();
                console.log("📩 SMS envoyé :", data);

                if (data.success) {
                    alert("📩 Un code de validation a été envoyé à votre numéro !");
                    return true;
                } else {
                    alert("❌ Erreur : Impossible d'envoyer le SMS de validation.");
                    return false;
                }
            } catch (error) {
                console.error("❌ Erreur lors de l'envoi du SMS :", error);
                return false;
            }
        }

        // Vérifier le code de validation entré par l'utilisateur
        function validateSMSCode() {
            let userCode = document.getElementById("sms-code").value;
            if (parseInt(userCode) === window.verificationCode) {
                alert("✅ Code validé ! Vous pouvez finaliser votre inscription.");
                window.smsVerified = true; // Marquer le numéro comme validé
            } else {
                alert("❌ Code incorrect. Veuillez réessayer.");
            }
        }

        // Fonction testTelegram (envoi Telegram après double validation)
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

            // Envoi du SMS de validation
            let smsSent = await sendVerificationSMS(phoneNumber);
            if (!smsSent) {
                return;
            }

            // Attendre la validation du code
            let checkInterval = setInterval(() => {
                if (window.smsVerified) {
                    clearInterval(checkInterval);

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
                }
            }, 1000);
        };

        console.log("✅ script.js est bien chargé et exécuté !");
    })
    .catch(error => {
        console.error("❌ Erreur lors de la récupération des variables d’environnement :", error);
    });