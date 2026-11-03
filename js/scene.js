
import * as THREE from "three";

export function createScene(container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x061326);
    scene.fog = new THREE.Fog(0x061326, 30, 75);

    const camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 200
    );

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
    const mat = {
        wall: new THREE.MeshStandardMaterial({ color: 0x293b4b, roughness: 0.78, metalness: 0.65 }),
        wallDark: new THREE.MeshStandardMaterial({ color: 0x192a38, roughness: 0.8, metalness: 0.65 }),
        panel: new THREE.MeshStandardMaterial({ color: 0x405465, roughness: 0.65, metalness: 0.7 }),
        panelLight: new THREE.MeshStandardMaterial({ color: 0x607786, roughness: 0.5, metalness: 0.75 }),
        floor: new THREE.MeshStandardMaterial({ color: 0x26333e, roughness: 0.85, metalness: 0.55 }),
        metal: new THREE.MeshStandardMaterial({ color: 0x9aabb5, roughness: 0.4, metalness: 0.85 }),
        darkMetal: new THREE.MeshStandardMaterial({ color: 0x101d28, roughness: 0.55, metalness: 0.8 }),
        rubber: new THREE.MeshStandardMaterial({ color: 0x111820, roughness: 0.95 }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xe2aa32, roughness: 0.6, metalness: 0.45 }),
        copper: new THREE.MeshStandardMaterial({ color: 0x9b633c, roughness: 0.5, metalness: 0.75 }),
        battery: new THREE.MeshStandardMaterial({ color: 0x263f4b, roughness: 0.55, metalness: 0.7 }),
        glass: new THREE.MeshBasicMaterial({ color: 0x247db8, transparent: true, opacity: 0.17, side: THREE.DoubleSide, depthWrite: false }),
        blue: new THREE.MeshBasicMaterial({ color: 0x168dff }),
        cyan: new THREE.MeshBasicMaterial({ color: 0x53eaff }),
        green: new THREE.MeshBasicMaterial({ color: 0x49ed9a }),
        red: new THREE.MeshBasicMaterial({ color: 0xff3939 }),
        ocean: new THREE.MeshBasicMaterial({ color: 0x031b3c, side: THREE.DoubleSide }),
        pan: new THREE.MeshStandardMaterial({ color: 0x778792, roughness: 0.45, metalness: 0.85 })
    };

    // VERLICHTING
    scene.add(new THREE.AmbientLight(0x91b5dc, 1.25));

    function pointLight(color, intensity, distance, x, y, z) {
        const light = new THREE.PointLight(color, intensity, distance);
        light.position.set(x, y, z);
        scene.add(light);
    }

    pointLight(0x65aaff, 27, 30, 0, 4, 0);
    pointLight(0x238cff, 15, 19, -5, 3, 2);
    pointLight(0x238cff, 15, 19, 5, 3, 2);
    pointLight(0x238cff, 13, 17, -4.5, 3, -10);
    pointLight(0x238cff, 13, 17, 4.5, 3, -10);

    // HULPFUNCTIES
    function box(parent, w, h, d, material, x, y, z) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d), material
        );
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
    }

    function cylinder(parent, rt, rb, h, material, x, y, z, sides = 12) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(rt, rb, h, sides), material
        );
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
    }

    function pipe(parent, a, b, radius, material) {
        const direction = new THREE.Vector3().subVectors(b, a);
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, direction.length(), 8),
            material
        );
        mesh.position.copy(a).add(b).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0), direction.normalize()
        );
        parent.add(mesh);
        return mesh;
    }

    function strip(parent, w, h, d, x, y, z, material = mat.blue) {
        return box(parent, w, h, d, material, x, y, z);
    }

    function bolt(parent, x, y, z, rotation = 0) {
        const b = cylinder(parent, 0.045, 0.045, 0.035, mat.darkMetal, x, y, z, 8);
        b.rotation.x = Math.PI / 2;
        b.rotation.z = rotation;
        return b;
    }

    function panel(parent, x, y, z, w, h, d, light = false) {
        box(parent, w, h, d, light ? mat.panelLight : mat.panel, x, y, z);
        box(parent, 0.045, h, d + 0.035, mat.metal, x - w / 2, y, z);
        box(parent, 0.045, h, d + 0.035, mat.darkMetal, x + w / 2, y, z);
    }

    // CENTRALE KAMER
    const ROOM_W = 18;
    const ROOM_D = 14;
    const WALL_H = 5;
    const WT = 0.4;

    box(scene, ROOM_W, 0.3, ROOM_D, mat.floor, 0, -0.15, 0);
    box(scene, ROOM_W, 0.3, ROOM_D, mat.wallDark, 0, 5, 0);

    // Achterwand met twee deuropeningen
    box(scene, 4, 5, WT, mat.wall, -7, 2.5, -7);
    box(scene, 4, 5, WT, mat.wall, 7, 2.5, -7);
    box(scene, 2, 5, WT, mat.wall, 0, 2.5, -7);

    // Voorwand
    box(scene, 18, 5, WT, mat.wall, 0, 2.5, 7);

    // ZIJWANDEN MET RAMEN
    function createWindowWall(x, side) {
        const windowWidth = 2.8;
        const bottom = 1.2;
        const top = 4.3;
        const height = top - bottom;
        const centerY = (bottom + top) / 2;
        const frameX = x - side * 0.25;

        for (const s of [
            { center: -5.8, length: 2.4 },
            { center: 0, length: 3.6 },
            { center: 5.8, length: 2.4 }
        ]) {
            box(scene, WT, WALL_H, s.length, mat.wall, x, 2.5, s.center);
        }

        for (const z of [-3.2, 3.2]) {
            box(scene, WT, bottom, windowWidth, mat.wall, x, bottom / 2, z);
            box(scene, WT, WALL_H - top, windowWidth, mat.wall,
                x, top + (WALL_H - top) / 2, z);

            const glass = new THREE.Mesh(
                new THREE.PlaneGeometry(windowWidth, height), mat.glass
            );
            glass.position.set(frameX, centerY, z);
            glass.rotation.y = side * Math.PI / 2;
            scene.add(glass);

            // Raamframe
            box(scene, 0.16, 0.16, windowWidth + 0.35, mat.metal, frameX, bottom, z);
            box(scene, 0.16, 0.16, windowWidth + 0.35, mat.metal, frameX, top, z);
            box(scene, 0.16, height, 0.16, mat.metal, frameX, centerY, z - windowWidth / 2);
            box(scene, 0.16, height, 0.16, mat.metal, frameX, centerY, z + windowWidth / 2);

            // Extra versteviging
            box(scene, 0.12, height, 0.09, mat.darkMetal, frameX, centerY, z);
            strip(scene, 0.07, 0.07, windowWidth - 0.3, frameX, top + 0.18, z, mat.cyan);

            for (let i = -1; i <= 1; i++) {
                bolt(scene, frameX, bottom + 0.1, z + i * 0.85);
                bolt(scene, frameX, top - 0.1, z + i * 0.85);
            }
        }
    }

    createWindowWall(-9, 1);
    createWindowWall(9, -1);

    // VOORWAND: BEDIENINGSPANELEN
    for (let x = -7; x <= 7; x += 2) {
        panel(scene, x, 2.5, 6.72, 1.7, 3.7, 0.12, true);
        strip(scene, 0.055, 2.5, 0.04, x, 2.5, 6.62, mat.blue);
    }

    // CONSOLE OP DE VOORWAND
    for (let x of [-5, -1.7, 1.7, 5]) {
        box(scene, 1.0, 0.65, 0.22, mat.darkMetal, x, 1.25, 6.48);
        box(scene, 0.75, 0.38, 0.035, mat.blue, x, 1.45, 6.34);
        for (let i = 0; i < 3; i++) {
            cylinder(scene, 0.045, 0.045, 0.035,
                i === 0 ? mat.green : mat.red, x - 0.22 + i * 0.22, 1.0, 6.33);
        }
    }

    // PLAFONDBALKEN EN LICHT
    for (const z of [-5.8, -2.9, 0, 2.9, 5.8]) {
        box(scene, 17.5, 0.18, 0.22, mat.darkMetal, 0, 4.78, z);
        strip(scene, 15, 0.04, 0.06, 0, 4.66, z, mat.cyan);
    }

    // PLAFONDLEIDINGEN
    for (const x of [-7.8, -7.2, 7.2, 7.8]) {
        pipe(scene, new THREE.Vector3(x, 4.45, -6.5),
            new THREE.Vector3(x, 4.45, 6.5), 0.09, mat.metal);
        pipe(scene, new THREE.Vector3(x, 4.25, -6.5),
            new THREE.Vector3(x, 4.25, 6.5), 0.045, mat.blue);
        for (const z of [-5, 0, 5]) {
            cylinder(scene, 0.14, 0.14, 0.12, mat.darkMetal, x, 4.45, z);
        }
    }

    // VLOERPANELEN
    for (let x = -8; x <= 8; x += 2) {
        box(scene, 0.035, 0.025, 13, mat.metal, x, 0.025, 0);
    }

    for (let z = -5; z <= 5; z += 2) {
        box(scene, 17, 0.025, 0.035, mat.darkMetal, 0, 0.035, z);
    }

    // VLOERROOSTERS BIJ DE WANDEN
    for (const side of [-1, 1]) {
        for (let z = -5.8; z <= 5.8; z += 0.55) {
            box(scene, 0.65, 0.035, 0.045, mat.metal, side * 8.45, 0.04, z);
        }
    }

    // KLEINE KAMERS: GEDEELDE BASISCONSTRUCTIE
    function createSmallRoom(cx, cz) {
        const width = 7;
        const depth = 5;

        box(scene, width, 0.3, depth, mat.floor, cx, -0.15, cz);
        box(scene, width, 0.3, depth, mat.wallDark, cx, 5, cz);

        box(scene, 0.3, 5, depth, mat.wall, cx - 3.5, 2.5, cz);
        box(scene, 0.3, 5, depth, mat.wall, cx + 3.5, 2.5, cz);
        box(scene, width, 5, 0.3, mat.wall, cx, 2.5, cz - 2.5);

        // Hoekprofielen
        for (const x of [cx - 3.25, cx + 3.25]) {
            box(scene, 0.08, 4.6, 0.08, mat.metal, x, 2.5, cz - 2.25);
            box(scene, 0.08, 4.6, 0.08, mat.metal, x, 2.5, cz + 2.25);
        }

        // Vloernaden
        for (let x = cx - 2.5; x <= cx + 2.5; x += 1) {
            box(scene, 0.025, 0.025, 4.5, mat.metal, x, 0.025, cz);
        }

        // Plafondbalken
        for (const z of [cz - 1.8, cz, cz + 1.8]) {
            box(scene, 6.6, 0.12, 0.15, mat.darkMetal, cx, 4.78, z);
        }

        // Verlichting
        strip(scene, 3.8, 0.055, 0.09, cx, 4.64, cz, mat.cyan);
        strip(scene, 0.08, 0.05, 2.8, cx - 3.28, 4.55, cz, mat.blue);
        strip(scene, 0.08, 0.05, 2.8, cx + 3.28, 4.55, cz, mat.blue);

        // Leidingen langs het plafond
        pipe(scene, new THREE.Vector3(cx - 2.9, 4.35, cz - 2),
            new THREE.Vector3(cx - 2.9, 4.35, cz + 2), 0.055, mat.metal);
        pipe(scene, new THREE.Vector3(cx + 2.9, 4.35, cz - 2),
            new THREE.Vector3(cx + 2.9, 4.35, cz + 2), 0.055, mat.metal);

        // Wandpanelen
        for (let z = cz - 1.5; z <= cz + 1.5; z += 1.5) {
            box(scene, 0.07, 3.7, 0.07, mat.metal, cx - 3.3, 2.5, z);
            box(scene, 0.07, 3.7, 0.07, mat.metal, cx + 3.3, 2.5, z);
        }

        // Ventilatierooster achterwand
        box(scene, 1.3, 0.75, 0.08, mat.darkMetal, cx, 3.65, cz - 2.29);
        for (let i = 0; i < 5; i++) {
            box(scene, 0.055, 0.65, 0.045, mat.metal,
                cx - 0.48 + i * 0.24, 3.65, cz - 2.23);
        }

        // Gele veiligheidsmarkering bij de deur
        for (let i = -2; i <= 2; i++) {
            box(scene, 0.35, 0.025, 0.12, mat.yellow, cx + i * 0.55, 0.04, cz + 2.15);
        }
    }

    createSmallRoom(-4.5, -9.5);
    createSmallRoom(4.5, -9.5);

    // BATTERIJENKAMER
    // Twee compacte rekken met individuele batterijcellen.
    function createBatteryRack(cx, cz) {
        const rack = new THREE.Group();
        rack.position.set(cx, 0, cz);
        scene.add(rack);

        // Rekframe
        for (const x of [-0.95, 0.95]) {
            for (const y of [0.35, 1.45, 2.55]) {
                box(rack, 0.09, 0.09, 0.9, mat.metal, x, y, 0);
            }
            box(rack, 0.09, 2.3, 0.09, mat.metal, x, 1.4, -0.4);
            box(rack, 0.09, 2.3, 0.09, mat.metal, x, 1.4, 0.4);
        }

        for (const y of [0.35, 1.45, 2.55]) {
            box(rack, 1.9, 0.08, 0.9, mat.darkMetal, 0, y, 0);
        }

        // 3 afzonderlijke batterijmodules per verdieping
        for (let level = 0; level < 2; level++) {
            for (let i = 0; i < 3; i++) {
                const x = -0.62 + i * 0.62;
                const y = 0.82 + level * 1.1;

                const cell = new THREE.Group();
                cell.position.set(x, y, 0);
                rack.add(cell);

                box(cell, 0.43, 0.78, 0.58, mat.battery, 0, 0, 0);
                box(cell, 0.34, 0.08, 0.48, mat.darkMetal, 0, 0.42, 0);
                box(cell, 0.28, 0.06, 0.4, mat.copper, 0, 0.49, 0);

                // Frontplaat
                box(cell, 0.33, 0.47, 0.035, mat.panel, 0, -0.02, 0.3);
                box(cell, 0.23, 0.07, 0.025, mat.blue, 0, 0.12, 0.322);
                box(cell, 0.23, 0.045, 0.025, mat.cyan, 0, 0.02, 0.322);

                // Kleine statuslampjes
                for (let j = 0; j < 3; j++) {
                    cylinder(cell, 0.025, 0.025, 0.025,
                        j === 0 ? mat.green : mat.blue,
                        -0.09 + j * 0.09, -0.18, 0.33, 8);
                }

                // Bovenste aansluitingen
                for (const sx of [-0.11, 0.11]) {
                    cylinder(cell, 0.055, 0.055, 0.09, mat.metal, sx, 0.54, 0, 8);
                }
            }
        }

        // Kabelbundels achter het rek
        for (let i = 0; i < 3; i++) {
            pipe(rack, new THREE.Vector3(-0.65 + i * 0.65, 2.7, -0.52),
                new THREE.Vector3(-0.65 + i * 0.65, 0.3, -0.52),
                0.035, i === 1 ? mat.copper : mat.blue);
        }

        // Voetplaten
        for (const x of [-0.95, 0.95]) {
            box(rack, 0.3, 0.08, 1.1, mat.darkMetal, x, 0.08, 0);
        }
    }

    // Rekken langs de zijwanden, middenpad blijft vrij
    createBatteryRack(-7.0, -9.7);
    createBatteryRack(-2.0, -9.7);

    // Elektrisch verdeelpaneel achterin
    box(scene, 1.1, 1.6, 0.16, mat.darkMetal, -4.5, 1.55, -11.82);
    box(scene, 0.88, 1.25, 0.06, mat.panel, -4.5, 1.55, -11.7);
    for (let i = 0; i < 4; i++) {
        box(scene, 0.62, 0.045, 0.035, mat.metal,
            -4.5, 1.95 - i * 0.2, -11.65);
    }
    for (let i = 0; i < 3; i++) {
        cylinder(scene, 0.06, 0.06, 0.04, mat.green,
            -4.72 + i * 0.22, 1.05, -11.63);
    }

    // ONDERHOUDSKAMER
    // Werkbank langs de achterwand
    const benchX = 4.5;
    const benchZ = -11.0;

    box(scene, 4.6, 0.16, 1.0, mat.darkMetal, benchX, 1.05, benchZ);
    box(scene, 4.4, 0.12, 0.88, mat.panelLight, benchX, 1.17, benchZ);

    for (const x of [2.55, 6.45]) {
        box(scene, 0.13, 1.0, 0.75, mat.metal, x, 0.53, benchZ);
        box(scene, 0.55, 0.08, 0.8, mat.darkMetal, x, 0.1, benchZ);
    }

    // Lades
    for (let x = 3.1; x <= 5.9; x += 0.7) {
        box(scene, 0.58, 0.24, 0.08, mat.panel, x, 0.82, benchZ + 0.48);
        box(scene, 0.12, 0.035, 0.035, mat.metal, x, 0.82, benchZ + 0.43);
    }

    // Gereedschapsbord
    box(scene, 3.8, 1.55, 0.12, mat.darkMetal, benchX, 2.55, -11.95);
    box(scene, 3.55, 1.3, 0.06, mat.panel, benchX, 2.55, -11.86);

    // Ophanghaken en gereedschap
    for (let i = 0; i < 7; i++) {
        const x = 2.95 + i * 0.52;
        box(scene, 0.035, 0.45, 0.055, mat.metal, x, 2.55, -11.78);
        box(scene, 0.18, 0.045, 0.08, mat.yellow, x, 2.8, -11.75);
        cylinder(scene, 0.045, 0.045, 0.16, mat.metal, x, 2.28, -11.78);
    }

    // Kleine opslagkasten links
    for (let i = 0; i < 2; i++) {
        const z = -10.8 + i * 1.25;
        box(scene, 0.9, 1.9, 0.75, mat.darkMetal, 1.9, 1.0, z);
        box(scene, 0.76, 1.55, 0.06, mat.panel, 1.9, 1.0, z + 0.4);
        box(scene, 0.08, 0.08, 0.07, mat.metal, 2.2, 1.0, z + 0.45);
        strip(scene, 0.06, 1.35, 0.035, 1.55, 1.0, z + 0.45, mat.blue);
    }

    // Kabelhaspel
    const spool = new THREE.Group();
    spool.position.set(7.1, 1.0, -9.9);
    scene.add(spool);

    cylinder(spool, 0.52, 0.52, 0.18, mat.darkMetal, 0, 0, 0);
    cylinder(spool, 0.42, 0.42, 0.42, mat.rubber, 0, 0, 0);
    cylinder(spool, 0.52, 0.52, 0.12, mat.metal, 0, 0.25, 0);
    cylinder(spool, 0.52, 0.52, 0.12, mat.metal, 0, -0.25, 0);
    cylinder(spool, 0.12, 0.12, 0.8, mat.metal, 0, 0, 0);

    // Kleine compressor
    box(scene, 0.9, 1.2, 0.8, mat.darkMetal, 7.0, 0.7, -11.35);
    cylinder(scene, 0.25, 0.25, 0.08, mat.metal, 7.0, 1.35, -11.35);
    strip(scene, 0.55, 0.08, 0.04, 7.0, 0.85, -10.93, mat.green);
    for (let i = 0; i < 4; i++) {
        box(scene, 0.06, 0.65, 0.08, mat.metal,
            6.65 + i * 0.23, 0.7, -10.92);
    }

    // VISVERWERKINGSPAN
    const panGroup = new THREE.Group();
    scene.add(panGroup);

    const pan = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 2.1, 0.8, 40), mat.pan
    );
    pan.position.y = 0.4;
    panGroup.add(pan);

    const panInside = new THREE.Mesh(
        new THREE.CylinderGeometry(1.75, 1.75, 0.08, 40), mat.darkMetal
    );
    panInside.position.y = 0.82;
    panGroup.add(panInside);

    const panRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.95, 0.13, 8, 40), mat.metal
    );
    panRim.rotation.x = Math.PI / 2;
    panRim.position.y = 0.84;
    panGroup.add(panRim);

    // Bevestigingsbouten rond de pan
    for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        cylinder(panGroup, 0.065, 0.065, 0.1, mat.darkMetal,
            Math.cos(a) * 2, 0.4, Math.sin(a) * 2, 8);
    }

    // Afvoerleidingen onder de pan
    for (const x of [-0.8, 0.8]) {
        pipe(scene, new THREE.Vector3(x, 0.1, 0),
            new THREE.Vector3(x, -0.7, 0), 0.08, mat.metal);
    }

    // HARPOENSTATIONS
    function createHarpoonStation(x, z, rotationY) {
        const pivot = new THREE.Group();
        pivot.position.set(x, 1.2, z);
        pivot.rotation.y = rotationY;
        scene.add(pivot);

        // Roterende voet
        cylinder(pivot, 0.72, 0.82, 0.32, mat.darkMetal, 0, -0.9, 0, 20);
        cylinder(pivot, 0.59, 0.59, 0.12, mat.metal, 0, -0.68, 0, 20);
        cylinder(pivot, 0.43, 0.43, 0.08, mat.yellow, 0, -0.59, 0, 20);

        // Bouten rondom de voet
        for (let i = 0; i < 8; i++) {
            const a = i / 8 * Math.PI * 2;
            cylinder(pivot, 0.045, 0.045, 0.06, mat.metal,
                Math.cos(a) * 0.66, -0.7, Math.sin(a) * 0.66, 8);
        }

        // Verstevigde behuizing
        box(pivot, 0.88, 0.66, 1.05, mat.darkMetal, 0, -0.43, -0.2);
        box(pivot, 0.76, 0.49, 0.92, mat.panel, 0, -0.38, -0.2);

        // Zijplaten
        for (const side of [-1, 1]) {
            box(pivot, 0.08, 0.78, 0.85, mat.metal, side * 0.47, -0.37, -0.2);
            box(pivot, 0.12, 0.16, 0.6, mat.yellow, side * 0.52, -0.37, -0.2);
        }

        // Hydraulische cilinders
        for (const side of [-1, 1]) {
            cylinder(pivot, 0.105, 0.105, 1.35, mat.darkMetal,
                side * 0.36, 0.12, -1.0, 10);
            cylinder(pivot, 0.065, 0.065, 0.95, mat.metal,
                side * 0.36, 0.12, -1.0, 10);
            pipe(pivot,
                new THREE.Vector3(side * 0.37, -0.1, -0.55),
                new THREE.Vector3(side * 0.37, 0.45, -1.9),
                0.035, mat.copper);
        }

        // Hoofdloop
        const barrel = cylinder(
            pivot, 0.14, 0.19, 2.8, mat.darkMetal, 0, 0.4, -1.5, 16
        );
        barrel.rotation.x = Math.PI / 2;

        // Buitenste loopringen
        for (const z of [-0.55, -1.0, -2.0, -2.65]) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.17, 0.045, 8, 16), mat.metal
            );
            ring.position.set(0, 0.4, z);
            pivot.add(ring);
        }

        // Monding: blijft op de positie die harpoon.js gebruikt
        const muzzle = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.055, 8, 16), mat.metal
        );
        muzzle.position.set(0, 0.4, -2.9);
        pivot.add(muzzle);

        // Binnenste donkere opening
        cylinder(pivot, 0.125, 0.125, 0.025, mat.darkMetal,
            0, 0.4, -2.91, 16);

        // Harpoenrail bovenop de loop
        box(pivot, 0.16, 0.1, 2.1, mat.metal, 0, 0.64, -1.45);
        for (let i = 0; i < 5; i++) {
            box(pivot, 0.22, 0.035, 0.08, mat.yellow,
                0, 0.72, -0.65 - i * 0.37);
        }

        // Kabelhaspel achter de behuizing
        cylinder(pivot, 0.31, 0.31, 0.16, mat.darkMetal, 0, 0.1, 0.35, 16);
        cylinder(pivot, 0.24, 0.24, 0.3, mat.copper, 0, 0.1, 0.35, 16);
        cylinder(pivot, 0.31, 0.31, 0.12, mat.metal, 0, 0.1, 0.35, 16);
        cylinder(pivot, 0.07, 0.07, 0.45, mat.metal, 0, 0.1, 0.35, 12);

        // Kabel naar de loop
        pipe(pivot,
            new THREE.Vector3(0.18, 0.15, 0.2),
            new THREE.Vector3(0.18, 0.35, -0.8),
            0.045, mat.copper);

        // Vizier
        box(pivot, 0.3, 0.08, 0.4, mat.darkMetal, 0, 0.84, -1.3);
        box(pivot, 0.22, 0.04, 0.3, mat.cyan, 0, 0.9, -1.3);

        // Bedieningsindicatoren
        box(pivot, 0.32, 0.18, 0.06, mat.darkMetal, 0, -0.05, -0.68);
        strip(pivot, 0.2, 0.055, 0.035, 0, -0.02, -0.72, mat.cyan);

        for (let i = 0; i < 3; i++) {
            cylinder(pivot, 0.035, 0.035, 0.04,
                i === 0 ? mat.green : mat.red,
                -0.1 + i * 0.1, -0.16, -0.72, 8);
        }

        // Handgrepen
        for (const side of [-1, 1]) {
            const handle = cylinder(
                pivot, 0.045, 0.045, 0.5, mat.metal,
                side * 0.55, -0.4, -0.3, 8
            );
            handle.rotation.z = Math.PI / 2;

            cylinder(pivot, 0.065, 0.065, 0.18, mat.rubber,
                side * 0.75, -0.4, -0.3, 8);
        }

        // Bevestigingsplaat op de vloer
        box(pivot, 1.7, 0.08, 1.8, mat.darkMetal, 0, -1.08, 0);

        return pivot;
    }

    const cannonPivots = [
        createHarpoonStation(-7.8, -3.2, Math.PI / 2),
        createHarpoonStation(-7.8, 3.2, Math.PI / 2),
        createHarpoonStation(7.8, -3.2, -Math.PI / 2),
        createHarpoonStation(7.8, 3.2, -Math.PI / 2)
    ];

    // ZITPOSITIES - ONGEWIJZIGD
    const harpoonSeatPositions = [
        { position: new THREE.Vector3(-5.7, 1.7, -3.2), yaw: Math.PI / 2 },
        { position: new THREE.Vector3(-5.7, 1.7, 3.2), yaw: Math.PI / 2 },
        { position: new THREE.Vector3(5.7, 1.7, -3.2), yaw: -Math.PI / 2 },
        { position: new THREE.Vector3(5.7, 1.7, 3.2), yaw: -Math.PI / 2 }
    ];

    // OCEAAN BUITEN DE RAMEN
    for (const x of [-15, 15]) {
        const ocean = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 16), mat.ocean
        );
        ocean.position.set(x, 2.7, 0);
        ocean.rotation.y = Math.PI / 2;
        scene.add(ocean);
    }

    // STARTPOSITIE
    const playerStart = new THREE.Vector3(0, 1.7, 5.2);
    camera.position.copy(playerStart);
    camera.lookAt(0, 1.7, -5);

    return {
        scene,
        camera,
        renderer,
        cannonPivots,
        playerStart,
        harpoonSeatPositions
    };
}
