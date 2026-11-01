// ========================================
// FISHIFT - UI
// HUD, vangstenteller en meldingen
// ========================================

export function createUI() {

    // ====================================
    // HTML ELEMENTEN
    // ====================================

    const countElement =
        document.getElementById("catch-count");

    const statusElement =
        document.getElementById("status");

    const messageElement =
        document.getElementById("message");

    const errorElement =
        document.getElementById("error");


    // ====================================
    // VANGSTENTELLER
    // ====================================

    function setCount(count) {

        countElement.textContent = count;

    }


    // ====================================
    // KANONSTATUS
    // ====================================

    function setStatus(status) {

        statusElement.textContent = status;

    }


    // ====================================
    // BERICHTEN
    // ====================================

    let messageTimeout = null;

    function setMessage(message) {

        messageElement.textContent = message;

        messageElement.style.opacity = "1";

        if (messageTimeout) {
            clearTimeout(messageTimeout);
        }

        messageTimeout = setTimeout(() => {

            messageElement.style.opacity = "0.5";

        }, 2500);

    }


    // ====================================
    // FOUTMELDINGEN
    // ====================================

    function showError(message) {

        errorElement.hidden = false;

        errorElement.textContent = message;

    }


    // ====================================
    // STARTWAARDEN
    // ====================================

    setCount(0);

    setStatus("KANON GEREED");

    setMessage(
        "Richt met A en D — klik om te schieten"
    );


    // ====================================
    // PUBLIEKE FUNCTIES
    // ====================================

    return {

        setCount,

        setStatus,

        setMessage,

        showError

    };

}
