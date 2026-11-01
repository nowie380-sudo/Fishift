
import * as THREE from "three";

import { createScene } from "./scene.js";
import { createFishSystem } from "./fish.js";
import { createHarpoon } from "./harpoon.js";
import { createControls } from "./controls.js";
import { createUI } from "./ui.js";

// ========================================
// GAME STATUS
// ========================================

const game = {
    running: true,
    catches: 0,
    lastTime: 0
};

// ========================================
// HTML ELEMENTEN
// ========================================

const gameElement = document.getElementById("game");
const ui = createUI();

// ========================================
// 3D WERELD
// ========================================

let world;

try {
    world = createScene(gameElement);
} catch (error) {
    console.error("Fishift kon niet starten:", error);
    ui.showError("De 3D-wereld kon niet worden geladen.");
    throw error;
}

const {
    scene,
    camera,
    renderer,
    cannonPivots,
    playerStart,
    harpoonSeatPositions
} = world;

// ========================================
// VISSEN
// ========================================

const fishSystem = createFishSystem(scene);

// ========================================
// VIER HARPOENEN
// ========================================

const harpoons = [];

for (let i = 0; i < cannonPivots.length; i++) {

    const harpoon = createHarpoon({

        scene,

        cannonPivot: cannonPivots[i],

        fishSystem,

        onCatch: (fish) => {

            game.catches++;

            ui.setCount(game.catches);

            ui.setMessage("+1 " + fish.name);
        },

        onStatus: (status) => {
            ui.setStatus(status);
        }
    });

    harpoons.push(harpoon);
}

// ========================================
// BESTURING
// ========================================

const controls = createControls({

    camera,
    cannonPivots,
    harpoons,

    playerStart,
    harpoonSeatPositions,

    ui
});

// ========================================
// GAME LOOP
// ========================================

function animate(currentTime) {

    if (!game.running) return;

    requestAnimationFrame(animate);

    const delta = Math.min(
        (currentTime - game.lastTime) / 1000 || 0,
        0.05
    );

    game.lastTime = currentTime;

    controls.update(delta);

    fishSystem.update(delta);

    for (const harpoon of harpoons) {
        harpoon.update(delta);
    }

    renderer.render(scene, camera);
}

// ========================================
// SCHERMAANPASSING
// ========================================

function resizeGame() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

window.addEventListener("resize", resizeGame);

// ========================================
// GAME STARTEN
// ========================================

ui.setStatus("ONDERZEEËR GEREED");
ui.setMessage("WASD om te lopen — E bij een harpoen");

requestAnimationFrame(animate);

console.log("FISHIFT gestart met vier harpoenen!");
