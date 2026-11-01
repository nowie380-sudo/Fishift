
import * as THREE from "three";

export function createControls({
    camera,
    cannonPivots,
    harpoons,
    playerStart,
    harpoonSeatPositions,
    ui
}) {

    const keys = {};

    const player = {
        position: playerStart.clone(),
        speed: 4,
        height: 1.7
    };

    let seatedStation = -1;
    let yaw = 0;
    let pitch = 0;

    const rotationSpeed = 1.5;
    const maxAngle = 0.85;
    const interactionDistance = 2.5;

    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.position.copy(player.position);

    // ====================================
    // TOETSEN
    // ====================================

    function keyDown(event) {

        const key = event.key.toLowerCase();
        keys[key] = true;

        if (key === "e" && seatedStation === -1) {
            sitAtNearestStation();
        }

        if (key === "q" && seatedStation !== -1) {
            standUp();
        }
    }

    function keyUp(event) {
        keys[event.key.toLowerCase()] = false;
    }

    // ====================================
    // MUIS
    // ====================================

    function mouseMove(event) {

        if (seatedStation !== -1) return;

        if (document.pointerLockElement !== document.body) return;

        yaw -= event.movementX * 0.002;
        pitch -= event.movementY * 0.002;

        pitch = Math.max(
            -1.2,
            Math.min(1.2, pitch)
        );

        camera.rotation.order = "YXZ";
        camera.rotation.set(pitch, yaw, 0);
    }

    function mouseDown(event) {

        if (event.button !== 0) return;

        if (seatedStation !== -1) {
            const harpoon = harpoons[seatedStation];

            if (harpoon) {
                harpoon.shoot();
            }
        } else {
            document.body.requestPointerLock();
        }
    }

    // ====================================
    // HARPOENSTATION ZOEKEN
    // ====================================

    function sitAtNearestStation() {

        let nearest = -1;
        let nearestDistance = Infinity;

        for (let i = 0; i < harpoonSeatPositions.length; i++) {

            const seat = harpoonSeatPositions[i];

            const distance = player.position.distanceTo(
                seat.position
            );

            if (
                distance < interactionDistance &&
                distance < nearestDistance
            ) {
                nearest = i;
                nearestDistance = distance;
            }
        }

        if (nearest === -1) return;

        seatedStation = nearest;

        const seat = harpoonSeatPositions[nearest];

        camera.position.copy(seat.position);

        yaw = seat.yaw;
        pitch = 0;

        camera.rotation.order = "YXZ";
        camera.rotation.set(0, yaw, 0);

        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        if (ui) {
            ui.setMessage("Je zit bij harpoen " + (nearest + 1) + " — Q om op te staan");
        }
    }

    // ====================================
    // OPSTAAN
    // ====================================

    function standUp() {

        seatedStation = -1;

        camera.position.copy(player.position);

        camera.rotation.order = "YXZ";
        camera.rotation.set(pitch, yaw, 0);

        if (ui) {
            ui.setMessage("WASD om te lopen — E bij een harpoen");
        }
    }

    // ====================================
    // LOPEN
    // ====================================

    function updateWalking(delta) {

        forward.set(
            -Math.sin(yaw),
            0,
            -Math.cos(yaw)
        );

        right.set(
            Math.cos(yaw),
            0,
            -Math.sin(yaw)
        );

        direction.set(0, 0, 0);

        if (keys["w"]) direction.add(forward);
        if (keys["s"]) direction.sub(forward);
        if (keys["d"]) direction.add(right);
        if (keys["a"]) direction.sub(right);

        if (direction.lengthSq() > 0) {

            direction.normalize();

            player.position.addScaledVector(
                direction,
                player.speed * delta
            );
        }

        // Eenvoudige begrenzing van de hoofdruimte
        player.position.x = THREE.MathUtils.clamp(
            player.position.x,
            -7,
            7
        );

        player.position.z = THREE.MathUtils.clamp(
            player.position.z,
            -6.3,
            6.3
        );

        player.position.y = player.height;

        camera.position.copy(player.position);
    }

    // ====================================
    // HARPOEN RICHTEN
    // ====================================

    function updateHarpoon(delta) {

        if (seatedStation === -1) return;

        const cannon = cannonPivots[seatedStation];

        if (!cannon) return;

        let turn = 0;

        if (keys["a"]) turn += 1;
        if (keys["d"]) turn -= 1;

        cannon.rotation.y += turn * rotationSpeed * delta;

        cannon.rotation.y = THREE.MathUtils.clamp(
            cannon.rotation.y,
            -maxAngle,
            maxAngle
        );
    }

    // ====================================
    // UPDATE
    // ====================================

    function update(delta) {

        if (seatedStation === -1) {
            updateWalking(delta);
        } else {
            updateHarpoon(delta);
        }
    }

    // ====================================
    // EVENTS
    // ====================================

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mousedown", mouseDown);

    window.addEventListener("blur", () => {
        for (const key in keys) {
            keys[key] = false;
        }
    });

    return {
        update,

        getSeatedStation() {
            return seatedStation;
        }
    };
}
