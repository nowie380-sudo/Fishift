
import * as THREE from "three";

export function createScene(container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x061326);
    scene.fog = new THREE.Fog(0x061326, 24, 65);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        200
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
    const materials = {
        wall: new THREE.MeshStandardMaterial({
            color: 0x263442,
            roughness: 0.8,
            metalness: 0.65
        }),

        panel: new THREE.MeshStandardMaterial({
            color: 0x354655,
            roughness: 0.7,
            metalness: 0.7
        }),

        dark: new THREE.MeshStandardMaterial({
            color: 0x111d2a,
            roughness: 0.8,
            metalness: 0.5
        }),

        floor: new THREE.MeshStandardMaterial({
            color: 0x202b35,
            roughness: 0.85,
            metalness: 0.5
        }),

        metal: new THREE.MeshStandardMaterial({
            color: 0x8295a3,
            roughness: 0.45,
            metalness: 0.8
        }),

        darkMetal: new THREE.MeshStandardMaterial({
            color: 0x17232e,
            roughness: 0.55,
            metalness: 0.8
        }),

        glass: new THREE.MeshBasicMaterial({
            color: 0x247db8,
            transparent: true,
            opacity: 0.16,
            side: THREE.DoubleSide,
            depthWrite: false
        }),

        blueLight: new THREE.MeshBasicMaterial({
            color: 0x27bfff
        }),

        cyanLight: new THREE.MeshBasicMaterial({
            color: 0x53eaff
        }),

        redLight: new THREE.MeshBasicMaterial({
            color: 0xff3030
        }),

        ocean: new THREE.MeshBasicMaterial({
            color: 0x031b3c,
            side: THREE.DoubleSide
        }),

        pan: new THREE.MeshStandardMaterial({
            color: 0x727f8b,
            roughness: 0.5,
            metalness: 0.8
        })
    };

    // LICHT
    scene.add(new THREE.AmbientLight(0x7298c5, 1.5));

    function addPointLight(color, intensity, distance, x, y, z) {
        const light = new THREE.PointLight(color, intensity, distance);
        light.position.set(x, y, z);
        scene.add(light);
        return light;
    }

    addPointLight(0x65aaff, 30, 28, 0, 4, 0);
    addPointLight(0x238cff, 18, 18, -5, 3, 3);
    addPointLight(0x238cff, 18, 18, 5, 3, 3);
    addPointLight(0x238cff, 16, 18, -4.5, 3, -10);
    addPointLight(0x238cff, 16, 18, 4.5, 3, -10);

    // HULPFUNCTIES
    function addBox(parent, width, height, depth, material, x, y, z) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            material
        );

        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
    }

    function addCylinder(parent, radiusTop, radiusBottom, height, material, x, y, z) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(
                radiusTop,
                radiusBottom,
                height,
                12
            ),
            material
        );

        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
    }

    function addPipe(parent, start, end, radius, material) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();

        const pipe = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, length, 8),
            material
        );

        pipe.position.copy(start).add(end).multiplyScalar(0.5);
        pipe.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
        );

        parent.add(pipe);
        return pipe;
    }

    function addLightStrip(parent, width, height, depth, x, y, z) {
        return addBox(
            parent,
            width,
            height,
            depth,
            materials.blueLight,
            x, y, z
        );
    }

    // CENTRALE KAMER
    const roomWidth = 18;
    const roomDepth = 14;
    const wallHeight = 5;
    const wallThickness = 0.4;

    addBox(scene, roomWidth, 0.3, roomDepth,
        materials.floor, 0, -0.15, 0);

    addBox(scene, roomWidth, 0.3, roomDepth,
        materials.dark, 0, 5, 0);

    // ACHTERWAND MET DEUROPENINGEN
    addBox(scene, 4, 5, wallThickness,
        materials.wall, -7, 2.5, -7);

    addBox(scene, 4, 5, wallThickness,
        materials.wall, 7, 2.5, -7);

    addBox(scene, 2, 5, wallThickness,
        materials.wall, 0, 2.5, -7);

    // VOORWAND
    addBox(scene, 18, 5, wallThickness,
        materials.wall, 0, 2.5, 7);

    // ZIJWANDEN MET RAMEN
    function createWindowWall(x, side) {
        const windowWidth = 2.8;
        const bottom = 1.2;
        const top = 4.3;
        const windowHeight = top - bottom;
        const windowY = (bottom + top) / 2;

        const segments = [
            { center: -5.8, length: 2.4 },
            { center: 0, length: 3.6 },
            { center: 5.8, length: 2.4 }
        ];

        for (const segment of segments) {
            addBox(
                scene,
                wallThickness,
                wallHeight,
                segment.length,
                materials.wall,
                x, 2.5, segment.center
            );
        }

        for (const z of [-3.2, 3.2]) {
            // Muur onder en boven raam
            addBox(scene, wallThickness, bottom, windowWidth,
                materials.wall, x, bottom / 2, z);

            addBox(
                scene,
                wallThickness,
                wallHeight - top,
                windowWidth,
                materials.wall,
                x,
                top + (wallHeight - top) / 2,
                z
            );

            // Glas
            const glass = new THREE.Mesh(
                new THREE.PlaneGeometry(windowWidth, windowHeight),
                materials.glass
            );

            glass.position.set(x - side * 0.23, windowY, z);
            glass.rotation.y = side * Math.PI / 2;
            scene.add(glass);

            // Dikke metalen kozijnen
            const frameX = x - side * 0.26;

            addBox(scene, 0.18, 0.18, windowWidth + 0.35,
                materials.metal, frameX, bottom, z);

            addBox(scene, 0.18, 0.18, windowWidth + 0.35,
                materials.metal, frameX, top, z);

            addBox(scene, 0.18, windowHeight, 0.18,
                materials.metal, frameX, windowY, z - windowWidth / 2);

            addBox(scene, 0.18, windowHeight, 0.18,
                materials.metal, frameX, windowY, z + windowWidth / 2);

            // Extra bouten rondom het raam
            for (let i = -1; i <= 1; i++) {
                addCylinder(
                    scene, 0.055, 0.055, 0.04,
                    materials.darkMetal,
                    frameX, bottom + 0.1, z + i * 0.9
                );

                addCylinder(
                    scene, 0.055, 0.055, 0.04,
                    materials.darkMetal,
                    frameX, top - 0.1, z + i * 0.9
                );
            }

            // Blauwe verlichting boven het raam
            addLightStrip(
                scene,
                0.06,
                0.08,
                windowWidth - 0.2,
                frameX,
                top + 0.2,
                z
            );
        }
    }

    createWindowWall(-9, 1);
    createWindowWall(9, -1);

    // WANDPANELEN OP DE VOORWAND
    for (let x = -7; x <= 7; x += 2) {
        addBox(
            scene, 1.7, 3.7, 0.12,
            materials.panel, x, 2.5, 6.72
        );

        addBox(
            scene, 0.07, 3.8, 0.15,
            materials.metal, x - 0.9, 2.5, 6.65
        );

        addBox(
            scene, 0.07, 3.8, 0.15,
            materials.metal, x + 0.9, 2.5, 6.65
        );
    }

    // PLAFONDBALKEN
    for (const z of [-5.8, -2.9, 0, 2.9, 5.8]) {
        addBox(
            scene, 17.5, 0.18, 0.22,
            materials.darkMetal, 0, 4.78, z
        );

        addBox(
            scene, 15, 0.04, 0.06,
            materials.cyanLight, 0, 4.66, z
        );
    }

    // LEIDINGEN LANGS PLAFOND
    for (const x of [-7.8, -7.2, 7.2, 7.8]) {
        addPipe(
            scene,
            new THREE.Vector3(x, 4.45, -6.5),
            new THREE.Vector3(x, 4.45, 6.5),
            0.09,
            materials.metal
        );

        addPipe(
            scene,
            new THREE.Vector3(x, 4.25, -6.5),
            new THREE.Vector3(x, 4.25, 6.5),
            0.045,
            materials.blueLight
        );
    }

    // VLOERDETAILS
    for (let x = -8; x <= 8; x += 2) {
        addBox(scene, 0.035, 0.025, 13,
            materials.metal, x, 0.025, 0);
    }

    // METALEN VLOERPANELEN
    for (let z = -5; z <= 5; z += 2) {
        addBox(
            scene, 17, 0.025, 0.035,
            materials.darkMetal, 0, 0.035, z
        );
    }

    // KLEINE KAMERS
    function createSmallRoom(centerX, centerZ) {
        const width = 7;
        const depth = 5;

        addBox(scene, width, 0.3, depth,
            materials.floor, centerX, -0.15, centerZ);

        addBox(scene, width, 0.3, depth,
            materials.dark, centerX, 5, centerZ);

        addBox(scene, 0.3, 5, depth,
            materials.wall, centerX - width / 2, 2.5, centerZ);

        addBox(scene, 0.3, 5, depth,
            materials.wall, centerX + width / 2, 2.5, centerZ);

        addBox(scene, width, 5, 0.3,
            materials.wall, centerX, 2.5, centerZ - depth / 2);

        // Plafondverlichting
        addLightStrip(scene, 4.5, 0.06, 0.08,
            centerX, 4.65, centerZ);

        // Wandpanelen
        for (let z = centerZ - 1.5; z <= centerZ + 1.5; z += 1.5) {
            addBox(scene, 0.08, 3.5, 0.08,
                materials.metal, centerX - 3.35, 2.5, z);

            addBox(scene, 0.08, 3.5, 0.08,
                materials.metal, centerX + 3.35, 2.5, z);
        }
    }

    createSmallRoom(-4.5, -9.5);
    createSmallRoom(4.5, -9.5);

    // BATTERIJEN
    const battery = new THREE.Group();
    battery.position.set(-4.5, 0, -9.5);
    scene.add(battery);

    for (let i = -1; i <= 1; i++) {
        const box = addBox(
            battery, 1.3, 2, 0.7,
            materials.darkMetal, i * 1.5, 1, 0
        );

        addBox(
            battery, 1.1, 0.08, 0.08,
            materials.metal, i * 1.5, 1.8, 0.38
        );

        addBox(
            battery, 0.8, 0.4, 0.06,
            materials.blueLight, i * 1.5, 1.35, 0.38
        );

        addBox(
            battery, 0.7, 0.06, 0.06,
            materials.cyanLight, i * 1.5, 0.9, 0.4
        );
    }

    // VISVERWERKINGSPAN
    const panGroup = new THREE.Group();
    scene.add(panGroup);

    const pan = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 2.1, 0.8, 48),
        materials.pan
    );
    pan.position.y = 0.4;
    panGroup.add(pan);

    const panInside = new THREE.Mesh(
        new THREE.CylinderGeometry(1.75, 1.75, 0.08, 48),
        materials.darkMetal
    );
    panInside.position.y = 0.82;
    panGroup.add(panInside);

    const panRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.95, 0.13, 12, 48),
        materials.metal
    );
    panRim.rotation.x = Math.PI / 2;
    panRim.position.y = 0.84;
    panGroup.add(panRim);

    // PANDETAILS
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;

        addCylinder(
            panGroup,
            0.07, 0.07, 0.12,
            materials.darkMetal,
            Math.cos(angle) * 2,
            0.4,
            Math.sin(angle) * 2
        );
    }

    // HARPOENSTATIONS
    function createHarpoonStation(x, z, rotationY) {
        const pivot = new THREE.Group();
        pivot.position.set(x, 1.2, z);
        pivot.rotation.y = rotationY;
        scene.add(pivot);

        // Basis
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.65, 0.8, 0.35, 16),
            materials.darkMetal
        );
        base.position.y = -0.9;
        pivot.add(base);

        // Draaiplateau
        const plate = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.12, 16),
            materials.metal
        );
        plate.position.y = -0.68;
        pivot.add(plate);

        // Behuizing
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 0.6, 0.9),
            materials.panel
        );
        body.position.set(0, -0.45, -0.2);
        pivot.add(body);

        // Loop
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.19, 2.8, 12),
            materials.darkMetal
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.4, -1.5);
        pivot.add(barrel);

        // Monding
        const muzzle = new THREE.Mesh(
            new THREE.TorusGeometry(0.17, 0.05, 8, 16),
            materials.metal
        );
        muzzle.position.set(0, 0.4, -2.9);
        pivot.add(muzzle);

        // Blauwe indicator op de behuizing
        const indicator = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.08, 0.25),
            materials.cyanLight
        );
        indicator.position.set(0, -0.15, -0.3);
        pivot.add(indicator);

        // Handgrepen
        for (const side of [-1, 1]) {
            const handle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8),
                materials.metal
            );
            handle.position.set(side * 0.48, -0.4, -0.3);
            handle.rotation.z = Math.PI / 2;
            pivot.add(handle);
        }

        return pivot;
    }

    const cannonPivots = [
        createHarpoonStation(-7.8, -3.2, Math.PI / 2),
        createHarpoonStation(-7.8, 3.2, Math.PI / 2),
        createHarpoonStation(7.8, -3.2, -Math.PI / 2),
        createHarpoonStation(7.8, 3.2, -Math.PI / 2)
    ];

    // HARPOEN ZITPOSITIES
    const harpoonSeatPositions = [
        {
            position: new THREE.Vector3(-5.7, 1.7, -3.2),
            yaw: Math.PI / 2
        },
        {
            position: new THREE.Vector3(-5.7, 1.7, 3.2),
            yaw: Math.PI / 2
        },
        {
            position: new THREE.Vector3(5.7, 1.7, -3.2),
            yaw: -Math.PI / 2
        },
        {
            position: new THREE.Vector3(5.7, 1.7, 3.2),
            yaw: -Math.PI / 2
        }
    ];

    // OCEAAN BUITEN DE RAMEN
    const leftOcean = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 16),
        materials.ocean
    );
    leftOcean.position.set(-15, 2.7, 0);
    leftOcean.rotation.y = Math.PI / 2;
    scene.add(leftOcean);

    const rightOcean = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 16),
        materials.ocean
    );
    rightOcean.position.set(15, 2.7, 0);
    rightOcean.rotation.y = Math.PI / 2;
    scene.add(rightOcean);

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
