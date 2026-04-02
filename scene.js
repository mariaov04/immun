import * as THREE from "./three.js/build/three.module.js";
import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./three.js/examples/jsm/loaders/GLTFLoader.js";

// ==========================
// Сцена / камера / рендер
// ==========================
let scene, camera, renderer, controls;
let clock = new THREE.Clock();
let animationMixer = null;

// ==========================
// Модели
// ==========================
let modelA = null;        // статичная (с анимацией)
let modelB = null;        // двигаемая
let modelAGltf = null;

// drag-box для modelB
let dragBox = null;

// ==========================
// Drag-система
// ==========================
let selected = false;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // плоскость Z=0
let intersection = new THREE.Vector3();
let offset = new THREE.Vector3();

// ==========================
// INIT
// ==========================
function initThree() {
    const container = document.getElementById("scene-container");

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 70); // ✅ сохраняем твою камеру

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // ==========================
    // Камера с ограничениями
    // ==========================
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 50;
    controls.maxDistance = 90;
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;

    // ==========================
    // Свет
    // ==========================
    scene.add(new THREE.HemisphereLight(0x99ccff, 0x336699, 1.5));
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    loadModels();
    animate();

    // ==========================
    // Мышь
    // ==========================
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("contextmenu", e => e.preventDefault());
}

// ==========================
// Загрузка моделей
// ==========================
function loadModels() {
    const loader = new GLTFLoader();

    // -------- Model A (статичная, с анимацией)
    loader.load("../models/mac_anim1.glb", gltf => {
        modelAGltf = gltf;
        modelA = gltf.scene;
        modelA.scale.set(2, 2, 2);
        modelA.position.set(-1, 0, 0);
        scene.add(modelA);
    });

    // -------- Model B (двигаемая)
    loader.load("../models/mac_anim4.glb", gltf => {
        modelB = gltf.scene;
        modelB.scale.set(2, 2, 2);
        modelB.position.set(1, 0, 0);
        scene.add(modelB);

        dragBox = createDragBox(modelB);
    });
}

// ==========================
// Drag-box (КЛЮЧЕВАЯ ЧАСТЬ)
// ==========================
function createDragBox(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        new THREE.MeshBasicMaterial({
            wireframe: true, // true — для отладки
            visible: true
        })
    );

    mesh.position.copy(center);
    scene.add(mesh);
    return mesh;
}

// ==========================
// Mouse DOWN (ПКМ)
// ==========================
function onMouseDown(event) {
    if (event.button !== 2 || !dragBox) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(dragBox);

    if (hits.length === 0) return;

    selected = true;
    controls.enabled = false;

    raycaster.ray.intersectPlane(dragPlane, intersection);
    offset.copy(intersection).sub(modelB.position);
}

// ==========================
// Mouse MOVE
// ==========================
function onMouseMove(event) {
    if (!selected) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        const newPos = intersection.sub(offset);
        const delta = newPos.clone().sub(modelB.position);

        modelB.position.add(delta);
        dragBox.position.add(delta);

        checkDistance();
    }
}

// ==========================
// Mouse UP
// ==========================
function onMouseUp(event) {
    if (event.button !== 2) return;
    selected = false;
    controls.enabled = true;
}

// ==========================
// Проверка расстояния
// ==========================
function checkDistance() {
    if (!modelA || !modelB || animationMixer) return;

    const dist = modelA.position.distanceTo(modelB.position);
    if (dist < 10) playAnimation();
}

// ==========================
// Анимация из modelA
// ==========================
function playAnimation() {
    animationMixer = new THREE.AnimationMixer(modelA);
    modelAGltf.animations.forEach(clip => {
        animationMixer.clipAction(clip).play();
    });
}

// ==========================
// LOOP
// ==========================
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (animationMixer) animationMixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
}

// ==========================
// START
// ==========================
window.addEventListener("DOMContentLoaded", initThree);
