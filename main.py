import os
import json
import base64
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import unicodedata
import string

# Connexion sécurisée à Google Sheets
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
google_creds_b64 = os.environ.get("GOOGLE_CREDENTIALS_B64")
google_creds = base64.b64decode(google_creds_b64).decode()
creds_dict = json.loads(google_creds)
creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
client = gspread.authorize(creds)

# Normalisation du texte
def normalize_text(text):
    text = text.strip().lower()
    text = ''.join(c for c in unicodedata.normalize('NFD', text)
                   if unicodedata.category(c) != 'Mn')
    text = text.translate(str.maketrans('', '', string.punctuation)).replace(" ", "")
    return text

# Lecture des données du tableau principal
raw_data = sheet.get_all_records()
questions = []
for row in raw_data:
  try :
    questions.append({
        "Etape": row.get("Etape", ""),
        "Type": row.get("Type detape", ""),
        "Message": row.get("Message", ""),
        "Réponse attendue": normalize_text(row.get("Réponse attendue", "")),
        "Indices": [row.get(f"Indice {i}", "") for i in range(1, 5) if row.get(f"Indice {i}")]
    })
  except Exception as e:
    print(f"Erreur lors de la lecture de la ligne {row}: {e}")

# Détection de la langue et sélection de la feuille correspondante
def detect_language(update: Update) -> str:
    lang = update.effective_user.language_code or "fr"
    return "FeuilleEN" if lang.lower().startswith("en") else "FeuilleFR"

# Chargement des données de jeu depuis Google Sheets
def get_data(update: Update):
    feuille = detect_language(update)
    sheet = client.open_by_key("19I69nISBj74wAsVpQO2z2T2hptZ-iJVxQxBTl9DX8hk").worksheet(feuille)
    raw_data = sheet.get_all_records()
    questions = []
    for row in raw_data:
        questions.append({
            "Etape": row.get("Etape", ""),
            "Type": row.get("Type detape", ""),
            "Message": row.get("Message", ""),
            "Réponse attendue": normalize_text(row.get("Réponse attendue", "")),
            "Indices": [row.get(f"Indice {i}", "") for i in range(1, 5) if row.get(f"Indice {i}")]
        })
    return questions

# Feuille des codes d'accès
sheet_codes = client.open_by_key("19I69nISBj74wAsVpQO2z2T2hptZ-iJVxQxBTl9DX8hk").worksheet("FeuilleCodes")

# Marquer un code comme utilisé
def marquer_code_utilise(code):
    try:
        data = sheet_codes.get_all_records()
        for i, row in enumerate(data, start=2):
            if row["Code"].strip().upper() == code:
                sheet_codes.update_cell(i, 3, "oui")  # Colonne C = "Utilisé"
                return True
    except Exception as e:
        print("[ERREUR marquer_code_utilise]", e)
    return False

# Commande /start avec code en paramètre
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.args:
        user_code = context.args[0].strip().upper()
    else:
        await update.message.reply_text("Bienvenue dans MysseaTM !\nMerci d'utiliser le lien fourni après ton inscription.")
        return

    if not user_code.startswith("MYS-"):
        await update.message.reply_text("⚠️ Code invalide. Le format attendu est : MYS-XXXXX")
        return

    try:
        data = sheet_codes.get_all_records()
        for i, row in enumerate(data, start=2):
            if row["Code"].strip().upper() == user_code:
                if row["Statut"].strip().lower() != "délivré":
                    await update.message.reply_text("⚠️ Ce code n'est pas actif.")
                    return
                if row["Utilisé"].strip().lower() == "oui":
                    await update.message.reply_text("⚠️ Ce code a déjà été utilisé.")
                    return
                context.user_data["code_en_cours"] = user_code
                context.user_data["questions"] = get_data(update)
                context.user_data["current_index"] = 0
                context.user_data["jeu_en_cours"] = True
                context.user_data["tries"] = 0  # Réinitialise le compteur d'essais
                await update.message.reply_text("✅ Code accepté ! L'aventure commence maintenant...")
                await update.message.reply_text(context.user_data["questions"][0]["Message"])
                return
        await update.message.reply_text("❌ Ce code n'est pas reconnu. Vérifie ton lien ou contacte l'équipe.")
    except Exception as e:
        print("[ERREUR start]", e)
        await update.message.reply_text("Une erreur est survenue.")

