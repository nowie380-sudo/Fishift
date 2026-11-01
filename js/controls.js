```javascript
// ========================================
// FISHIFT - CONTROLS
// Besturing van het harpoenkanon
// ========================================

export function createControls({
    cannonPivot,
    harpoon
}) {

    // ====================================
    // INSTELLINGEN
    // ====================================

    const SETTINGS = {
        rotationSpeed: 1.5,

        // Maximale draaihoek naar links/rechts
        maxAngle: 0.85
    };

    // Ingedrukte toetsen
    const keys = {
        a: false,
        d: false
    };

    // Huidige draaihoek
    let rotation = 0;


    // ====================================
    // TOETSEN INDRUKKEN
    // ====================================

    window.addEventListener("keydown", (event) => {

        const key = event.key.toLowerCase();

        if (key === "a") {
            keys.a = true;
        }

        if (key === "d") {
            keys.d = true;
        }

    });


    // ====================================
    // TOETSEN LOSLATEN
    // ====================================

    window.addEventListener("keyup", (event) => {

        const key = event.key.toLowerCase();

        if (key === "a") {
            keys.a = false;
        }

        if (key === "d") {
            keys.d = false;
        }

    });


    // ====================================
    // VOORKOMEN DAT TOETSEN VASTBLIJVEN
    // ====================================

    window.addEventListener("blur", () => {

        keys.a = false;
        keys.d = false;

    });


    // ====================================
    // SCHIETEN MET LINKERMUISKNOP
    // ====================================

    window.addEventListener("mousedown", (event) => {

        // Alleen linkermuisknop
        if (event.button !== 0) return;

        // Niet schieten wanneer de speer nog onderweg is
        if (!harpoon.isReady()) return;

        harpoon.shoot();

    });


    // ====================================
    // BESTURING BIJWERKEN
    // ====================================

    function update(delta) {

        let direction = 0;

        if (keys.a) {
            direction -= 1;
        }

        if (keys.d) {
            direction += 1;
        }

        // Kanon draaien
        rotation +=
            direction *
            SETTINGS.rotationSpeed *
            delta;

        // Draaihoek begrenzen
        rotation = Math.max(
            -SETTINGS.maxAngle,
            Math.min(
                SETTINGS.maxAngle,
                rotation
            )
        );

        // Alleen het kanon draaien.
        // De vliegende speer verandert hierdoor NIET van richting.
        cannonPivot.rotation.y = rotation;

    }


    // ====================================
    // PUBLIEKE FUNCTIES
    // ====================================

    return {
        update
    };

}
```
