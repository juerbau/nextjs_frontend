
export function getCsrfToken(){

    const cookieString = document.cookie;

    // Regulärer Ausdruck, um den Wert des XSRF-TOKENs zu finden.
    // Es wird der Wert nach 'XSRF-TOKEN=' bis zum nächsten Semikolon oder Stringende erfasst.
    const match = cookieString.match(/XSRF-TOKEN=([^;]+)/);

    if (match && match[1]) {
        // match[1] ist der URL-kodierte Wert
        try {
            // Dekodierung des Tokens, um URL-Zeichen (%3D, etc.) zu entfernen,
            // da Laravel den dekodierten Wert im Header erwartet.
            return decodeURIComponent(match[1]);
        } catch (error) {
            console.error("Fehler beim Dekodieren des CSRF-Tokens:", error);
            return null;
        }
    }

    return null;
}