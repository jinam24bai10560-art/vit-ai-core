import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Points, PointMaterial } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Core({ active }: { active: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const speed = active ? 0.42 : 0.16;
    if (mesh.current) {
      mesh.current.rotation.y += delta * speed;
      mesh.current.rotation.x += delta * speed * 0.35;
      const target = active ? 1.12 : 1;
      mesh.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * speed * 1.6;
      const p = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.04;
      inner.current.scale.set(p, p, p);
    }
  });

  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.35, 2]} />
        <meshStandardMaterial
          color="#0b1f2a"
          emissive="#2fd4d8"
          emissiveIntensity={active ? 2.1 : 1.1}
          wireframe
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color="#7c5cff"
          emissive="#8b6bff"
          emissiveIntensity={active ? 2.2 : 1.2}
          roughness={0.15}
          metalness={0.6}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

function EnergyRing({ radius, tilt, speed, active }: { radius: number; tilt: number; speed: number; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * speed;
    const target = active ? 1.16 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.07);
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0.3, 0]}>
      <torusGeometry args={[radius, 0.012, 12, 160]} />
      <meshBasicMaterial color={active ? "#8fe9ff" : "#3ec8dd"} transparent opacity={active ? 0.95 : 0.6} />
    </mesh>
  );
}

function ParticleField({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(1200 * 3);
    for (let i = 0; i < 1200; i++) {
      const r = 2.4 + Math.random() * 3.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * (active ? 0.22 : 0.05);
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color="#6fe6ff" size={0.028} sizeAttenuation depthWrite={false} opacity={0.75} />
    </Points>
  );
}

function Rig({ pointer }: { pointer: { x: number; y: number } }) {
  useFrame((state, delta) => {
    state.camera.position.x += (pointer.x * 1.1 - state.camera.position.x) * Math.min(1, delta * 2.2);
    state.camera.position.y += (-pointer.y * 0.8 - state.camera.position.y) * Math.min(1, delta * 2.2);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function AICoreCanvas({
  active,
  pointer,
}: {
  active: boolean;
  pointer: { x: number; y: number };
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={40} color="#39d7ff" />
      <pointLight position={[-4, -2, -3]} intensity={30} color="#8b6bff" />

      <Rig pointer={pointer} />
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.9}>
        <Core active={active} />
        <EnergyRing radius={2.05} tilt={1.5} speed={0.32} active={active} />
        <EnergyRing radius={2.5} tilt={0.9} speed={-0.22} active={active} />
        <EnergyRing radius={3.0} tilt={2.2} speed={0.14} active={active} />
      </Float>
      <ParticleField active={active} />
      <Sparkles count={90} scale={[9, 5, 9]} size={2.4} speed={active ? 1.1 : 0.35} color="#9beaff" opacity={0.6} />

      <EffectComposer>
        <Bloom intensity={active ? 1.5 : 0.9} luminanceThreshold={0.12} luminanceSmoothing={0.5} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}