# Gestion des réponses du jeu avec essais et encouragements
async def handle_reponse_jeu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.user_data.get("jeu_en_cours"):
        await update.message.reply_text("Envoie /start avec ton code pour commencer.")
        return

    questions = context.user_data["questions"]
    index = context.user_data["current_index"]
    user_answer = normalize_text(update.message.text)
    question = questions[index]
    bonne_reponse = question["Réponse attendue"]
    tries = context.user_data.get("tries", 0)

 # Si la réponse est correcte
    if user_answer == bonne_reponse:
        context.user_data["current_index"] += 1
        # Fin - Phrase mystère (avant-dernière étape)
        if index == len(questions) - 2:
            await update.message.reply_text("✨ Bien joué ! Vous avez résolu la phrase mystère.")
            marquer_code_utilise(context.user_data.get("code_en_cours", ""))
            return
        # Fin - Certificat (dernière étape)
        elif index == len(questions) - 1:
            await update.message.reply_text("📜 Voici votre certificat ! Le jeu est terminé.")
            marquer_code_utilise(context.user_data.get("code_en_cours", ""))
            return
        # Passage à l'étape suivante
        else:
            await update.message.reply_text("✅ Bonne réponse !")
            prochaine_question = questions[context.user_data["current_index"]]["Message"]
            await update.message.reply_text(prochaine_question)
    else:
        indices = question["Indices"]
        if tries < 3:
            # Encourage le joueur après chaque mauvaise réponse
            encouragement = f"🌟 Essai {tries + 1} : Ce n'est pas tout à fait ça. Essayez encore !"
            await update.message.reply_text(encouragement)
            context.user_data["tries"] = tries + 1
        else:
            # Si plus d'essais, on donne les indices dans l'ordre
            if indices:
                if tries == 3:  # Premier indice
                    indice = indices[0]
                    await update.message.reply_text(f"🔍 Indice 1 : {indice}")
                elif tries == 4:  # Deuxième indice
                    indice = indices[1] if len(indices) > 1 else None
                    if indice:
                        await update.message.reply_text(f"🔍 Indice 2 : {indice}")
                    else:
                        await update.message.reply_text("❌ Pas d'autres indices disponibles. Vous passez à la ligne suivante.")
                        context.user_data["current_index"] += 1
                        await update.message.reply_text(questions[context.user_data["current_index"]]["Message"])
                        return
                elif tries == 5:  # Troisième indice
                    indice = indices[2] if len(indices) > 2 else None
                    if indice:
                        await update.message.reply_text(f"🔍 Indice 3 : {indice}")
                    else:
                        await update.message.reply_text("❌ Pas d'autres indices disponibles. Vous passez à la ligne suivante.")
                        context.user_data["current_index"] += 1
                        await update.message.reply_text(questions[context.user_data["current_index"]]["Message"])
                        return
                elif tries == 6:  # Quatrième indice
                    indice = indices[3] if len(indices) > 3 else None
                    if indice:
                        await update.message.reply_text(f"🔍 Indice 4 : {indice}")
                    else:
                        await update.message.reply_text("❌ Pas d'autres indices disponibles. Vous passez à la ligne suivante.")
                        context.user_data["current_index"] += 1
                        await update.message.reply_text(questions[context.user_data["current_index"]]["Message"])
                        return
            else:
                # Si pas d'indices, on passe à la question suivante (sauf pour la phrase mystère)
                if index == len(questions) - 2:  # Phrase mystère
                    await update.message.reply_text("❌ Vous n'avez pas trouvé la réponse à la phrase mystère. Le jeu est terminé sans certificat.")
                    marquer_code_utilise(context.user_data.get("code_en_cours", ""))
                else:
                    # Message de fin d'étape si tous les indices sont épuisés
                    await update.message.reply_text("❌ Aucune réponse correcte. Vous pouvez retourner au site et rejouer !")
                    marquer_code_utilise(context.user_data.get("code_en_cours", ""))
                    await update.message.reply_text("🔗 Retournez sur le site pour un nouveau jeu : https://myssea-jeux-culturels-et-touristiques.netlify.app")
                return

# Lancement du bot en mode webhook
def main():
    TOKEN = os.environ.get("TELEGRAM_TOKEN")
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_reponse_jeu))
    print("🤖 Myssea bot en mode webhook prêt !")
    app.run_webhook(
        listen="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),  # Le port est défini ici
        webhook_url="https://mysseatest-bot-webhook.onrender.com"  # URL de webhook
    )

if __name__ == "__main__":
    main()