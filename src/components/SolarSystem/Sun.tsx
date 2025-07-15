import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
    if (coronaRef.current) {
      coronaRef.current.rotation.y += delta * 0.02;
      coronaRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <group>
      {/* Main Sun */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[8, 64, 64]} /> {/* was 4 */}
        <meshBasicMaterial color="#FDB813" />
      </mesh>

      {/* Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[8.6, 32, 32]} /> {/* was 4.4 */}
        <meshBasicMaterial color="#FFD700" transparent opacity={0.15} />
      </mesh>

      {/* Glow */}
      <mesh>
        <sphereGeometry args={[10, 32, 32]} /> {/* was 5.2 */}
        <meshBasicMaterial color="#FFA500" transparent opacity={0.08} />
      </mesh>

      {/* Stronger light from sun */}
      <pointLight
        position={[0, 0, 0]}
        intensity={4.5} // Stronger light
        color="#FDB813"
        distance={100}
        decay={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  );
}
