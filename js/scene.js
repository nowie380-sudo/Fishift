```javascript
// ========================================
// FISHIFT - SCENE
// 3D-wereld, boot en camera
// ========================================

import * as THREE from "three";

export function createScene(container) {

    // ====================================
    // SCENE
    // ====================================

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x061722);

    // ====================================
    // CAMERA
    // ====================================

    const camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );

    // Vaste positie achter het kanon
    camera.position.set(0, 1.65, 6);

    camera.lookAt(0, 1.5, -5);

    // ====================================
    // RENDERER
    // ====================================

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "low-power"
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.5)
    );

    renderer.shadowMap.enabled = false;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // ====================================
    // MATERIALEN
    // ====================================

    const materials = {

        metal: new THREE.MeshStandardMaterial({
            color: 0x35444a,
            roughness: 0.65,
            metalness: 0.75
        }),

        darkMetal: new THREE.MeshStandardMaterial({
            color: 0x17262c,
            roughness: 0.8,
            metalness: 0.6
        }),

        wall: new THREE.MeshStandardMaterial({
            color: 0x26343a,
            roughness: 0.9
        }),

        floor: new THREE.MeshStandardMaterial({
            color: 0x18262c,
            roughness: 0.95
        }),

        glass: new THREE.MeshStandardMaterial({
            color: 0x12516b,
            roughness: 0.15,
            metalness: 0.2,
            transparent: true,
            opacity: 0.22
        }),

        ocean: new THREE.MeshBasicMaterial({
            color: 0x063b58,
            side: THREE.DoubleSide
        })
    };

    // ====================================
    // LICHT
    // ====================================

    const ambientLight = new THREE.AmbientLight(
        0x9ac9df,
        1.1
    );

    scene.add(ambientLight);

    const roomLight = new THREE.PointLight(
        0xe3f4ff,
        2,
        15
    );

    roomLight.position.set(0, 3.5, 3);
    scene.add(roomLight);

    const windowLight = new THREE.PointLight(
        0x1689b8,
        2,
        12
    );

    windowLight.position.set(0, 1.5, -2);
    scene.add(windowLight);

    // ====================================
    // HULPFUNCTIE VOOR BLOKKEN
    // ====================================

    function makeBox(
        width,
        height,
        depth,
        material,
        x,
        y,
        z
    ) {

        const geometry = new THREE.BoxGeometry(
            width,
            height,
            depth
        );

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);

        scene.add(mesh);

        return mesh;
    }

    // ====================================
    // BOOTINTERIEUR
    // ====================================

    // Vloer
    makeBox(
        14, 0.3, 15,
        materials.floor,
        0, -0.15, 0
    );

    // Plafond
    makeBox(
        14, 0.3, 15,
        materials.wall,
        0, 5, 0
    );

    // Linkerwand
    makeBox(
        0.3, 5, 15,
        materials.wall,
        -7, 2.5, 0
    );

    // Rechterwand
    makeBox(
        0.3, 5, 15,
        materials.wall,
        7, 2.5, 0
    );

    // Achterwand
    makeBox(
        14, 5, 0.3,
        materials.wall,
        0, 2.5, 7
    );

    // ====================================
    // ONDERWATERVENSTER
    // ====================================

    // Donker raamkozijn
    makeBox(
        10.5, 4.1, 0.5,
        materials.darkMetal,
        0, 2.35, -7.2
    );

    // Opening wordt visueel gevuld met glas
    makeBox(
        9.8, 3.4, 0.12,
        materials.glass,
        0, 2.35, -6.91
    );

    // Blauwe oceaan achter het raam
    const ocean = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 20),
        materials.ocean
    );

    ocean.position.set(0, 2.3, -11);
    scene.add(ocean);

    // Raamranden
    makeBox(
        10.5, 0.18, 0.35,
        materials.metal,
        0, 4.45, -6.7
    );

    makeBox(
        10.5, 0.18, 0.35,
        materials.metal,
        0, 0.25, -6.7
    );

    makeBox(
        0.18, 4.2, 0.35,
        materials.metal,
        -5.25, 2.35, -6.7
    );

    makeBox(
        0.18, 4.2, 0.35,
        materials.metal,
        5.25, 2.35, -6.7
    );

    // ====================================
    // HARPOENKANON
    // ====================================

    const cannonPivot = new THREE.Group();

    cannonPivot.position.set(
        0,
        1.35,
        3.2
    );

    scene.add(cannonPivot);

    // Onderstel
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.65,
            0.8,
            0.3,
            12
        ),
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
        new THREE.BoxGeometry(
            0.65,
            0.55,
            1.1
        ),
        materials.metal
    );

    body.position.z = -0.25;

    cannon.add(body);

    // Kanonbuis
    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.13,
            0.19,
            2.4,
            12
        ),
        materials.darkMetal
    );

    barrel.rotation.x = Math.PI / 2;

    barrel.position.set(
        0,
        0.05,
        -1.55
    );

    cannon.add(barrel);

    // Monding
    const muzzle = new THREE.Mesh(
        new THREE.TorusGeometry(
            0.15,
            0.045,
            8,
            16
        ),
        materials.metal
    );

    muzzle.position.set(
        0,
        0.05,
        -2.75
    );

    cannon.add(muzzle);

    // ====================================
    // EXTRA INTERIEURDETAILS
    // ====================================

    // Kleine metalen balken naast het raam
    for (let i = -1; i <= 1; i++) {

        makeBox(
            0.08,
            3.8,
            0.12,
            materials.metal,
            i * 3.3,
            2.35,
            -6.55
        );
    }

    // ====================================
    // TERUGGEVEN
    // ====================================

    return {
        scene,
        camera,
        renderer,
        cannonPivot
    };
}
```
