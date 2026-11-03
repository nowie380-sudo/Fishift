
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
        speed: 4
    };

    let seatedStation = -1;
    let yaw = 0;
    let pitch = 0;

    const maxAim = 0.65;
    const aimSpeed = 1.5;
    const interactionDistance = 2.5;

    // Bewaar de oorspronkelijke richting van elk kanon
    const baseRotations = cannonPivots.map(
        pivot => pivot.rotation.y
    );

    const aimOffsets = cannonPivots.map(() => 0);

    camera.position.copy(player.position);

    function keyDown(event) {
        keys[event.code] = true;

        if (event.code === "KeyE") {
            sitAtNearestStation();
        }

        if (event.code === "KeyQ") {
            standUp();
        }
    }

    function keyUp(event) {
        keys[event.code] = false;
    }

    function mouseMove(event) {
        if (seatedStation === -1) {
            if (document.pointerLockElement !== document.body) return;

            yaw -= event.movementX * 0.002;
            pitch -= event.movementY * 0.002;

            pitch = THREE.MathUtils.clamp(
                pitch,
                -1.2,
                1.2
            );

            camera.rotation.order = "YXZ";
            camera.rotation.set(pitch, yaw, 0);
        }
    }

    function mouseDown(event) {
        if (event.button !== 0) return;

        if (seatedStation !== -1) {
            harpoons[seatedStation].shoot();
        } else {
            document.body.requestPointerLock();
        }
    }

    function sitAtNearestStation() {
        if (seatedStation !== -1) return;

        let nearestIndex = -1;
        let nearestDistance = Infinity;

        for (let i = 0; i < harpoonSeatPositions.length; i++) {
            const seat = harpoonSeatPositions[i];

            const distance = player.position.distanceTo(
                seat.position
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }

        if (
            nearestIndex === -1 ||
            nearestDistance > interactionDistance
        ) {
            ui.setMessage("Loop dichter naar een harpoen");
            return;
        }

        seatedStation = nearestIndex;

        const seat = harpoonSeatPositions[seatedStation];

        player.position.copy(seat.position);
        yaw = seat.yaw;
        pitch = 0;

        camera.position.copy(seat.position);
        camera.rotation.order = "YXZ";
        camera.rotation.set(0, yaw, 0);

        document.exitPointerLock();

        ui.setMessage(
            "A/D richten | Klik om te schieten | Q om op te staan"
        );
    }

    function standUp() {
        if (seatedStation === -1) return;

        seatedStation = -1;

        camera.position.copy(player.position);
        camera.rotation.order = "YXZ";
        camera.rotation.set(pitch, yaw, 0);

        ui.setMessage("WASD om te lopen | E bij een harpoen");
    }

    function updateWalking(delta) {
        const forward = new THREE.Vector3(
            -Math.sin(yaw),
            0,
            -Math.cos(yaw)
        );

        const right = new THREE.Vector3(
            Math.cos(yaw),
            0,
            -Math.sin(yaw)
        );

        const movement = new THREE.Vector3();

        if (keys.KeyW) movement.add(forward);
        if (keys.KeyS) movement.sub(forward);
        if (keys.KeyD) movement.add(right);
        if (keys.KeyA) movement.sub(right);

        if (movement.lengthSq() > 0) {
            movement.normalize();
            movement.multiplyScalar(player.speed * delta);
            player.position.add(movement);
        }

        // Binnen de centrale kamer blijven
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

        player.position.y = 1.7;

        camera.position.copy(player.position);
        camera.rotation.order = "YXZ";
        camera.rotation.set(pitch, yaw, 0);
    }

    function updateAiming(delta) {
        if (seatedStation === -1) return;

        const index = seatedStation;
        let direction = 0;

        if (keys.KeyA) direction += 1;
        if (keys.KeyD) direction -= 1;

        aimOffsets[index] += direction * aimSpeed * delta;

        aimOffsets[index] = THREE.MathUtils.clamp(
            aimOffsets[index],
            -maxAim,
            maxAim
        );

        // Basisrichting behouden en alleen de richtcorrectie toevoegen
        cannonPivots[index].rotation.y =
            baseRotations[index] + aimOffsets[index];
    }

    function update(delta) {
        if (seatedStation === -1) {
            updateWalking(delta);
        } else {
            updateAiming(delta);
        }
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mousedown", mouseDown);

    return {
        update,
        getSeatedStation: () => seatedStation
    };
}
