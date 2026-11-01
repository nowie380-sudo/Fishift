```javascript
// ========================================
// FISHIFT - MAIN
// Hoofdscript van de game
// ========================================

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
// 3D WERELD MAKEN
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
    cannonPivot
} = world;


// ========================================
// VISSEN MAKEN
// ========================================

const fishSystem = createFishSystem(scene);


// ========================================
// HARPOEN MAKEN
// ========================================

const harpoon = createHarpoon({
    scene,
    cannonPivot,
    fishSystem,

    onCatch: (fish) => {
        game.catches++;

        ui.setCount(game.catches);

        ui.setMessage(
            `+1 ${fish.name}`
        );
    },

    onStatus: (status) => {
        ui.setStatus(status);
    }
});


// ========================================
// BESTURING
// ========================================

const controls = createControls({
    cannonPivot,
    harpoon
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

    // Vissen laten zwemmen
    fishSystem.update(delta);

    // Speer bewegen en botsingen controleren
    harpoon.update(delta);

    // 3D-beeld tekenen
    renderer.render(scene, camera);
}


// ========================================
// SCHERM AANPASSEN
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

ui.setStatus("KANON GEREED");
ui.setMessage("Richt met A en D — klik om te schieten");

requestAnimationFrame(animate);

console.log("FISHIFT gestart!");
```
