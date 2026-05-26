// Importamos las herramientas directamente desde el CDN gracias al importmap del HTML
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// Variables globales de la escena
let scene, camera, renderer, controls;
let cameraGroup; 

// Estado de los botones de navegación en pantalla
const activeMovements = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    rotLeft: false,
    rotRight: false
};

// Inicializar la aplicación al cargar la página
init();

function init() {
    const container = document.getElementById('canvas-container');

    // 1. Creación de la Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); 

    // 2. Configuración de la Cámara y su contenedor de movimiento
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    cameraGroup = new THREE.Group();
    cameraGroup.position.set(0, 0, 4); 
    cameraGroup.add(camera);
    scene.add(cameraGroup);

    // 3. Configuración del Renderer con soporte WebXR (VR)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; 
    renderer.xr.enabled = true; 
    
    container.appendChild(renderer.domElement);

    // 4. Agregar el Botón de Realidad Virtual
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

    // 7. Carga del modelo GLB (aula_y8.glb)
    const loader = new GLTFLoader();
    const loadingScreen = document.getElementById('loading');

    loader.load(
        'aula_y8.glb', 
        function (gltf) {
            const model = gltf.scene;
            model.position.set(0, 0, 0); 
            scene.add(model);
            
            loadingScreen.style.display = 'none';
            console.log('Modelo aula_y8.glb cargado correctamente.');
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

    // 8. Configurar los eventos de los botones en pantalla
    setupScreenControls();

    // 9. Manejo de redimensionamiento de pantalla
    window.addEventListener('resize', onWindowResize);

    // 10. Bucle de Renderizado para VR y navegación continua
    renderer.setAnimationLoop(render);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// 11. Vinculación de botones HTML con el estado lógico de movimiento
function setupScreenControls() {
    const bindButton = (id, property) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        // Eventos para Mouse
        btn.addEventListener('mousedown', () => activeMovements[property] = true);
        btn.addEventListener('mouseup', () => activeMovements[property] = false);
        btn.addEventListener('mouseleave', () => activeMovements[property] = false);

        // Eventos para Pantallas Táctiles (Móviles)
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            activeMovements[property] = true;
        });
        btn.addEventListener('touchend', () => activeMovements[property] = false);
    };

    bindButton('btn-forward', 'forward');
    bindButton('btn-backward', 'backward');
    bindButton('btn-left', 'left');
    bindButton('btn-right', 'right');
    bindButton('btn-rot-left', 'rotLeft');
    bindButton('btn-rot-right', 'rotRight');
}

// 12. Lógica Unificada de Movimiento (Soporta Gamepad GameSir y Botones en Pantalla)
function handleNavigation() {
    let moveX = 0;
    let moveZ = 0;
    let rotateY = 0;

    const moveSpeed = 0.05;
    const rotationSpeed = 0.03;

    // --- LEER ENTRADAS DE LOS BOTONES EN PANTALLA ---
    if (activeMovements.forward) moveZ = -1;
    if (activeMovements.backward) moveZ = 1;
    if (activeMovements.left) moveX = -1;
    if (activeMovements.right) moveX = 1;
    if (activeMovements.rotLeft) rotateY = -1;
    if (activeMovements.rotRight) rotateY = 1;

    // --- LEER ENTRADAS DEL CONTROL GAMESIR NOVA LITE ---
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad && gamepad.axes.length >= 4) {
            // Zona muerta de 0.18 para evitar derivas o drift fantasmas en los sticks de respuesta rápida
            const deadzone = 0.18; 
            
            // Joystick Izquierdo: Movimiento lateral (Eje 0) y adelante/atrás (Eje 1)
            if (Math.abs(gamepad.axes[0]) > deadzone) moveX = gamepad.axes[0];
            if (Math.abs(gamepad.axes[1]) > deadzone) moveZ = gamepad.axes[1];
            
            // Joystick Derecho: Rotación sobre el eje Y de la escena (Eje 2)
            if (Math.abs(gamepad.axes[2]) > deadzone) rotateY = gamepad.axes[2];
        }
    }

    // --- APLICAR TRANSFORMACIONES AL ESCENARIO ---
    // Rotación suave del grupo de la cámara
    if (rotateY !== 0) {
        cameraGroup.rotation.y -= rotateY * rotationSpeed;
    }

    // Traslación inteligente orientada hacia donde mira la cámara real
    if (moveX !== 0 || moveZ !== 0) {
        const directionForward = new THREE.Vector3(0, 0, -1);
        const directionRight = new THREE.Vector3(1, 0, 0);

        // Extraemos la rotación interna del mundo que tiene la cámara y la inyectamos al vector
        directionForward.applyQuaternion(camera.quaternion);
        directionRight.applyQuaternion(camera.quaternion);

        // Obligamos al movimiento a mantenerse plano en el suelo (evita volar al mirar hacia arriba)
        directionForward.y = 0;
        directionRight.y = 0;
        directionForward.normalize();
        directionRight.normalize();

        // Aplicamos el desplazamiento continuo escalado por la velocidad
        cameraGroup.position.addScaledVector(directionForward, -moveZ * moveSpeed);
        cameraGroup.position.addScaledVector(directionRight, moveX * moveSpeed);
    }
}

function render() {
    // Procesar la navegación constantemente
    handleNavigation();

    // Si no está en modo VR, mantener activos los arrastres de órbita ordinarios con el mouse
    if (!renderer.xr.isPresenting) {
        controls.update();
    }
    
    renderer.render(scene, camera);
}
