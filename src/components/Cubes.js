import React, { useState } from "react";
import { useGLTF, useCursor } from "@react-three/drei";
import { animated, useSpring, AnimatedValue } from "@react-spring/three";
import { useControls } from "leva";
import DissolveMaterial from "./DissolveMaterial";
import * as THREE from "three";

export function Cube(props) {
  const { nodes, materials } = useGLTF("./models/cubes/letters8.glb");
  const { itemDisplayed } = useControls({
    itemDisplayed: {
      value: "box",
      Options: ["box", "sphere"],
    },
  });
  const [cubeHovered, setHovered] = useState(false);
  useCursor(cubeHovered);

  // Initialize meshStates with a function to ensure nodes are loaded
  const [meshStates, setMeshStates] = useState(() => {
    const initialState = {};
    Object.keys(nodes).forEach((key) => {
      if (
        key.startsWith("can") ||
        key.startsWith("data") ||
        key.startsWith("when") ||
        key.startsWith("who") ||
        key.startsWith("dissapear") ||
        key.startsWith("magic") ||
        key.startsWith("make") ||
        key.startsWith("needs") ||
        key.startsWith("you")
      ) {
        initialState[key] = { rotation: [0, 0, 0] }; // Set initial rotation to zero
      }
    });
    return initialState;
  });

  // Function to handle click and rotate the clicked mesh
  const handleClick = (name) => {
    setMeshStates((prevStates) => {
      // Define the rotation sequence
      const sequence = [
        [0, Math.PI / 2, 0], // 90 degrees around Y
        [0, Math.PI, 0], // 180 degrees around Y
        [0, 1.5 * Math.PI, 0], // 270 degrees around Y
        [0, 0, Math.PI / 2], // 90 degrees around X
        [0, 0, Math.PI], // 180 degrees around X
        [0, 0, 1.5 * Math.PI], // 270 degrees around X
      ];

      // Find the next rotation in the sequence
      const currentRotation = prevStates[name].rotation;
      const currentIndex = sequence.findIndex((rot) =>
        rot.every((val, index) => val === currentRotation[index])
      );
      const nextIndex = (currentIndex + 1) % sequence.length;
      const nextRotation = sequence[nextIndex];

      return {
        ...prevStates,
        [name]: {
          rotation: nextRotation,
        },
      };
    });
  };
  const boxMaterial = new THREE.MeshStandardMaterial({ color: "white" });

  return (
    <group {...props} dispose={null} position={[0, 0, 0]}>
      {Object.entries(meshStates).map(([name, { rotation }]) => {
        const [spring, api] = useSpring(() => ({
          rotation,
          config: { mass: 5, tension: 400, friction: 50 },
        }));

        // Update spring when state changes
        api.start({ rotation });

        return (
          <animated.mesh
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            scale={1}
            key={name}
            name={name}
            geometry={nodes[name]?.geometry}
            onClick={() => handleClick(name)}
            rotation={spring.rotation}
            position={nodes[name]?.position}
          >
            <DissolveMaterial
              baseMaterial={boxMaterial}
              visible={itemDisplayed == "box"}
            />
          </animated.mesh>
        );
      })}
    </group>
  );
}
