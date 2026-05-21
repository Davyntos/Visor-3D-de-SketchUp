// Importamos las herramientas directamente desde el CDN gracias al importmap del HTML
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// Variables globales de la escena
let scene, camera, renderer, controls;

// Inicializar la aplicación al cargar la página
init();

function init() {
    const container = document.getElementById('canvas-container');

    // 1. Creación de la Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Fondo gris oscuro noble

    // 2. Configuración de la Cámara
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 4); 

    // 3. Configuración del Renderer con soporte WebXR (VR)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; 
    renderer.xr.enabled = true; // Habilita VR de forma nativa
    
    container.appendChild(renderer.domElement);

    // 4. Agregar el Botón de Realidad Virtual (¡Ahora importado perfectamente!)
    document.body.appendChild(VRButton.createButton(renderer));

    // 5. Controles de Órbita 
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.6, 0); 
    controls.enableDamping = true; 
    controls.update();

    // 6. Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); 
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 7. Carga del modelo GLB (aulay8.glb)
    const loader = new GLTFLoader();
    const loadingScreen = document.getElementById('loading');

    loader.load(
        'aulay8.glb', 
        function (gltf) {
            const model = gltf.scene;
            model.position.set(0, 0, 0); 
            scene.add(model);
            
            // Ocultar el spinner de carga al finalizar
            loadingScreen.style.display = 'none';
            console.log('Modelo aulay8.glb cargado correctamente.');
        },
        function (xhr) {
            if (xhr.total > 0) {
                console.log((xhr.loaded / xhr.total * 100) + '% cargado');
            }
        },
        function (error) {
            console.error('Hubo un error al intentar cargar el modelo:', error);
            loadingScreen.innerHTML = '<p class="text-danger">Error al cargar el archivo .glb</p>';
        }
    );

    // 8. Manejo de redimensionamiento de pantalla
    window.addEventListener('resize', onWindowResize);

    // 9. Bucle de Renderizado para VR
    renderer.setAnimationLoop(render);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function render() {
    if (!renderer.xr.isPresenting) {
        controls.update();
    }
    renderer.render(scene, camera);
}