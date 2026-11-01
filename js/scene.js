
import * as THREE from "three";

export function createScene(container) {

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07152e);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );

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
            color: 0x697783,
            roughness: 0.65,
            metalness: 0.55
        }),

        darkMetal: new THREE.MeshStandardMaterial({
            color: 0x202b3a,
            roughness: 0.65,
            metalness: 0.5
        }),

        wall: new THREE.MeshStandardMaterial({
            color: 0x303b49,
            roughness: 0.95
        }),

        floor: new THREE.MeshStandardMaterial({
            color: 0x292f3a,
            roughness: 0.9
        }),

        glass: new THREE.MeshBasicMaterial({
            color: 0x3979ad,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide
        }),

        ocean: new THREE.MeshBasicMaterial({
            color: 0x071b43,
            side: THREE.DoubleSide
        }),

        pan: new THREE.MeshStandardMaterial({
            color: 0x777d86,
            roughness: 0.55,
            metalness: 0.45
        })
    };

    // LICHT
    scene.add(new THREE.AmbientLight(0x8ba9d4, 1.6));

    const mainLight = new THREE.PointLight(0xffffff, 35, 30);
    mainLight.position.set(0, 4, 0);
    scene.add(mainLight);

    const batteryLight = new THREE.PointLight(0x55aaff, 12, 12);
    batteryLight.position.set(-4, 3, -11);
    scene.add(batteryLight);

    const emptyRoomLight = new THREE.PointLight(0x55aaff, 12, 12);
    emptyRoomLight.position.set(4, 3, -11);
    scene.add(emptyRoomLight);

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

    // ========================================
    // CENTRALE KAMER
    // ========================================

    const roomWidth = 18;
    const roomDepth = 14;
    const wallHeight = 5;
    const wallThickness = 0.4;

    // Vloer en plafond
    makeBox(roomWidth, 0.3, roomDepth, materials.floor, 0, -0.15, 0);
    makeBox(roomWidth, 0.3, roomDepth, materials.wall, 0, wallHeight, 0);

    // Lange zijwanden
    makeBox(wallThickness, wallHeight, roomDepth,
        materials.wall, -9, 2.5, 0);

    makeBox(wallThickness, wallHeight, roomDepth,
        materials.wall, 9, 2.5, 0);

    // Achterwand met twee doorgangen naar de kleine kamers
    makeBox(4, wallHeight, wallThickness,
        materials.wall, -7, 2.5, -7);

    makeBox(4, wallHeight, wallThickness,
        materials.wall, 7, 2.5, -7);

    makeBox(2, wallHeight, wallThickness,
        materials.wall, 0, 2.5, -7);

    // Voorwand
    makeBox(roomWidth, wallHeight, wallThickness,
        materials.wall, 0, 2.5, 7);

    // Vloerstrepen
    for (let x = -8; x <= 8; x += 2) {
        makeBox(0.035, 0.02, 13,
            materials.metal, x, 0.02, 0);
    }

    // ========================================
    // BATTERIJKAMER
    // ========================================

    function createSmallRoom(centerX, centerZ) {

        const width = 7;
        const depth = 5;

        makeBox(width, 0.3, depth,
            materials.floor, centerX, -0.15, centerZ);

        makeBox(width, 0.3, depth,
            materials.wall, centerX, 5, centerZ);

        // Zijwanden
        makeBox(0.3, 5, depth,
            materials.wall, centerX - width / 2, 2.5, centerZ);

        makeBox(0.3, 5, depth,
            materials.wall, centerX + width / 2, 2.5, centerZ);

        // Achterwand
        makeBox(width, 5, 0.3,
            materials.wall, centerX, 2.5, centerZ - depth / 2);
    }

    // Batterijkamer links
    createSmallRoom(-4.5, -10.5);

    // Lege kamer rechts
    createSmallRoom(4.5, -10.5);

    // ========================================
    // BATTERIJEN (VOORLOPIGE MODELLEN)
    // ========================================

    const battery = new THREE.Group();
    battery.position.set(-4.5, 0, -10.5);
    scene.add(battery);

    const batteryBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2, 0.7),
        materials.darkMetal
    );

    batteryBox.position.y = 1;
    battery.add(batteryBox);

    const batteryScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.45, 0.05),
        new THREE.MeshBasicMaterial({ color: 0x24bbff })
    );

    batteryScreen.position.set(0, 1.35, 0.38);
    battery.add(batteryScreen);

    // ========================================
    // VISVERWERKINGSPAN
    // ========================================

    const panGroup = new THREE.Group();
    panGroup.position.set(0, 0, 0);
    scene.add(panGroup);

    // Buitenwand van de ronde pan
    const pan = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 2.1, 0.8, 48),
        materials.pan
    );

    pan.position.y = 0.4;
    panGroup.add(pan);

    // Donkere binnenkant
    const panInside = new THREE.Mesh(
        new THREE.CylinderGeometry(1.75, 1.75, 0.08, 48),
        materials.darkMetal
    );

    panInside.position.y = 0.82;
    panGroup.add(panInside);

    // Bovenste rand
    const panRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.95, 0.13, 12, 48),
        materials.metal
    );

    panRim.rotation.x = Math.PI / 2;
    panRim.position.y = 0.84;
    panGroup.add(panRim);

    // ========================================
    // HARPOENSTATIONS
    // ========================================

    function createHarpoonStation(x, z, rotationY) {

        const pivot = new THREE.Group();
        pivot.position.set(x, 1.2, z);
        pivot.rotation.y = rotationY;
        scene.add(pivot);

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.7, 0.3, 12),
            materials.darkMetal
        );

        base.position.y = -0.9;
        pivot.add(base);

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.5, 0.9),
            materials.metal
        );

        body.position.set(0, -0.45, -0.2);
        pivot.add(body);

        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.19, 2.2, 12),
            materials.darkMetal
        );

        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, -0.4, -1.25);
        pivot.add(barrel);

        const muzzle = new THREE.Mesh(
            new THREE.TorusGeometry(0.15, 0.045, 8, 16),
            materials.metal
        );

        muzzle.position.set(0, -0.4, -2.35);
        pivot.add(muzzle);

        return pivot;
    }

    // Twee harpoenen aan de linker lange zijde
    const cannonPivot = createHarpoonStation(-7.8, -3.2, Math.PI / 2);
    createHarpoonStation(-7.8, 3.2, Math.PI / 2);

    // Twee harpoenen aan de rechter lange zijde
    createHarpoonStation(7.8, -3.2, -Math.PI / 2);
    createHarpoonStation(7.8, 3.2, -Math.PI / 2);

    // ========================================
    // RONDE KIJKVENSTERS BIJ DE HARPOENEN
    // ========================================

    function createPorthole(x, y, z, rotationY) {

        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.rotation.y = rotationY;
        scene.add(group);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.85, 0.13, 10, 32),
            materials.metal
        );

        group.add(ring);

        const glass = new THREE.Mesh(
            new THREE.CircleGeometry(0.75, 32),
            materials.glass
        );

        glass.position.z = -0.03;
        group.add(glass);
    }

    for (const z of [-3.2, 3.2]) {
        createPorthole(-8.76, 2.8, z, Math.PI / 2);
        createPorthole(8.76, 2.8, z, -Math.PI / 2);
    }

    // ========================================
    // OCEAAN BUITEN DE KIJKVENSTERS
    // ========================================

    const ocean = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 30),
        materials.ocean
    );

    ocean.position.set(0, 2.5, -18);
    scene.add(ocean);

    // ========================================
    // SPELERPOSITIES
    // ========================================

    const playerStart = new THREE.Vector3(0, 1.7, 5.2);

    // Eerste harpoenstation is voorlopig het actieve station
    const harpoonSeatPosition = new THREE.Vector3(-5.7, 1.7, -3.2);

    camera.position.copy(playerStart);
    camera.lookAt(0, 1.7, -5);

    return {
        scene,
        camera,
        renderer,
        cannonPivot,
        playerStart,
        harpoonSeatPosition
    };
}
