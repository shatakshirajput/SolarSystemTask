import React, { useState, useCallback } from "react";
import { Stars } from "@react-three/drei";
import { Vector3 } from "three";
import Sun from "./Sun";
import Planet from "./Planet";
import { PLANET_DATA } from "./constants";
import CameraController from "./CameraController";
import { OrbitControls } from "@react-three/drei";

interface SceneProps {
  planetSpeeds: Record<string, number>;
  isPaused: boolean;
  onPlanetHover: (name: string | null) => void;
  cameraMode: "free" | "follow";
}

export default function Scene({
  planetSpeeds,
  isPaused,
  onPlanetHover,
  cameraMode,
}: SceneProps) {
  const [cameraTarget, setCameraTarget] = useState<Vector3 | null>(null);

  const handlePlanetClick = useCallback(
    (planetName: string, distance: number) => {
      const angle = Math.random() * Math.PI * 2;
      const target = new Vector3(
        Math.cos(angle) * distance,
        2,
        Math.sin(angle) * distance
      );
      setCameraTarget(target);
      setTimeout(() => setCameraTarget(null), 5000);
    },
    []
  );

  return (
    <>
      <ambientLight intensity={0.2} color="#ffffff" />
      <pointLight
        position={[0, 0, 0]}
        intensity={3}
        color="#FDB813"
        castShadow
      />
      <pointLight position={[0, 50, 0]} intensity={0.2} color="#4FD0E7" />
      <pointLight position={[50, 0, 50]} intensity={0.1} color="#C1440E" />

      <Sun />

      {Object.entries(PLANET_DATA).map(([key, data]) => (
        <Planet
          key={key}
          data={data}
          speed={isPaused ? 0 : planetSpeeds[key] || 1}
          onClick={() => handlePlanetClick(data.name, data.distance)}
          onHover={onPlanetHover}
        />
      ))}

      <Stars radius={400} depth={80} count={2000} factor={6} />
      <CameraController
        target={cameraTarget}
        enabled={cameraMode === "follow"}
      />
      <OrbitControls
        enabled={cameraMode === "free"}
        enablePan
        enableZoom
        enableRotate
        minDistance={10}
        maxDistance={100}
      />
    </>
  );
}
