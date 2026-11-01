// ========================================
// FISHIFT - CONTROLS
// Besturing van het harpoenkanon
// ========================================

export function createControls({ cannonPivot, harpoon }) {

    const keys = {
        left: false,
        right: false
    };

    const rotationSpeed = 1.5;
    const maxAngle = 0.85;

    function keyDown(event) {
        if (event.key.toLowerCase() === "a") {
            keys.left = true;
        }

        if (event.key.toLowerCase() === "d") {
            keys.right = true;
        }
    }

    function keyUp(event) {
        if (event.key.toLowerCase() === "a") {
            keys.left = false;
        }

        if (event.key.toLowerCase() === "d") {
            keys.right = false;
        }
    }

    function mouseDown(event) {
        if (event.button === 0) {
            harpoon.shoot();
        }
    }

    function update(delta) {

        let direction = 0;

        if (keys.left) direction += 1;
        if (keys.right) direction -= 1;

        cannonPivot.rotation.y += direction * rotationSpeed * delta;

        cannonPivot.rotation.y = Math.max(
            -maxAngle,
            Math.min(maxAngle, cannonPivot.rotation.y)
        );
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("mousedown", mouseDown);

    window.addEventListener("blur", () => {
        keys.left = false;
        keys.right = false;
    });

    return {
        update
    };
}
