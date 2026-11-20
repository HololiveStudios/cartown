import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EventBus } from '../services/eventBus';

interface Car3DViewerProps {
  color: number;
  onClick: () => void;
}

/** A small, real-time low-poly car model rendered over the isometric garage. */
export const Car3DViewer: React.FC<Car3DViewerProps> = ({ color, onClick }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef(color);
  const clickRef = useRef(onClick);
  colorRef.current = color;
  clickRef.current = onClick;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      host.dataset.webglUnavailable = 'true';
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'Carro 3D. Arraste para girar ou clique para interagir com o elevador.');
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-4.4, 4.4, 3, -3, 0.1, 40);
    camera.position.set(7, 6.5, 8);
    camera.lookAt(0, 0.6, 0);

    scene.add(new THREE.HemisphereLight(0xdcecff, 0x34313a, 2.2));
    const keyLight = new THREE.DirectionalLight(0xfff1d1, 3.2);
    keyLight.position.set(-4, 9, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x80bfff, 1.1);
    fillLight.position.set(5, 4, -5);
    scene.add(fillLight);

    const car = new THREE.Group();
    scene.add(car);
    let liftOffset = 0;
    const paint = new THREE.MeshStandardMaterial({ color: colorRef.current, roughness: 0.36, metalness: 0.12, flatShading: true });
    const darkPaint = new THREE.MeshStandardMaterial({ color: 0x202833, roughness: 0.65, flatShading: true });
    const glass = new THREE.MeshStandardMaterial({ color: 0x8fd1e8, roughness: 0.2, metalness: 0.1, flatShading: true });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xd8dfe7, roughness: 0.28, metalness: 0.7 });
    const tire = new THREE.MeshStandardMaterial({ color: 0x17191e, roughness: 0.9 });
    const rubber = new THREE.CylinderGeometry(0.48, 0.48, 0.28, 12);
    const wheels: THREE.Mesh[] = [];

    const addBox = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, bevel = 0) => {
      const geometry = bevel
        ? new THREE.BoxGeometry(w, h, d, 2, 1, 2)
        : new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      car.add(mesh);
      return mesh;
    };

    // Rounded, compact body and the tall cabin give the car its toy-like silhouette.
    addBox(3.5, 0.78, 1.86, paint, 0, 0.72, 0, 1);
    addBox(2.05, 0.96, 1.48, paint, -0.28, 1.46, 0, 1);
    addBox(1.53, 0.68, 1.505, glass, -0.2, 1.49, 0);
    addBox(0.13, 0.72, 1.57, paint, 0.53, 1.47, 0);
    addBox(0.22, 0.22, 1.96, darkPaint, 1.68, 0.51, 0);
    addBox(0.22, 0.22, 1.96, darkPaint, -1.68, 0.51, 0);

    // Front and rear lights.
    for (const z of [-0.63, 0.63]) {
      addBox(0.12, 0.2, 0.34, chrome, 1.79, 0.83, z);
      addBox(0.12, 0.18, 0.3, new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x4b0808 }), -1.79, 0.83, z);
    }

    for (const x of [-1.12, 1.12]) {
      for (const z of [-0.99, 0.99]) {
        const wheel = new THREE.Mesh(rubber, tire);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, 0.47, z);
        wheel.castShadow = true;
        car.add(wheel);
        wheels.push(wheel);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.292, 10), chrome);
        hub.rotation.x = Math.PI / 2;
        hub.position.copy(wheel.position);
        car.add(hub);
      }
    }

    // The orthographic ground plane catches a soft real-time shadow.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.13;
    ground.receiveShadow = true;
    scene.add(ground);

    const setPaint = (nextColor: number) => paint.color.setHex(nextColor);
    const setLift = (lifted: boolean) => {
      car.position.y = lifted ? 0.52 : 0;
      car.scale.setScalar(lifted ? 0.96 : 1);
    };
    const onColor = (nextColor: number) => setPaint(nextColor);
    const onLift = (lifted: boolean) => {
      liftOffset = lifted ? 0.52 : 0;
      setLift(lifted);
    };
    EventBus.on('CHANGE_CAR_COLOR', onColor);
    EventBus.on('CAR_LIFT_STATE', onLift);

    let frame = 0;
    let dragging = false;
    let didDrag = false;
    let lastX = 0;
    const down = (event: PointerEvent) => {
      dragging = true;
      didDrag = false;
      lastX = event.clientX;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const delta = event.clientX - lastX;
      if (Math.abs(delta) > 1) didDrag = true;
      car.rotation.y += delta * 0.012;
      lastX = event.clientX;
    };
    const up = () => {
      if (dragging && !didDrag) clickRef.current();
      dragging = false;
    };
    const cancel = () => { dragging = false; };
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', cancel);

    const resizeObserver = new ResizeObserver(() => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
    });
    resizeObserver.observe(host);

    const animate = () => {
      frame = requestAnimationFrame(animate);
      // A subtle idle motion makes clear that this is a 3D model, not a flat sprite.
      car.position.y = liftOffset + Math.sin(performance.now() * 0.0018) * 0.035;
      wheels.forEach((wheel) => { wheel.rotation.z += 0.001; });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      EventBus.off('CHANGE_CAR_COLOR', onColor);
      EventBus.off('CAR_LIFT_STATE', onLift);
      renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointermove', move);
      renderer.domElement.removeEventListener('pointerup', up);
      renderer.domElement.removeEventListener('pointercancel', cancel);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    EventBus.emit('CHANGE_CAR_COLOR', color);
  }, [color]);

  return (
    <div
      ref={hostRef}
      className="car-3d-viewer"
      role="button"
      tabIndex={0}
      aria-label="Carro 3D: clique para abrir os serviços ou arraste para girar"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          clickRef.current();
        }
      }}
    />
  );
};
