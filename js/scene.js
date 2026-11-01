```javascript
// ========================================
// FISHIFT - SCENE
// 3D-wereld, boot en camera
// ========================================

import * as THREE from "three";

export function createScene(container) {

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08749a);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );

    camera.position.set(0, 1.8, 6);
    camera.lookAt(0, 1.9, -5);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "low-power"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // MATERIALEN
    const materials = {

        metal: new THREE.MeshStandardMaterial({
            color: 0x879ba3,
            roughness: 0.55,
            metalness: 0.45
        }),

        darkMetal: new THREE.MeshStandardMaterial({
            color: 0x344b55,
            roughness: 0.7,
            metalness: 0.4
        }),

        wall: new THREE.MeshStandardMaterial({
            color: 0x536a73,
            roughness: 0.9
        }),

        floor: new THREE.MeshStandardMaterial({
            color: 0x34464d,
            roughness: 0.9
        }),

        glass: new THREE.MeshBasicMaterial({
            color: 0x75d9ff,
            transparent: true,
            opacity: 0.08,
            depthWrite: false,
            side: THREE.DoubleSide
        }),

        ocean: new THREE.MeshBasicMaterial({
            color: 0x087da8,
            side: THREE.DoubleSide
        })
    };

    // LICHT
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const roomLight = new THREE.DirectionalLight(0xffffff, 2);
    roomLight.position.set(0, 6, 5);
    scene.add(roomLight);

    const windowLight = new THREE.PointLight(0x36bfff, 3, 20);
    windowLight.position.set(0, 2, -5);
    scene.add(windowLight);

    // HULPFUNCTIE VOOR BLOKKEN
    function makeBox(width, height, depth, material, x, y, z) {

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            material
        );

        mesh.position.set(x, y, z);
        scene.add(mesh);

        return mesh;
    }

    // BOOTINTERIEUR

    // Vloer
    makeBox(14, 0.3, 15, materials.floor, 0, -0.15, 0);

    // Plafond
    makeBox(14, 0.3, 15, materials.wall, 0, 5, 0);

    // Zijwanden
    makeBox(0.3, 5, 15, materials.wall, -7, 2.5, 0);
    makeBox(0.3, 5, 15, materials.wall, 7, 2.5, 0);

    // Achterwand
    makeBox(14, 5, 0.3, materials.wall, 0, 2.5, 7);

    // ONDERWATERVENSTER

    // Achtergrond van de oceaan
    const ocean = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 20),
        materials.ocean
    );

    ocean.position.set(0, 2.3, -11);
    scene.add(ocean);

    // BELANGRIJK:
    // Geen massief blok meer achter het raam!
    // Alleen vier metalen randen.

    // Bovenrand
    makeBox(10.5, 0.22, 0.35, materials.metal, 0, 4.45, -6.7);

    // Onderrand
    makeBox(10.5, 0.22, 0.35, materials.metal, 0, 0.25, -6.7);

    // Linkerrand
    makeBox(0.22, 4.2, 0.35, materials.metal, -5.25, 2.35, -6.7);

    // Rechterrand
    makeBox(0.22, 4.2, 0.35, materials.metal, 5.25, 2.35, -6.7);

    // Dunne glazen laag
    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(9.9, 3.9),
        materials.glass
    );

    glass.position.set(0, 2.35, -6.85);
    glass.renderOrder = 2;
    scene.add(glass);

    // HARPOENKANON

    const cannonPivot = new THREE.Group();

    cannonPivot.position.set(0, 1.35, 3.2);
    scene.add(cannonPivot);

    // Onderstel
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.8, 0.3, 12),
        materials.darkMetal
    );

    base.position.y = 0.15;
    cannonPivot.add(base);

    // Draaiend kanon
    const cannon = new THREE.Group();
    cannon.position.y = 0.35;
    cannonPivot.add(cannon);

    // Kanonlichaam
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.55, 1.1),
        materials.metal
    );

    body.position.z = -0.25;
    cannon.add(body);

    // Kanonbuis
    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.19, 2.4, 12),
        materials.darkMetal
    );

    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, -1.55);
    cannon.add(barrel);

    // Monding
    const muzzle = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.045, 8, 16),
        materials.metal
    );

    muzzle.position.set(0, 0.05, -2.75);
    cannon.add(muzzle);

    // TERUGGEVEN
    return {
        scene,
        camera,
        renderer,
        cannonPivot
    };
}
```
