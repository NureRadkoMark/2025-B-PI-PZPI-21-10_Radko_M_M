const languages = {
    "en": {
        BookingConfirmation: "Dear [User], your parking spot at [Location] for [Date/Time] is confirmed. Booking ID: [ID]. Thank you for choosing us!",
        BookingCancellation: "Your booking at [Location] on [Date] has been canceled. Refund (if applicable) will be processed. Contact support for details.",
        BookingReminder: "Reminder: Your parking reservation at [Location] starts in [X] hours. Arrive before [Time] to guarantee your spot.",
        ParkingEntryConfirmed: "Welcome to [Location]! Your entry at [Time] has been logged. Parking expires at [Expiry Time].",
        ParkingExitConfirmed: "Thank you for using [Location]! You exited at [Time]. Review your session details in the app.",
        ParkingTimeExpiring: "Heads up! Your parking time at [Location] ends in [X] minutes. Extend your stay via the app to avoid penalties.",
        OverstayWarning: "Alert: You’ve exceeded your parking time at [Location]. Additional charges of [Amount] will apply. Please exit immediately.",
        PaymentSuccess: "Payment of [Amount] for [Service] was successful. Thank you!",
        PaymentFailed: "Payment failed for [Service]. Update your payment method or retry within [X] hours to avoid service interruption.",
        RefundProcessed: "A refund of [Amount] for [Service] has been issued. It may take some time to reflect in your account.",
        NegativeBalanceAlert: "Your account balance is negative ([Balance]). In case of non-payment your account will be blocked within 24 hours.",
        PolicyUpdate: "We’ve updated our terms of service. Review changes [here]. By continuing to use the app, you agree to the new policies.",
        IncidentReported: "We’re investigating an incident reported at [Location] on [Date]. Contact support for assistance.",
        AppUpdate: "A new app version is available! Update now for improved features and security.",
        ServiceOutage: "We’re experiencing technical issues. Services may be disrupted until [Time]. Sorry for the inconvenience.",
    },

    "ua": {
        BookingConfirmation: "Шановний(а) [User], ваше паркувальне місце на [Location] на [Date/Time] підтверджено. ID бронювання: [ID]. Дякуємо, що обрали нас!",
        BookingCancellation: "Вашу бронь на [Location] [Date] скасовано. Повернення коштів (якщо передбачено) буде оброблено. Зверніться до підтримки для деталей.",
        BookingReminder: "Нагадування: ваша бронь на паркування в [Location] починається через [X] годин. Приїдьте до [Time], щоб гарантувати місце.",
        ParkingEntryConfirmed: "Ласкаво просимо до [Location]! Ваш в'їзд зафіксовано о [Time]. Час паркування завершується о [Expiry Time].",
        ParkingExitConfirmed: "Дякуємо за використання [Location]! Ви виїхали о [Time]. Перегляньте деталі сесії в додатку.",
        ParkingTimeExpiring: "Увага! Час вашого паркування в [Location] завершується через [X] хвилин. Продовжіть перебування в додатку, щоб уникнути штрафів.",
        OverstayWarning: "Попередження: Ви перевищили час паркування в [Location]. Додаткові збори: [Amount]. Будь ласка, залиште місце негайно.",
        PaymentSuccess: "Оплата на суму [Amount] за [Service] успішна. Дякуємо!",
        PaymentFailed: "Не вдалося здійснити оплату за [Service]. Оновіть спосіб оплати або повторіть спробу протягом [X] годин.",
        RefundProcessed: "Повернення коштів у розмірі [Amount] за [Service] оброблено. Це може зайняти трохи часу.",
        NegativeBalanceAlert: "Ваш баланс негативний ([Balance]). У разі несплати обліковий запис буде заблоковано протягом 24 годин.",
        PolicyUpdate: "Ми оновили правила використання. Ознайомтеся зі змінами [here]. Продовжуючи використання, ви погоджуєтесь з новими умовами.",
        IncidentReported: "Ми розслідуємо інцидент, що стався в [Location] [Date]. Зверніться до підтримки.",
        AppUpdate: "Доступна нова версія додатку! Оновіть, щоб отримати нові можливості та покращену безпеку.",
        ServiceOutage: "У нас технічні проблеми. Послуги можуть бути недоступні до [Time]. Перепрошуємо за незручності.",
    },

    "de": {
        BookingConfirmation: "Lieber [User], Ihr Parkplatz bei [Location] für [Date/Time] ist bestätigt. Buchungsnummer: [ID]. Vielen Dank, dass Sie uns gewählt haben!",
        BookingCancellation: "Ihre Buchung bei [Location] am [Date] wurde storniert. Eine Rückerstattung (falls zutreffend) wird bearbeitet. Kontaktieren Sie den Support für Details.",
        BookingReminder: "Erinnerung: Ihre Parkreservierung bei [Location] beginnt in [X] Stunden. Kommen Sie vor [Time], um Ihren Platz zu sichern.",
        ParkingEntryConfirmed: "Willkommen bei [Location]! Ihre Einfahrt um [Time] wurde registriert. Parkzeit endet um [Expiry Time].",
        ParkingExitConfirmed: "Vielen Dank für die Nutzung von [Location]! Sie haben um [Time] ausgecheckt. Details in der App einsehbar.",
        ParkingTimeExpiring: "Achtung! Ihre Parkzeit bei [Location] endet in [X] Minuten. Verlängern Sie in der App, um Strafgebühren zu vermeiden.",
        OverstayWarning: "Warnung: Sie haben Ihre Parkzeit bei [Location] überschritten. Zusätzliche Gebühren von [Amount] fallen an. Bitte sofort ausfahren.",
        PaymentSuccess: "Zahlung von [Amount] für [Service] war erfolgreich. Danke!",
        PaymentFailed: "Zahlung für [Service] fehlgeschlagen. Bitte Zahlungsmethode aktualisieren oder innerhalb von [X] Stunden erneut versuchen.",
        RefundProcessed: "Eine Rückerstattung von [Amount] für [Service] wurde veranlasst. Es kann etwas dauern, bis sie erscheint.",
        NegativeBalanceAlert: "Ihr Kontostand ist negativ ([Balance]). Bei Nichtzahlung wird Ihr Konto innerhalb von 24 Stunden gesperrt.",
        PolicyUpdate: "Unsere Nutzungsbedingungen wurden aktualisiert. Änderungen [here] ansehen. Durch Nutzung stimmen Sie zu.",
        IncidentReported: "Ein Vorfall wurde bei [Location] am [Date] gemeldet. Support kontaktieren für Hilfe.",
        AppUpdate: "Neue App-Version verfügbar! Jetzt aktualisieren für bessere Funktionen und Sicherheit.",
        ServiceOutage: "Technische Probleme. Dienste können bis [Time] unterbrochen sein. Entschuldigung für die Unannehmlichkeiten.",
    },

    "fr": {
        BookingConfirmation: "Cher [User], votre place de parking à [Location] pour [Date/Time] est confirmée. ID de réservation : [ID]. Merci de nous avoir choisis !",
        BookingCancellation: "Votre réservation à [Location] le [Date] a été annulée. Le remboursement (le cas échéant) sera traité. Contactez le support pour plus d'informations.",
        BookingReminder: "Rappel : votre réservation à [Location] commence dans [X] heures. Arrivez avant [Time] pour garantir votre place.",
        ParkingEntryConfirmed: "Bienvenue à [Location] ! Votre entrée à [Time] a été enregistrée. Fin de stationnement à [Expiry Time].",
        ParkingExitConfirmed: "Merci d'avoir utilisé [Location] ! Vous êtes sorti à [Time]. Détails disponibles dans l'application.",
        ParkingTimeExpiring: "Attention ! Votre temps de stationnement à [Location] se termine dans [X] minutes. Prolongez via l'app pour éviter des frais.",
        OverstayWarning: "Alerte : Vous avez dépassé votre temps de stationnement à [Location]. Des frais supplémentaires de [Amount] s'appliquent. Veuillez quitter immédiatement.",
        PaymentSuccess: "Paiement de [Amount] pour [Service] effectué avec succès. Merci !",
        PaymentFailed: "Échec du paiement pour [Service]. Mettez à jour votre méthode de paiement ou réessayez dans les [X] heures.",
        RefundProcessed: "Un remboursement de [Amount] pour [Service] a été effectué. Cela peut prendre du temps à apparaître.",
        NegativeBalanceAlert: "Votre solde est négatif ([Balance]). En cas de non-paiement, le compte sera bloqué sous 24h.",
        PolicyUpdate: "Nous avons mis à jour nos conditions d'utilisation. Consultez les changements [here]. En continuant, vous les acceptez.",
        IncidentReported: "Un incident a été signalé à [Location] le [Date]. Contactez le support pour assistance.",
        AppUpdate: "Nouvelle version de l'application disponible ! Mettez à jour pour plus de sécurité et de fonctionnalités.",
        ServiceOutage: "Nous rencontrons des problèmes techniques. Les services peuvent être interrompus jusqu'à [Time]. Désolé pour la gêne occasionnée.",
    },

    "it": {
        BookingConfirmation: "Caro [User], il tuo posto auto a [Location] per [Date/Time] è stato confermato. ID prenotazione: [ID]. Grazie per averci scelto!",
        BookingCancellation: "La tua prenotazione a [Location] per il [Date] è stata annullata. Il rimborso (se previsto) sarà elaborato. Contatta il supporto per dettagli.",
        BookingReminder: "Promemoria: la tua prenotazione a [Location] inizia tra [X] ore. Arriva prima di [Time] per garantire il tuo posto.",
        ParkingEntryConfirmed: "Benvenuto a [Location]! Il tuo ingresso alle [Time] è stato registrato. Il parcheggio scade alle [Expiry Time].",
        ParkingExitConfirmed: "Grazie per aver usato [Location]! Sei uscito alle [Time]. Controlla i dettagli nella app.",
        ParkingTimeExpiring: "Attenzione! Il tempo di parcheggio a [Location] termina tra [X] minuti. Prolunga dall'app per evitare penalità.",
        OverstayWarning: "Attenzione: hai superato il tempo massimo a [Location]. Verranno addebitati [Amount]. Uscire subito.",
        PaymentSuccess: "Pagamento di [Amount] per [Service] completato con successo. Grazie!",
        PaymentFailed: "Pagamento per [Service] fallito. Aggiorna il metodo di pagamento o riprova entro [X] ore.",
        RefundProcessed: "Un rimborso di [Amount] per [Service] è stato effettuato. Potrebbe richiedere tempo per apparire.",
        NegativeBalanceAlert: "Il tuo saldo è negativo ([Balance]). In caso di mancato pagamento, l'account verrà bloccato entro 24 ore.",
        PolicyUpdate: "Abbiamo aggiornato i termini di servizio. Controlla le modifiche [here]. Continuando accetti le nuove condizioni.",
        IncidentReported: "Stiamo indagando su un incidente segnalato a [Location] il [Date]. Contatta il supporto per assistenza.",
        AppUpdate: "È disponibile una nuova versione dell'app! Aggiorna ora per nuove funzionalità e sicurezza.",
        ServiceOutage: "Stiamo riscontrando problemi tecnici. I servizi potrebbero essere interrotti fino alle [Time]. Ci scusiamo per il disagio.",
    },
};

function getLocalizedString(language, key) {
    const selectedLanguage = languages[language] || languages.en;
    return selectedLanguage[key] || key;
}


module.exports = {
    getLocalizedString
};