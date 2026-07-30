import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const container   = document.getElementById('modelViewer');
const canvas       = document.getElementById('viewerCanvas');
const loadingEl     = document.getElementById('viewerLoading');
const loadingFill   = document.getElementById('viewerLoadingFill');
const loadingLabel  = document.getElementById('viewerLoadingLabel');
const hintEl        = document.getElementById('viewerHint');

if (container && canvas) {
 try {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // lighting
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe8231a, 0.9);
  rim.position.set(-4, 1.5, -3);
  scene.add(rim);

  // the loaded model sits inside this group — only this group rotates
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  function fitContainer() {
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 400;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  fitContainer();
  new ResizeObserver(fitContainer).observe(container);

  const loader = new GLTFLoader();
  loader.load(
    'assets/model.glb',
    (gltf) => {
      const model = gltf.scene;

      // center + normalize scale so the model always frames nicely
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      model.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 2.1 / maxDim;
      model.scale.setScalar(scale);

      modelGroup.add(model);
      camera.position.set(0, 0.15, 4.2);
      camera.lookAt(0, 0, 0);

      loadingEl.classList.add('hidden');
      if (hintEl) hintEl.classList.add('visible');
    },
    (xhr) => {
      if (xhr.lengthComputable) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        if (loadingFill) loadingFill.style.width = pct + '%';
        if (loadingLabel) loadingLabel.textContent = `Loading 3D model… ${pct}%`;
      } else if (loadingLabel) {
        loadingLabel.textContent = `Loading 3D model… ${(xhr.loaded / 1048576).toFixed(0)}MB`;
      }
    },
    (err) => {
      if (loadingLabel) loadingLabel.textContent = 'Could not load 3D model — check assets/model.glb exists';
      console.error('GLB load error:', err);
    }
  );

  // ---- horizontal-only drag rotation ----
  let dragging = false;
  let lastX = 0;
  let velocity = 0;
  let idleSpin = !reduceMotion;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    idleSpin = false;
    lastX = e.clientX;
    velocity = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    const delta = dx * 0.01;
    modelGroup.rotation.y += delta;
    velocity = delta;
  });
  const endDrag = () => { dragging = false; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', endDrag);

  container.addEventListener('mouseenter', () => { idleSpin = false; });
  container.addEventListener('mouseleave', () => { if (!dragging && !reduceMotion) idleSpin = true; });

  function animate() {
    if (!dragging) {
      if (Math.abs(velocity) > 0.0003) {
        modelGroup.rotation.y += velocity;
        velocity *= 0.95;
      } else if (idleSpin) {
        modelGroup.rotation.y += 0.0035;
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
 } catch (err) {
    console.error('3D viewer setup failed:', err);
    if (loadingLabel) loadingLabel.textContent = '3D viewer error — see console (F12)';
 }
}
