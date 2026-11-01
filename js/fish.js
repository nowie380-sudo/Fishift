// ========================================
// FISHIFT - FISH SYSTEM
// Zwemmende vissen en botsingsdetectie
// ========================================

import * as THREE from "three";

export function createFishSystem(scene) {

    const fishes = [];

    // ====================================
    // VISSOORTEN
    // ====================================

    const fishTypes = [
        {
            name: "Makreel",
            color: 0x668fa5,
            size: 0.65,
            speed: 1.5,
            rarity: 1
        },
        {
            name: "Tonijn",
            color: 0x426b91,
            size: 0.95,
            speed: 2.1,
            rarity: 2
        },
        {
            name: "Clownvis",
            color: 0xf18a38,
            size: 0.48,
            speed: 1.2,
            rarity: 2
        },
        {
            name: "Zwaardvis",
            color: 0x7898a9,
            size: 1.15,
            speed: 2.7,
            rarity: 3
        }
    ];

    // ====================================
    // MATERIALEN
    // ====================================

    function createMaterial(color) {

        return new THREE.MeshStandardMaterial({
            color,
            roughness: 0.55,
            metalness: 0.05
        });

    }

    // ====================================
    // VIS MODEL MAKEN
    // ====================================

    function createFishModel(type) {

        const fish = new THREE.Group();

        const material = createMaterial(type.color);

        // Lichaam
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(
                type.size,
                12,
                8
            ),
            material
        );

        body.scale.set(1.5, 0.65, 0.65);

        fish.add(body);

        // Staart
        const tail = new THREE.Mesh(
            new THREE.ConeGeometry(
                type.size * 0.55,
                type.size * 0.9,
                4
            ),
            material
        );

        tail.rotation.z = -Math.PI / 2;
        tail.position.x = -type.size * 1.45;

        fish.add(tail);

        // Bovenste vin
        const fin = new THREE.Mesh(
            new THREE.ConeGeometry(
                type.size * 0.3,
                type.size * 0.65,
                4
            ),
            material
        );

        fin.position.y = type.size * 0.55;
        fin.rotation.z = Math.PI;

        fish.add(fin);

        // Oog
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0x05090d
        });

        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(
                Math.max(0.035, type.size * 0.09),
                8,
                6
            ),
            eyeMaterial
        );

        eye.position.set(
            type.size * 0.8,
            type.size * 0.1,
            type.size * 0.45
        );

        fish.add(eye);

        return {
            model: fish,
            tail,
            type
        };

    }

    // ====================================
    // NIEUWE VIS SPAWNEN
    // ====================================

    function spawnFish() {

        const type = fishTypes[
            Math.floor(Math.random() * fishTypes.length)
        ];

        const fishData = createFishModel(type);

        const direction = Math.random() < 0.5 ? 1 : -1;

        // Verschillende dieptes:
        // dichtbij, midden en ver weg.
        const depthOptions = [
            -7.8,
            -9.2,
            -10.8
        ];

        const depth =
            depthOptions[
                Math.floor(Math.random() * depthOptions.length)
            ];

        const fish = {
            model: fishData.model,
            tail: fishData.tail,
            name: type.name,

            x: direction === 1 ? -7 : 7,

            y: 0.8 + Math.random() * 3.0,

            z: depth,

            direction,

            speed: type.speed *
                (0.75 + Math.random() * 0.6),

            size: type.size,

            caught: false,

            animation: Math.random() * Math.PI * 2,

            type
        };

        fish.model.position.set(
            fish.x,
            fish.y,
            fish.z
        );

        if (direction === -1) {
            fish.model.rotation.y = Math.PI;
        }

        scene.add(fish.model);

        fishes.push(fish);

    }

    // ====================================
    // EERSTE VISSEN
    // ====================================

    for (let i = 0; i < 9; i++) {

        spawnFish();

        const fish = fishes[i];

        // Verspreid de vissen over het raam
        fish.x = -6 + Math.random() * 12;

        fish.y = 0.7 + Math.random() * 3.1;

        fish.model.position.set(
            fish.x,
            fish.y,
            fish.z
        );

    }

    // ====================================
    // VISSEN BIJWERKEN
    // ====================================

    function update(delta) {

        for (let i = fishes.length - 1; i >= 0; i--) {

            const fish = fishes[i];

            if (fish.caught) continue;

            // Horizontale beweging
            fish.x +=
                fish.speed *
                fish.direction *
                delta;

            // Zwemanimatie
            fish.animation += delta * 5;

            fish.tail.rotation.y =
                Math.sin(fish.animation) * 0.35;

            fish.model.position.set(
                fish.x,
                fish.y + Math.sin(fish.animation * 0.5) * 0.04,
                fish.z
            );

            // Vis is buiten het raam
            if (
                fish.x > 8 ||
                fish.x < -8
            ) {

                scene.remove(fish.model);

                fishes.splice(i, 1);

                spawnFish();

            }

        }

    }

    // ====================================
    // BOTSINGSCONTROLE
    // ====================================

    function checkHit(position, radius = 0.55) {

        for (const fish of fishes) {

            if (fish.caught) continue;

            const fishPosition = fish.model.position;

            const distance = position.distanceTo(
                fishPosition
            );

            const hitRadius = fish.size * 1.25 + radius;

            if (distance < hitRadius) {

                return fish;

            }

        }

        return null;

    }

    // ====================================
    // VIS VANGEN
    // ====================================

    function catchFish(fish) {

        if (!fish || fish.caught) return false;

        fish.caught = true;

        return true;

    }

    // ====================================
    // PUBLIEKE FUNCTIES
    // ====================================

    return {

        update,

        spawnFish,

        checkHit,

        catchFish,

        getFishes() {
            return fishes;
        }

    };

}
