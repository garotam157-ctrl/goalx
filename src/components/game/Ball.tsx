import { useRef, useEffect } from 'react';
import { Mesh, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { BallData } from '../../types/game';

interface BallProps {
  ball: BallData;
}

export function Ball({ ball }: BallProps) {
  const meshRef = useRef<Mesh>(null);
  const targetPosition = useRef(new Vector3());

  useEffect(() => {
    targetPosition.current.copy(ball.position);
  }, [ball.position]);

  useFrame(() => {
    if (meshRef.current) {
      // Smooth interpolation
      meshRef.current.position.lerp(targetPosition.current, 0.5);

      // Rotate ball based on velocity
      if (ball.velocity.length() > 0.1) {
        meshRef.current.rotation.x += ball.velocity.z * 0.05;
        meshRef.current.rotation.z -= ball.velocity.x * 0.05;
      }
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Ball shadow */}
      <mesh position={[ball.position.x, 0.01, ball.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* Trail effect when ball is moving fast */}
      {ball.velocity.length() > 5 && (
        <mesh position={[ball.position.x, ball.position.y, ball.position.z]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  );
}
