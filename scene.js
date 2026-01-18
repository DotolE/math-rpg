class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();

        // Dimensions (fallback if hidden)
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || 300; // Default height

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        this.ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
        this.scene.add(this.ambientLight);

        this.pointLight = new THREE.PointLight(0xffffff, 1, 100);
        this.pointLight.position.set(5, 5, 5);
        this.scene.add(this.pointLight);

        // Current Monster Mesh
        this.monsterMesh = null;
        this.monsterType = 'default';

        // Animation Loop
        this.animate = this.animate.bind(this);
        this.animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            if (this.container.clientWidth > 0 && this.container.clientHeight > 0) {
                this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            }
        });
    }

    animate() {
        requestAnimationFrame(this.animate);

        if (this.monsterMesh) {
            // Idle Animation
            this.monsterMesh.rotation.y += 0.01;
            this.monsterMesh.rotation.x += 0.005;

            // Float effect
            this.monsterMesh.position.y = Math.sin(Date.now() * 0.002) * 0.5;
        }

        this.renderer.render(this.scene, this.camera);
    }

    spawnMonster(monsterName, circle) {
        // Remove old monster
        if (this.monsterMesh) {
            this.scene.remove(this.monsterMesh);
        }

        let geometry;
        let color = 0xaaaaaa;

        // Determine shape/color based on name or circle
        // Simple logic for now
        if (monsterName.includes("Slime")) {
            geometry = new THREE.SphereGeometry(1.5, 32, 32);
            color = 0x00ff00;
        } else if (monsterName.includes("Goblin")) {
            geometry = new THREE.IcosahedronGeometry(1.5, 0); // Spiky
            color = 0x8b0000;
        } else if (monsterName.includes("Golem")) {
            geometry = new THREE.BoxGeometry(2, 2, 2);
            color = 0x808080;
        } else if (monsterName.includes("Dragon")) {
            geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
            color = 0xffd700;
        } else {
            // Random weird shape for others
            geometry = new THREE.OctahedronGeometry(1.5, 1);
            color = 0xff00ff;
        }

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.4,
            metalness: 0.3,
            emissive: 0x111111
        });

        this.monsterMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.monsterMesh);

        // Entry animation ( Scale up )
        this.monsterMesh.scale.set(0.1, 0.1, 0.1);
        let scale = 0.1;
        const entryInterval = setInterval(() => {
            scale += 0.1;
            if (scale >= 1) {
                scale = 1;
                clearInterval(entryInterval);
            }
            this.monsterMesh.scale.set(scale, scale, scale);
        }, 30);
    }

    playDamageEffect() {
        if (!this.monsterMesh) return;

        // Flash red
        const originalColor = this.monsterMesh.material.color.getHex();
        this.monsterMesh.material.color.setHex(0xffffff); // White flash

        // Shake
        const originalPos = this.monsterMesh.position.x;
        let shake = 0.5;

        setTimeout(() => {
            this.monsterMesh.material.color.setHex(originalColor);
        }, 100);
    }

    updateMagicEnvironment(type) {
        if (type === 'lightning') {
            this.pointLight.color.setHex(0xffff00);
            this.scene.background = new THREE.Color(0x111122); // Dark Blueish
        } else if (type === 'ice') {
            this.pointLight.color.setHex(0x00ffff);
            this.scene.background = new THREE.Color(0x001133); // Deep Cold Blue
        } else {
            this.pointLight.color.setHex(0xffffff);
            this.scene.background = new THREE.Color(0x110505); // Dark Reddish (Arcane default)
        }
    }
}
