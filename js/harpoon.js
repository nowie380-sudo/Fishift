// ========================================
// FISHIFT - HARPOON SYSTEM
// Fysieke speer met vaste heen- en terugbaan
// ========================================

import * as THREE from "three";

export function createHarpoon({
    scene,
    cannonPivot,
    fishSystem,
    onCatch,
    onStatus
}) {

    // ====================================
    // INSTELLINGEN
    // ====================================

    const SETTINGS = {
        speed: 20,
        maxDistance: 12,
        collisionRadius: 0.55,
        spearLength: 1.3
    };

    // ====================================
    // SPEER MAKEN
    // ====================================

    const spear = new THREE.Group();

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0xb9c4c9,
        metalness: 0.85,
        roughness: 0.3
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x28343a,
        metalness: 0.6,
        roughness: 0.5
    });

    // Schacht
    const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.045,
            0.055,
            SETTINGS.spearLength,
            8
        ),
        darkMaterial
    );

    shaft.rotation.x = Math.PI / 2;

    spear.add(shaft);

    // Speerpunt
    const tip = new THREE.Mesh(
        new THREE.ConeGeometry(
            0.12,
            0.35,
            8
        ),
        metalMaterial
    );

    tip.rotation.x = -Math.PI / 2;
    tip.position.z = -0.8;

    spear.add(tip);

    // Speer is pas zichtbaar na het schieten
    spear.visible = false;

    scene.add(spear);


    // ====================================
    // SPEER STATUS
    // ====================================

    let state = "ready";

    let origin = new THREE.Vector3();
    let direction = new THREE.Vector3();

    let travelled = 0;

    // Alle vissen die aan deze speer hangen
    let caughtFish = [];


    // ====================================
    // SCHIETEN
    // ====================================

    function shoot() {

        // Geen tweede schot tijdens een vlucht
        if (state !== "ready") return false;

        // Oorspronkelijke positie vastleggen
        origin = cannonPivot.localToWorld(
            new THREE.Vector3(0, 0.4, -2.9)
        );

        // Oorspronkelijke richting vastleggen
        const rotation = new THREE.Quaternion();

        cannonPivot.getWorldQuaternion(rotation);

        direction.set(0, 0, -1);

        direction.applyQuaternion(rotation).normalize();

        // Speer klaarzetten
        travelled = 0;

        caughtFish = [];

        spear.position.copy(origin);

        spear.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, -1),
            direction
        );

        spear.visible = true;

        state = "outbound";

        onStatus("SPEER ONDERWEG");

        return true;
    }


    // ====================================
    // VIS RAKEN
    // ====================================

    function checkFishCollision() {

        const fish = fishSystem.checkHit(
            spear.position,
            SETTINGS.collisionRadius
        );

        if (!fish) return;

        // Voorkom dubbele vangsten
        if (fish.caught) return;

        const success = fishSystem.catchFish(fish);

        if (!success) return;

        caughtFish.push(fish);

onStatus(
    caughtFish.length + " VIS(SEN) AAN DE SPEER"
);


    }


    // ====================================
    // GEVANGEN VISSEN MEE LATEN BEWEGEN
    // ====================================

    function updateCaughtFish() {

        caughtFish.forEach((fish, index) => {

            // Iedere vis krijgt een eigen plekje
            const offset = new THREE.Vector3(
                0,
                0.35 + index * 0.25,
                0.15
            );

            fish.model.position.copy(
                spear.position.clone().add(offset)
            );

        });

    }


    // ====================================
    // TERUGHALEN
    // ====================================

    function retrieve() {

        // Alle gevangen vissen worden nu opgeteld
        for (const fish of caughtFish) {

            scene.remove(fish.model);

            onCatch(fish);

            // Nieuwe vis verschijnt later weer
            fishSystem.spawnFish();

        }

        caughtFish = [];

        spear.visible = false;

        travelled = 0;

        state = "ready";

        onStatus("KANON GEREED");

    }


    // ====================================
    // SPEER BEWEGEN
    // ====================================

    function update(delta) {

        if (state === "ready") return;

        const movement = SETTINGS.speed * delta;

        // --------------------------------
        // HEENWEG
        // --------------------------------

        if (state === "outbound") {

            travelled += movement;

            // Altijd dezelfde opgeslagen richting
            spear.position.copy(origin).addScaledVector(
                direction,
                travelled
            );

            // Controleren of de speer een vis raakt
            checkFishCollision();

            // Maximale afstand bereikt
            if (travelled >= SETTINGS.maxDistance) {

                travelled = SETTINGS.maxDistance;

                state = "returning";

                onStatus("SPEER KEERT TERUG");

            }

        }

        // --------------------------------
        // TERUGWEG
        // --------------------------------

        else if (state === "returning") {

            travelled -= movement;

            // Dezelfde baan, maar achteruit
            spear.position.copy(origin).addScaledVector(
                direction,
                travelled
            );

            // Ook op de terugweg vissen controleren
            checkFishCollision();

            // Speer is terug bij het kanon
            if (travelled <= 0) {

                retrieve();

                return;

            }

        }

        // Gevangen vissen blijven aan de speer hangen
        updateCaughtFish();

    }


    // ====================================
    // PUBLIEKE FUNCTIES
    // ====================================

    return {

        shoot,

        update,

        getState() {
            return state;
        },

        isReady() {
            return state === "ready";
        }

    };

}
