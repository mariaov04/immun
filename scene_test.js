import * as THREE from "./three.js/build/three.module.js";
import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./three.js/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, controls;
let clock = new THREE.Clock();
let animationMixer = null;

// Модели
let modelAGroup = null;  // двигаемая
let modelBGroup = null;  // статичная
let modelAGltf = null;

// Перемещение мышью
let selectedModel = null;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let offset = new THREE.Vector3();
let dragPlane = new THREE.Plane();
let intersection = new THREE.Vector3();


function initThree() {
    const container = document.getElementById("scene-container");
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 70);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Камера с ограничениями
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;  // запрет панорамирования
    controls.minDistance = -100;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2; // ограничение вращения по вертикали
    controls.minPolarAngle = Math.PI / 6;

    // Свет
    scene.add(new THREE.HemisphereLight(0x99ccff, 0x336699, 1.5));
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 0);
    scene.add(dirLight);

    loadModels();
    animate();

    // События мыши
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("contextmenu", e => e.preventDefault());
}

function loadModels() {
    const loader = new GLTFLoader();

    // Модель A (двигаемая)
    loader.load("../models/mac_anim1.glb", gltf => {
        modelAGltf = gltf;
        modelAGroup = new THREE.Group();
        modelAGroup.add(gltf.scene);
        modelAGroup.scale.set(2, 2, 2);
        modelAGroup.position.set(-1, 0, 0);
        scene.add(modelAGroup);
    });

    // Модель B (статичная)
    loader.load("../models/mac_anim4.glb", gltf => {
        modelBGroup = new THREE.Group();
        modelBGroup.add(gltf.scene);
        modelBGroup.scale.set(2, 2, 2);
        modelBGroup.position.set(1, 0, 0);
        scene.add(modelBGroup);
    });
}

// Двигаем только модель B по правой кнопке мыши
function onMouseDown(event) {
    if (event.button !== 2 || !modelBGroup) return; // только правая кнопка и модель B

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(modelBGroup, true);

    if (intersects.length > 0) {
        selectedModel = modelBGroup;

        // Плоскость движения параллельна экрану
        dragPlane.setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(new THREE.Vector3()).clone().negate(),
            intersects[0].point
        );

        offset.copy(intersects[0].point).sub(selectedModel.position);
        controls.enabled = false;
    }
}

function onMouseMove(event) {
    if (!selectedModel) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        selectedModel.position.copy(intersection.sub(offset));
    }

    checkDistance();
}

function onMouseUp(event) {
    if (event.button !== 2) return;
    selectedModel = null;
    controls.enabled = true;
}

function checkDistance() {
    if (!modelAGroup || !modelBGroup || animationMixer) return;

    if (modelAGroup.position.distanceTo(modelBGroup.position) < 5) {
        playAnimation();
    }
}

function playAnimation() {
    if (!modelAGltf || animationMixer) return;

    animationMixer = new THREE.AnimationMixer(modelAGroup);
    modelAGltf.animations.forEach(clip => animationMixer.clipAction(clip).play());
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (animationMixer) animationMixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener("DOMContentLoaded", initThree);
