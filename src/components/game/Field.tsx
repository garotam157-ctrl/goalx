import { useRef } from 'react';
import { Mesh } from 'three';
import { FieldDimensions } from '../../types/game';

interface FieldProps {
  dimensions: FieldDimensions;
}

export function Field({ dimensions }: FieldProps) {
  const fieldRef = useRef<Mesh>(null);

  return (
    <group>
      {/* Ground */}
      <mesh ref={fieldRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[dimensions.width, dimensions.length]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>

      {/* Field lines */}
      <group>
        {/* Center line */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[dimensions.width, 0.2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Center circle */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.5, 5, 64]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Penalty boxes */}
        {[-1, 1].map((side) => (
          <group key={side}>
            {/* Penalty box outline */}
            <lineSegments position={[0, 0.02, side * (dimensions.length / 2 - dimensions.penaltyBoxLength / 2)]}>
              <edgesGeometry
                args={[
                  new THREE.BoxGeometry(
                    dimensions.penaltyBoxWidth,
                    0.1,
                    dimensions.penaltyBoxLength
                  ),
                ]}
              />
              <lineBasicMaterial color="#ffffff" linewidth={2} />
            </lineSegments>

            {/* Goal area */}
            <lineSegments position={[0, 0.02, side * (dimensions.length / 2 - 3)]}>
              <edgesGeometry args={[new THREE.BoxGeometry(9, 0.1, 6)]} />
              <lineBasicMaterial color="#ffffff" linewidth={2} />
            </lineSegments>
          </group>
        ))}

        {/* Corner arcs */}
        {[
          [-dimensions.width / 2, -dimensions.length / 2],
          [dimensions.width / 2, -dimensions.length / 2],
          [-dimensions.width / 2, dimensions.length / 2],
          [dimensions.width / 2, dimensions.length / 2],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1, 16, 1, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Goals */}
      {[-1, 1].map((side) => (
        <group key={side} position={[0, dimensions.goalHeight / 2, side * dimensions.length / 2]}>
          {/* Goal posts */}
          <mesh position={[-dimensions.goalWidth / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, dimensions.goalHeight]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[dimensions.goalWidth / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, dimensions.goalHeight]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, dimensions.goalHeight / 2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, dimensions.goalWidth]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>

          {/* Goal net */}
          <mesh position={[0, 0, -side * 0.5]}>
            <boxGeometry args={[dimensions.goalWidth, dimensions.goalHeight, 0.1]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} wireframe />
          </mesh>
        </group>
      ))}

      {/* Stadium walls */}
      <mesh position={[0, 5, -dimensions.length / 2 - 5]} receiveShadow>
        <boxGeometry args={[dimensions.width + 20, 10, 1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0, 5, dimensions.length / 2 + 5]} receiveShadow>
        <boxGeometry args={[dimensions.width + 20, 10, 1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[-dimensions.width / 2 - 5, 5, 0]} receiveShadow>
        <boxGeometry args={[1, 10, dimensions.length + 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[dimensions.width / 2 + 5, 5, 0]} receiveShadow>
        <boxGeometry args={[1, 10, dimensions.length + 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  );
}
