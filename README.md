# 🏫 Proyecto Académico: Visor 3D Interactivo (Entorno Virtual Inmersivo)

## 📝 Datos de la Asignatura y Entrega
* **Institución:** Instituto Tecnológico de Pachuca
* **Carrera:** Ingeniería en Tecnologías de la Información y Comunicaciones
* **Materia:** Desarrollo de soluciones en ambientes virtuales
* **Docente:** M.C. Víctor Manuel Pinedo Fernández
* **Fecha de Entrega:** Mayo, 2026

### 👤 Integrantes / Desarrollador
* **Estudiante:** David Fidel Guzmán Sánchez

---

## 🎯 Objetivos del Proyecto
1. **Desarrollo Gráfico:** Implementar un motor de renderizado 3D en tiempo real para la web utilizando la biblioteca **Three.js**.
2. **Interactividad Avanzada:** Programar un sistema de navegación híbrido que responda a controles analógicos externos (Gamepad), botones táctiles en pantalla (Mobile UI) y periféricos estándar (Mouse orbital).
3. **Inmersión VR:** Integrar la API de **WebXR** para permitir la exploración del escenario a través de visores de Realidad Virtual.
4. **Optimización de Recursos:** Solucionar transferencias y lectura de archivos de geometría pesados (`.glb` de ~59 MB) en servidores de despliegue estático (GitHub Pages).

---

## 🛠️ Especificaciones Técnicas y Requerimientos

### 1. Stack Tecnológico Utilizado
* **Core Gráfico:** Three.js (WebGL Core, GLTFLoader, OrbitControls).
* **Entorno Inmersivo:** WebXR API Core (`VRButton`).
* **Diseño e Interfaz:** HTML5, CSS3 Estructural y Bootstrap para contenedores responsivos.
* **Mapeo de Control:** HTML5 Gamepad API (Optimizado para hardware **GameSir Nova Lite**).
