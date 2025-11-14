import { useRef, useEffect } from 'react';
import { Mesh, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerData } from '../../types/game';
import { Text } from '@react-three/drei';

interface PlayerProps {
  player: PlayerData;
}

export function Player({ player }: PlayerProps) {
  const meshRef = useRef<Mesh>(null);
  const targetPosition = useRef(new Vector3());

  useEffect(() => {
    targetPosition.current.copy(player.position);
  }, [player.position]);

  useFrame(() => {
    if (meshRef.current) {
      // Smooth interpolation
      meshRef.current.position.lerp(targetPosition.current, 0.3);
      meshRef.current.position.y = 0.5;

      // Rotate towards movement direction
      if (player.velocity.length() > 0.1) {
        const angle = Math.atan2(player.velocity.x, player.velocity.z);
        meshRef.current.rotation.y = angle;
      }
    }
  });

  const teamColor = player.team === 'home' ? '#3b82f6' : '#ef4444';
  const isControlled = player.isControlled;

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        {/* Body */}
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color={teamColor} />
      </mesh>

      {/* Number on back */}
      <Text
        position={[player.position.x, 1.2, player.position.z]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {player.number}
      </Text>

      {/* Controlled player indicator */}
      {isControlled && (
        <mesh position={[player.position.x, 1.8, player.position.z]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}

      {/* Shadow circle */}
      <mesh position={[player.position.x, 0.01, player.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
