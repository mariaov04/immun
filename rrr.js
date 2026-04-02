import * as THREE from "./three.js/build/three.module.js";
import { OrbitControls } from "./three.js/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./three.js/examples/jsm/loaders/GLTFLoader.js";

import { EffectComposer } from "./three.js/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./three.js/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "./three.js/examples/jsm/postprocessing/ShaderPass.js";
import { SaturationContrastShader } from "./libs/three/SaturationContrastShader.js";

let scene, camera, renderer, composer;
let model = null;

window.addEventListener("DOMContentLoaded", () => {
    init();
    animate();
});

function init() {
    const container = document.getElementById("three");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 3, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const saturationPass = new ShaderPass(SaturationContrastShader);
    saturationPass.uniforms.saturation.value = 2.5;
    saturationPass.uniforms.contrast.value = 1.0;
    composer.addPass(saturationPass);

    loadModel();

    window.addEventListener("resize", onResize);
}

function loadModel() {
    const loader = new GLTFLoader();
    loader.load("./models/dendritic.glb", gltf => {
        model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5);
        scene.add(model);
    });
}

function animate() {
    requestAnimationFrame(animate);
    composer.render();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}
