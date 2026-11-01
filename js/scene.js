 // ========================================
 // FISHIFT - SCENE
 // Suship-style first-person fishing view
 // ========================================

import * as THREE from "three";

export function createScene(container) {

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07152e);

    // CAMERA - VAST FIRST-PERSONPUNT
    const camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );

    camera.position.set(0, 2.5, 5.8);
    camera.lookAt(0, 2.35, -8);

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
            color: 0x59636e,
            roughness: 0.65,
            metalness: 0.55
        }),

        frame: new THREE.MeshStandardMaterial({
            color: 0x343b49,
            roughness: 0.8,
            metalness: 0.35
        }),

        darkMetal: new THREE.MeshStandardMaterial({
            color: 0x202b3a,
            roughness: 0.65,
            metalness: 0.5
        }),

        wall: new THREE.MeshStandardMaterial({
            color: 0x30323d,
            roughness: 0.95
        }),

        floor: new THREE.MeshStandardMaterial({
            color: 0x202b38,
            roughness: 0.9
        }),

        glass: new THREE.MeshBasicMaterial({
            color: 0x5c9acb,
            transparent: true,
            opacity: 0.035,
            depthWrite: false,
            side: THREE.DoubleSide
        }),

        ocean: new THREE.MeshBasicMaterial({
            color: 0x071b43,
            side: THREE.DoubleSide
        })
    };

    // LICHT
    scene.add(new THREE.AmbientLight(0x8ba9d4, 1.5));

    const roomLight = new THREE.DirectionalLight(0xffffff, 1.5);
    roomLight.position.set(0, 6, 5);
    scene.add(roomLight);

    const underwaterLight = new THREE.PointLight(0x174b91, 3, 35);
    underwaterLight.position.set(0, 2.5, -9);
    scene.add(underwaterLight);

    // HULPFUNCTIE
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
    makeBox(16, 0.3, 15, materials.floor, 0, -1.3, 0);
    makeBox(16, 0.3, 15, materials.wall, 0, 6.5, 0);

    makeBox(0.4, 8, 15, materials.wall, -8, 2.5, 0);
    makeBox(0.4, 8, 15, materials.wall, 8, 2.5, 0);

    makeBox(16, 8, 0.4, materials.wall, 0, 2.5, 7);

    // GROOT ONDERWATERVENSTER
    // Het raam vult bijna het hele camerabeeld.

    const windowZ = -5.5;
    const windowCenterY = 2.5;

    // Donkere rand rondom het raam
    makeBox(14.5, 0.55, 0.65, materials.frame,
        0, 6.05, windowZ);

    makeBox(14.5, 0.55, 0.65, materials.frame,
        0, -1.05, windowZ);

    makeBox(0.65, 7.1, 0.65, materials.frame,
        -6.95, windowCenterY, windowZ);

    makeBox(0.65, 7.1, 0.65, materials.frame,
        6.95, windowCenterY, windowZ);

    // Binnenrand voor een dikkere metalen uitstraling
    makeBox(13.3, 0.12, 0.35, materials.metal,
        0, 5.7, -5.85);

    makeBox(13.3, 0.12, 0.35, materials.metal,
        0, -0.7, -5.85);

    makeBox(0.12, 6.4, 0.35, materials.metal,
        -6.6, windowCenterY, -5.85);

    makeBox(0.12, 6.4, 0.35, materials.metal,
        6.6, windowCenterY, -5.85);

    // GLAS
    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(13.1, 6.2),
        materials.glass
    );

    glass.position.set(0, windowCenterY, -5.9);
    glass.renderOrder = 2;
    scene.add(glass);

    // DONKERE OCEAAN
    const ocean = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 25),
        materials.ocean
    );

    ocean.position.set(0, 2.5, -12);
    scene.add(ocean);

    // HARPOENLAUNCHER
    // De launcher draait, maar de camera niet.

    const cannonPivot = new THREE.Group();

    cannonPivot.position.set(0, 1.35, 3.2);
    scene.add(cannonPivot);

    // ONDERSTEL
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.8, 0.3, 12),
        materials.darkMetal
    );

    base.position.y = 0.15;
    cannonPivot.add(base);

    // DRAAIEND KANON
    const cannon = new THREE.Group();
    cannon.position.y = 0.35;
    cannonPivot.add(cannon);

    // KANONLICHAAM
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.55, 1.1),
        materials.metal
    );

    body.position.z = -0.25;
    cannon.add(body);

    // KANONBUIS
    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.19, 2.4, 12),
        materials.darkMetal
    );

    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, -1.55);
    cannon.add(barrel);

    // MONDING
    const muzzle = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.045, 8, 16),
        materials.metal
    );

    muzzle.position.set(0, 0.05, -2.75);
    cannon.add(muzzle);

    // CAMERA BLIJFT VAST STAAN
    // Niet toevoegen aan cannonPivot!

    // TERUGGEVEN
    return {
        scene,
        camera,
        renderer,
        cannonPivot
    };
}
