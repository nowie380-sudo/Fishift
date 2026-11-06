
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function createHarpoon({
    scene,
    cannonPivot,
    fishSystem,
    onCatch,
    onStatus
}) {
    const SETTINGS = {
        speed: 20,
        maxDistance: 12,
        collisionRadius: 0.55,
        ropeRadius: 0.018,
        muzzleOffset: new THREE.Vector3(0, 0.4, -2.9),
        tipScale: 1
    };

    // ====================================
    // HARPOENPUNT
    // ====================================

    const loader = new GLTFLoader();

    const spear = new THREE.Group();
    spear.visible = false;
    scene.add(spear);

    let tipLoaded = false;

    loader.load(
        "./assets/models/harpoon_tip.glb",
        (gltf) => {
            const tipModel = gltf.scene;

            tipModel.scale.setScalar(SETTINGS.tipScale);

            tipModel.traverse((object) => {
                if (object.isMesh) {
                    object.castShadow = false;
                    object.receiveShadow = false;
                }
            });

            spear.add(tipModel);
            tipLoaded = true;

            // Zet de harpoenpunt meteen in de loop.
            updateReadyPosition();
            spear.visible = true;

            console.log("Harpoon tip geladen!");
            onStatus("KANON GEREED");
        },
        undefined,
        (error) => {
            console.error("Harpoon tip kon niet geladen worden:", error);
            onStatus("FOUT: HARPOENPUNT NIET GELADEN");
        }
    );

    // ====================================
    // POSITIE ALS DE HARPOEN GEREED IS
    // ====================================

    function updateReadyPosition() {
        const muzzle = cannonPivot.localToWorld(
            SETTINGS.muzzleOffset.clone()
        );

        spear.position.copy(muzzle);
        cannonPivot.getWorldQuaternion(spear.quaternion);
    }

    // ====================================
    // TOUW
    // ====================================

    const ropeGeometry = new THREE.CylinderGeometry(
        SETTINGS.ropeRadius,
        SETTINGS.ropeRadius,
        1,
        8
    );

    const ropeMaterial = new THREE.MeshStandardMaterial({
        color: 0x333c42,
        roughness: 0.85,
        metalness: 0.15
    });

    const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
    rope.visible = false;
    scene.add(rope);

    const ropeDirection = new THREE.Vector3();
    const ropeMidpoint = new THREE.Vector3();
    const worldUp = new THREE.Vector3(0, 1, 0);

    function updateRope() {
        const start = cannonPivot.localToWorld(
            SETTINGS.muzzleOffset.clone()
        );

        const end = spear.position;

        ropeDirection.subVectors(end, start);

        const distance = ropeDirection.length();

        if (distance < 0.01) {
            rope.visible = false;
            return;
        }

        rope.visible = true;

        ropeMidpoint.copy(start).add(end).multiplyScalar(0.5);
        rope.position.copy(ropeMidpoint);

        rope.quaternion.setFromUnitVectors(
            worldUp,
            ropeDirection.normalize()
        );

        rope.scale.set(1, distance, 1);
    }

    // ====================================
    // STATUS
    // ====================================

    let state = "ready";

    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3();

    let travelled = 0;
    let caughtFish = [];

    // ====================================
    // SCHIETEN
    // ====================================

    function shoot() {
        if (state !== "ready" || !tipLoaded) {
            return false;
        }

        origin.copy(
            cannonPivot.localToWorld(
                SETTINGS.muzzleOffset.clone()
            )
        );

        const rotation = new THREE.Quaternion();

        cannonPivot.getWorldQuaternion(rotation);

        direction.set(0, 0, -1);
        direction.applyQuaternion(rotation).normalize();

        travelled = 0;
        caughtFish = [];

        spear.position.copy(origin);

        spear.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, -1),
            direction
        );

        spear.visible = true;
        rope.visible = false;

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

        if (!fish || fish.caught) return;

        const success = fishSystem.catchFish(fish);

        if (!success) return;

        caughtFish.push(fish);

        onStatus(
            caughtFish.length + " VIS(SEN) AAN DE SPEER"
        );
    }

    // ====================================
    // GEVANGEN VISSEN BEWEGEN
    // ====================================

    function updateCaughtFish() {
        caughtFish.forEach((fish, index) => {
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
        for (const fish of caughtFish) {
            scene.remove(fish.model);

            onCatch(fish);
            fishSystem.spawnFish();
        }

        caughtFish = [];

        rope.visible = false;
        travelled = 0;
        state = "ready";

        updateReadyPosition();
        spear.visible = true;

        onStatus("KANON GEREED");
    }

    // ====================================
    // UPDATE
    // ====================================

    function update(delta) {
        if (state === "ready") {
            if (tipLoaded) {
                updateReadyPosition();
            }

            return;
        }

        const movement = SETTINGS.speed * delta;

        if (state === "outbound") {
            travelled += movement;

            spear.position.copy(origin).addScaledVector(
                direction,
                travelled
            );

            checkFishCollision();

            if (travelled >= SETTINGS.maxDistance) {
                travelled = SETTINGS.maxDistance;
                state = "returning";

                onStatus("SPEER KEERT TERUG");
            }
        }

        else if (state === "returning") {
            travelled -= movement;

            spear.position.copy(origin).addScaledVector(
                direction,
                travelled
            );

            checkFishCollision();

            if (travelled <= 0) {
                retrieve();
                return;
            }
        }

        updateCaughtFish();
        updateRope();
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
            return state === "ready" && tipLoaded;
        }
    };
}
