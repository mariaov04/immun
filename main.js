import * as THREE from "./three.js/build/three.module.js";
import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./three.js/examples/jsm/loaders/GLTFLoader.js";


// Данные клеток
const CELLS = [
    
    {
        name: "Макрофаг",
        description: "Фагоцитирующая клетка...",
        modelPath: "../models/macrophage.glb"
    },
    {
        name: "Т-лимфоцит",
        description: "Клетка адаптивного иммунитета...",
        modelPath: "../models/T-lymf.glb"
    },
    {
        name: "Дендритная клетка",
        description: "Представляет антигены...",
        modelPath: "../models/1dendritic.glb"
    },
    {
        name: "Эозинофил",
        description: "Гранулоцит врождённого иммунитета...",
        modelPath: "../models/eosinophil.glb"
    }
];

let scene, camera, renderer, controls;
let currentModel = null;
let currentIndex = 0;


// 🔥 Инициализация 3D окна
function initThree() {
    const container = document.getElementById("three-container-main");
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(50, 2, 3); 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

controls.minDistance = 5.0;
controls.maxDistance = 40.0;

    // Свет как в рабочем варианте
    scene.add(new THREE.HemisphereLight(0x99ccff, 0x336699, 1.9));
    scene.add(new THREE.AmbientLight(0x88caff, 5.9));

    const dirLight = new THREE.DirectionalLight(0xbbddff, 0.8);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const lights = [
        new THREE.DirectionalLight(0xffffff, 0.7),
        new THREE.DirectionalLight(0xffffff, 0.7),
        new THREE.DirectionalLight(0xffffff, 0.7),
        new THREE.DirectionalLight(0xffffff, 0.7),
    ];
    lights[0].position.set(5, 5, 5);
    lights[1].position.set(-5, 5, 5);
    lights[2].position.set(5, -5, 5);
    lights[3].position.set(5, 5, -5);
    lights.forEach(l => scene.add(l));

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

// Загрузка модели по индексу
function loadModel(index) {
    const cell = CELLS[index];

    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }

    const loader = new GLTFLoader();
    loader.load(cell.modelPath, (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.2, 1.2, 1.2);

        scene.add(model);
        currentModel = model;

        // Обновление текста
        document.querySelector(".cell-title").textContent = cell.name;
        document.querySelector(".cell-desc").textContent = cell.description;
        document.querySelector(".cell-counter").textContent =
            `${index + 1} / ${CELLS.length}`;
    });
}

function nextCell() {
    currentIndex = (currentIndex + 1) % CELLS.length;
    loadModel(currentIndex);
}

function prevCell() {
    currentIndex = (currentIndex - 1 + CELLS.length) % CELLS.length;
    loadModel(currentIndex);
}

// Запуск
window.addEventListener("DOMContentLoaded", () => {
    initThree();
    loadModel(currentIndex);

    document.getElementById("next-cell").onclick = nextCell;
    document.getElementById("prev-cell").onclick = prevCell;
});
