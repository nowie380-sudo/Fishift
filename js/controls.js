 // ========================================
 // FISHIFT - CONTROLS
 // Rondlopen + harpoenstation
 // ========================================

import * as THREE from "three";

export function createControls({
    camera,
    renderer,
    cannonPivot,
    harpoon,
    playerStart,
    harpoonSeatPosition,
    ui
}) {

    // ========================================
    // SPELERINSTELLINGEN
    // ========================================

    const player = {
        position: playerStart.clone(),
        height: 1.7,
        speed: 4.5,
        radius: 0.35
    };

    const keys = {
        forward: false,
        backward: false,
        left: false,
        right: false
    };

    let seated = false;

    // Kijkrichting
    let yaw = 0.36;
    let pitch = 0;

    const mouseSensitivity = 0.002;
    const rotationSpeed = 1.5;
    const maxCannonAngle = 0.85;

    const direction = new THREE.Vector3();
    const rightDirection = new THREE.Vector3();

    // ========================================
    // CAMERA
    // ========================================

    camera.rotation.order = "YXZ";

    function updateCameraRotation() {
        camera.rotation.set(pitch, yaw, 0);
    }

    updateCameraRotation();

    // ========================================
    // TOETSEN INDRUKKEN
    // ========================================

    function keyDown(event) {

        const key = event.key.toLowerCase();

        if (key === "w") keys.forward = true;
        if (key === "s") keys.backward = true;
        if (key === "a") keys.left = true;
        if (key === "d") keys.right = true;

        // Ga zitten bij het harpoenstation
        if (key === "e" && !seated) {
            trySitDown();
        }

        // Opstaan
        if (key === "q" && seated) {
            standUp();
        }
    }

    function keyUp(event) {

        const key = event.key.toLowerCase();

        if (key === "w") keys.forward = false;
        if (key === "s") keys.backward = false;
        if (key === "a") keys.left = false;
        if (key === "d") keys.right = false;
    }

    // ========================================
    // MUISBEWEGING
    // ========================================

    function mouseMove(event) {

        if (seated) return;

        if (document.pointerLockElement !== renderer.domElement) {
            return;
        }

        yaw -= event.movementX * mouseSensitivity;
        pitch -= event.movementY * mouseSensitivity;

        pitch = Math.max(
            -1.2,
            Math.min(1.2, pitch)
        );

        updateCameraRotation();
    }

    // ========================================
    // MUISKLIK
    // ========================================

    function mouseDown(event) {

        if (event.button !== 0) return;

        if (seated) {
            harpoon.shoot();
            return;
        }

        // Klik om de muisbesturing te activeren
        if (document.pointerLockElement !== renderer.domElement) {
            renderer.domElement.requestPointerLock();
        }
    }

    // ========================================
    // HARPOENSTATION
    // ========================================

    function trySitDown() {

        const distance = camera.position.distanceTo(
            cannonPivot.position
        );

        if (distance > 2.3) {
            ui.setMessage("Loop naar het harpoenstation");
            return;
        }

        seated = true;

        // Muisbesturing loslaten
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        // Naar de vaste zitpositie
        camera.position.copy(harpoonSeatPosition);

        yaw = 0;
        pitch = 0;

        updateCameraRotation();

        // Kanon recht vooruit zetten
        cannonPivot.rotation.y = 0;

        ui.setStatus("HARPOENSTATION");
        ui.setMessage("A / D richten — klik schieten — Q opstaan");
    }

    function standUp() {

        seated = false;

        // Terug naar de looppositie
        player.position.set(
            0,
            player.height,
            5.5
        );

        camera.position.copy(player.position);

        yaw = 0;
        pitch = 0;

        updateCameraRotation();

        ui.setStatus("ONDERZEEËR");
        ui.setMessage("WASD lopen — muis kijken — E bij station");
    }

    // ========================================
    // SPELERBEWEGING
    // ========================================

    function movePlayer(delta) {

        direction.set(0, 0, 0);

        // Vooruit en achteruit
        if (keys.forward) direction.z -= 1;
        if (keys.backward) direction.z += 1;

        // Links en rechts
        if (keys.left) direction.x -= 1;
        if (keys.right) direction.x += 1;

        if (direction.lengthSq() === 0) return;

        direction.normalize();

        // Beweging afhankelijk van kijkrichting
        rightDirection.set(
            Math.cos(yaw),
            0,
            Math.sin(yaw)
        );

        const forward = new THREE.Vector3(
            -Math.sin(yaw),
            0,
            -Math.cos(yaw)
        );

        const movement = new THREE.Vector3();

        movement.addScaledVector(
            forward,
            -direction.z
        );

        movement.addScaledVector(
            rightDirection,
            direction.x
        );

        movement.normalize();
        movement.multiplyScalar(player.speed * delta);

        const nextX = player.position.x + movement.x;
        const nextZ = player.position.z + movement.z;

        // Eenvoudige grenzen van de onderzeeër
        player.position.x = THREE.MathUtils.clamp(
            nextX,
            -7.2,
            7.2
        );

        player.position.z = THREE.MathUtils.clamp(
            nextZ,
            -7.1,
            7.1
        );

        // Niet door het grote raam lopen
        if (player.position.z < -4.7) {
            player.position.z = -4.7;
        }

        camera.position.copy(player.position);
    }

    // ========================================
    // UPDATE
    // ========================================

    function update(delta) {

        if (seated) {

            let cannonDirection = 0;

            if (keys.left) cannonDirection += 1;
            if (keys.right) cannonDirection -= 1;

            cannonPivot.rotation.y +=
                cannonDirection * rotationSpeed * delta;

            cannonPivot.rotation.y = THREE.MathUtils.clamp(
                cannonPivot.rotation.y,
                -maxCannonAngle,
                maxCannonAngle
            );

            return;
        }

        movePlayer(delta);

        // Bericht wanneer je dicht bij het station bent
        const distance = camera.position.distanceTo(
            cannonPivot.position
        );

        if (distance <= 2.3) {
            ui.setMessage("Druk op E om bij het harpoenstation te gaan zitten");
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mousedown", mouseDown);

    window.addEventListener("blur", () => {
        keys.forward = false;
        keys.backward = false;
        keys.left = false;
        keys.right = false;
    });

    // ========================================
    // START
    // ========================================

    camera.position.copy(player.position);

    ui.setStatus("ONDERZEEËR");
    ui.setMessage("Klik om muisbesturing te activeren — WASD om te lopen");

    return {
        update
    };
}
