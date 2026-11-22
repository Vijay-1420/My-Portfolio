"use client";

import { useEffect, useRef, useState } from "react";
import type * as ThreeTypes from "three";

interface ScreenPoint {
  x: number;
  y: number;
}

interface WebRipple extends ScreenPoint {
  startedAt: number;
  strength: number;
  meshIndex: number;
}

interface WebCenter {
  x: number;
  y: number;
  z: number;
  radius: number;
  layer: number;
}

interface CityWindow {
  position: [number, number, number];
  scale: [number, number, number];
  color: number;
}

interface PortalNode {
  label: string;
  section: string;
  mesh: ThreeTypes.Group;
  target: ThreeTypes.Mesh;
  material: ThreeTypes.MeshBasicMaterial;
  phase: number;
  base: ThreeTypes.Vector3;
}

const WEBGL_FALLBACK_LABEL =
  "WebGL is unavailable; the lightweight web canvas remains active.";

function randomGenerator(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function clearGroup(group: ThreeTypes.Group) {
  const geometries = new Set<ThreeTypes.BufferGeometry>();
  const materials = new Set<ThreeTypes.Material>();
  group.traverse((object) => {
    const renderable = object as ThreeTypes.Mesh;
    if (renderable.geometry) geometries.add(renderable.geometry);
    if (Array.isArray(renderable.material)) {
      renderable.material.forEach((material) => materials.add(material));
    } else if (renderable.material) {
      materials.add(renderable.material);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  group.clear();
}

export default function CinematicEnvironment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const compactQuery = window.matchMedia(
      "(max-width: 760px), (pointer: coarse)"
    );

    let disposed = false;
    let animationFrame = 0;
    let startupTimer = 0;
    let resizeTimer = 0;
    let loading = false;
    let renderer: ThreeTypes.WebGLRenderer | null = null;
    let scene: ThreeTypes.Scene | null = null;
    let camera: ThreeTypes.OrthographicCamera | null = null;
    let world: ThreeTypes.Group | null = null;
    let environmentObjects: PortalNode[] = [];
    let webLineLayers: Array<{
      base: Float32Array;
      position: ThreeTypes.BufferAttribute;
    }> = [];
    let webNodeLayers: Array<{
      base: Float32Array;
      position: ThreeTypes.BufferAttribute;
    }> = [];
    let particleBase = new Float32Array();
    let particlePosition: ThreeTypes.BufferAttribute | null = null;
    let energyLights: ThreeTypes.InstancedMesh | null = null;
    let energyTracks: Array<{
      center: WebCenter;
      angle: number;
      phase: number;
      speed: number;
    }> = [];
    let spiderGroup: ThreeTypes.Group | null = null;
    let spiderThread: ThreeTypes.BufferAttribute | null = null;
    let spiderThreadMaterial: ThreeTypes.LineBasicMaterial | null = null;
    let atmosphericMaterial: ThreeTypes.ShaderMaterial | null = null;
    let windowMaterials: ThreeTypes.MeshBasicMaterial[] = [];
    let rippleMeshes: ThreeTypes.Mesh[] = [];
    let worldWidth = 0;
    let worldHeight = 19;
    let scrollY = window.scrollY;
    let lastFrameTime = 0;
    let lastWindowFlicker = 0;
    let pointerActive = false;
    let pointerSpeed = 0;
    let previousPointer: ScreenPoint = { x: 0, y: 0 };
    let pointerWorld = { x: 0, y: 0 };
    let pointerNdc: ThreeTypes.Vector2 | null = null;
    let hoveredNode: PortalNode | null = null;
    let rippleCursor = 0;
    const ripples: WebRipple[] = [];
    const raycasterRef: { current: ThreeTypes.Raycaster | null } = {
      current: null,
    };
    const planeRef: { current: ThreeTypes.Plane | null } = { current: null };
    const intersectionRef: { current: ThreeTypes.Vector3 | null } = {
      current: null,
    };
    const dummyRef: { current: ThreeTypes.Object3D | null } = {
      current: null,
    };
    const projectionRef: { current: ThreeTypes.Vector3 | null } = {
      current: null,
    };
    const spiderMaterials: ThreeTypes.Material[] = [];
    const sceneLights: ThreeTypes.PointLight[] = [];

    const showFallback = (message: string) => {
      canvas.dataset.fallback = message;
      canvas.classList.remove("cinematic-environment--ready");
      document.documentElement.classList.remove("has-cinematic-3d");
    };

    const positionTooltip = (x: number, y: number) => {
      if (!tooltipRef.current) return;
      tooltipRef.current.style.left = `${Math.min(x + 16, window.innerWidth - 150)}px`;
      tooltipRef.current.style.top = `${Math.min(y + 16, window.innerHeight - 36)}px`;
    };

    const setHoveredNode = (
      node: PortalNode | null,
      x = previousPointer.x,
      y = previousPointer.y
    ) => {
      if (hoveredNode === node) {
        if (node) positionTooltip(x, y);
        return;
      }

      hoveredNode = node;
      setTooltip(node ? `OPEN ${node.label}` : null);
      if (node) window.requestAnimationFrame(() => positionTooltip(x, y));
      window.dispatchEvent(
        new CustomEvent("spider:cursor", {
          detail: { variant: node ? "button" : "" },
        })
      );
    };

    const buildEnvironment = (
      three: typeof import("three"),
      currentScene: ThreeTypes.Scene,
      currentWorld: ThreeTypes.Group,
      width: number,
      height: number
    ) => {
      clearGroup(currentWorld);
      environmentObjects = [];
      webLineLayers = [];
      webNodeLayers = [];
      energyTracks = [];
      windowMaterials = [];
      rippleMeshes = [];
      spiderMaterials.length = 0;
      sceneLights.length = 0;

      worldHeight = 19;
      worldWidth = worldHeight * (width / Math.max(height, 1));
      const random = randomGenerator(1420);
      const centers: WebCenter[] = [
        {
          x: -worldWidth * 0.23,
          y: worldHeight * 0.08,
          z: 5.2,
          radius: Math.min(worldWidth * 0.3, worldHeight * 0.43),
          layer: 0,
        },
        {
          x: worldWidth * 0.24,
          y: -worldHeight * 0.02,
          z: -3.4,
          radius: Math.min(worldWidth * 0.33, worldHeight * 0.46),
          layer: 1,
        },
        {
          x: -worldWidth * 0.02,
          y: -worldHeight * 0.12,
          z: -13.2,
          radius: Math.min(worldWidth * 0.4, worldHeight * 0.48),
          layer: 2,
        },
      ];

      const atmosphere = new three.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: three.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: new three.Vector2(0.5, 0.5) },
          uFlash: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision mediump float;
          varying vec2 vUv;
          uniform float uTime;
          uniform vec2 uPointer;
          uniform float uFlash;

          void main() {
            vec2 uv = vUv;
            float drift = sin(uv.x * 11.0 + uTime * 0.12 + sin(uv.y * 7.0 - uTime * 0.08)) * 0.5 + 0.5;
            float haze = smoothstep(0.18, 0.9, drift) * (1.0 - smoothstep(0.54, 1.0, abs(uv.y - 0.45)));
            float redGlow = exp(-length((uv - vec2(0.77, 0.48)) * vec2(1.4, 1.0)) * 3.8);
            float blueGlow = exp(-length((uv - vec2(0.21, 0.58)) * vec2(1.8, 1.0)) * 4.5);
            float pointerGlow = exp(-length((uv - uPointer) * vec2(1.3, 1.0)) * 6.0);
            vec3 color = vec3(0.32, 0.045, 0.085) * redGlow;
            color += vec3(0.07, 0.18, 0.29) * blueGlow;
            color += vec3(0.22, 0.19, 0.22) * haze;
            color += vec3(0.42, 0.24, 0.29) * pointerGlow * 0.12;
            color += vec3(0.35, 0.13, 0.2) * uFlash;
            float alpha = (redGlow * 0.19 + blueGlow * 0.12 + haze * 0.045 + pointerGlow * 0.025 + uFlash * 0.16);
            gl_FragColor = vec4(color, alpha);
          }
        `,
      });
      atmosphericMaterial = atmosphere;
      const atmospherePlane = new three.Mesh(
        new three.PlaneGeometry(worldWidth * 1.12, worldHeight * 1.12),
        atmosphere
      );
      atmospherePlane.position.set(0, 0, -22);
      currentWorld.add(atmospherePlane);

      currentScene.fog = new three.FogExp2(0x07080d, 0.025);
      const ambient = new three.AmbientLight(0x77809a, 0.44);
      currentWorld.add(ambient);
      const redLight = new three.PointLight(0xc6243a, 8, 24);
      redLight.position.set(worldWidth * 0.26, worldHeight * 0.16, 5);
      const blueLight = new three.PointLight(0x394b7a, 7, 28);
      blueLight.position.set(-worldWidth * 0.28, -worldHeight * 0.02, -4);
      currentWorld.add(redLight, blueLight);
      sceneLights.push(redLight, blueLight);

      const buildingGeometry = new three.BoxGeometry(1, 1, 1);
      const windowGeometry = new three.BoxGeometry(1, 1, 1);
      const windowColors = [0xe33c48, 0xb47c85, 0x6a83ae];
      const buildingMaterials = [
        new three.MeshBasicMaterial({ color: 0xffffff }),
        new three.MeshBasicMaterial({ color: 0xffffff }),
        new three.MeshBasicMaterial({ color: 0xffffff }),
      ];
      const floorY = -worldHeight * 0.51;
      const buildingCount = Math.max(28, Math.round(worldWidth * 1.28));

      for (let layer = 0; layer < 3; layer++) {
        const buildingMatrices: Array<{
          x: number;
          y: number;
          z: number;
          width: number;
          height: number;
          depth: number;
        }> = [];
        const windows: CityWindow[] = [];
        const depth = -7.5 - layer * 4.7;
        const cellWidth = worldWidth / buildingCount;

        for (let index = 0; index < buildingCount; index++) {
          const x = -worldWidth / 2 + (index + 0.5) * cellWidth;
          const widthFactor = 0.58 + random() * 0.52;
          const buildingWidth = cellWidth * widthFactor;
          const heightValue = 2.1 + random() * (layer === 0 ? 6.6 : 5.1);
          const buildingDepth = 1.1 + random() * 1.2;
          const buildingY = floorY + heightValue / 2;
          buildingMatrices.push({
            x,
            y: buildingY,
            z: depth,
            width: buildingWidth,
            height: heightValue,
            depth: buildingDepth,
          });

          const columns = Math.max(1, Math.floor(buildingWidth / 0.21));
          const rows = Math.max(2, Math.floor(heightValue / 0.56));
          for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
              if (random() < 0.32) continue;
              const windowIndex = Math.floor(random() * windowColors.length);
              const spacingX = buildingWidth / (columns + 1);
              windows.push({
                position: [
                  x - buildingWidth / 2 + spacingX * (column + 1),
                  floorY + 0.42 + row * 0.5,
                  depth + buildingDepth / 2 + 0.012,
                ],
                scale: [0.052 + random() * 0.025, 0.14, 0.022],
                color: windowColors[windowIndex],
              });
            }
          }
        }

        const buildings = new three.InstancedMesh(
          buildingGeometry,
          buildingMaterials[layer],
          buildingMatrices.length
        );
        const transform = new three.Object3D();
        buildingMatrices.forEach((building, index) => {
          transform.position.set(building.x, building.y, building.z);
          transform.scale.set(building.width, building.height, building.depth);
          transform.updateMatrix();
          buildings.setMatrixAt(index, transform.matrix);
          buildings.setColorAt(
            index,
            new three.Color().setHSL(
              0.62 + layer * 0.018,
              0.18 + random() * 0.12,
              0.055 + random() * 0.025
            )
          );
        });
        buildings.instanceMatrix.needsUpdate = true;
        currentWorld.add(buildings);

        const lights = new three.InstancedMesh(
          windowGeometry,
          new three.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: [0.72, 0.46, 0.3][layer],
            blending: three.AdditiveBlending,
            depthWrite: false,
          }),
          windows.length
        );
        windows.forEach((windowLight, index) => {
          transform.position.set(...windowLight.position);
          transform.scale.set(...windowLight.scale);
          transform.updateMatrix();
          lights.setMatrixAt(index, transform.matrix);
          lights.setColorAt(index, new three.Color(windowLight.color));
        });
        lights.instanceMatrix.needsUpdate = true;
        currentWorld.add(lights);
        windowMaterials.push(lights.material as ThreeTypes.MeshBasicMaterial);

        if (layer === 0) {
          const antennaPositions: number[] = [];
          for (let index = 2; index < buildingMatrices.length; index += 8) {
            const building = buildingMatrices[index];
            antennaPositions.push(
              building.x,
              building.y + building.height / 2,
              building.z + building.depth / 2,
              building.x,
              building.y + building.height / 2 + 0.45 + random() * 0.65,
              building.z + building.depth / 2
            );
          }
          const antennaGeometry = new three.BufferGeometry();
          antennaGeometry.setAttribute(
            "position",
            new three.Float32BufferAttribute(antennaPositions, 3)
          );
          currentWorld.add(
            new three.LineSegments(
              antennaGeometry,
              new three.LineBasicMaterial({
                color: 0x7d343e,
                transparent: true,
                opacity: 0.34,
              })
            )
          );
        }
      }

      const webBaseByLayer: number[][] = [[], [], []];
      const nodeBaseByLayer: number[][] = [[], [], []];
      const addCurve = (layer: number, points: number[][]) => {
        const target = webBaseByLayer[layer];
        for (let index = 0; index < points.length - 1; index++) {
          target.push(...points[index], ...points[index + 1]);
        }
      };

      centers.forEach((center, layer) => {
        const rayCount = 20;
        const ringCount = 8;
        const spokeCount = 28;
        const angleOffset = layer * 0.16;

        for (let ray = 0; ray < rayCount; ray++) {
          const angle = (Math.PI * 2 * ray) / rayCount + angleOffset;
          const points: number[][] = [];
          for (let step = 0; step <= spokeCount; step++) {
            const progress = step / spokeCount;
            const tangent = Math.sin(progress * Math.PI * 4 + angle * 2) * 0.055;
            const radius = center.radius * progress;
            points.push([
              center.x + Math.cos(angle) * radius - Math.sin(angle) * tangent,
              center.y + Math.sin(angle) * radius + Math.cos(angle) * tangent,
              center.z + Math.sin(progress * Math.PI * 2 + angle) * 0.035,
            ]);
          }
          addCurve(layer, points);
          if (ray % 2 === 0) {
            energyTracks.push({
              center,
              angle,
              phase: random(),
              speed: 0.12 + random() * 0.1,
            });
          }
        }

        for (let ring = 1; ring <= ringCount; ring++) {
          const radius = center.radius * Math.pow(ring / ringCount, 1.06);
          const segmentsPerArc = 9;
          for (let segment = 0; segment < rayCount; segment++) {
            const startAngle =
              (Math.PI * 2 * segment) / rayCount + angleOffset;
            const endAngle =
              (Math.PI * 2 * (segment + 1)) / rayCount + angleOffset;
            const middleAngle = (startAngle + endAngle) / 2;
            const controlRadius = radius * 0.93;
            const start = [
              center.x + Math.cos(startAngle) * radius,
              center.y + Math.sin(startAngle) * radius,
              center.z,
            ];
            const control = [
              center.x + Math.cos(middleAngle) * controlRadius,
              center.y + Math.sin(middleAngle) * controlRadius,
              center.z + 0.035,
            ];
            const end = [
              center.x + Math.cos(endAngle) * radius,
              center.y + Math.sin(endAngle) * radius,
              center.z,
            ];
            const points: number[][] = [];

            for (let step = 0; step <= segmentsPerArc; step++) {
              const t = step / segmentsPerArc;
              const inverse = 1 - t;
              points.push([
                inverse * inverse * start[0] +
                  2 * inverse * t * control[0] +
                  t * t * end[0],
                inverse * inverse * start[1] +
                  2 * inverse * t * control[1] +
                  t * t * end[1],
                inverse * inverse * start[2] +
                  2 * inverse * t * control[2] +
                  t * t * end[2],
              ]);
            }
            addCurve(layer, points);
            nodeBaseByLayer[layer].push(...end);
          }
        }
      });

      const lineColors = [0xe04952, 0xb9c2d6, 0x756da6];
      const lineOpacities = [0.34, 0.24, 0.18];
      webBaseByLayer.forEach((baseValues, layer) => {
        const base = new Float32Array(baseValues);
        const geometry = new three.BufferGeometry();
        const position = new three.BufferAttribute(new Float32Array(base), 3);
        position.setUsage(three.DynamicDrawUsage);
        geometry.setAttribute("position", position);
        const lines = new three.LineSegments(
          geometry,
          new three.LineBasicMaterial({
            color: lineColors[layer],
            transparent: true,
            opacity: lineOpacities[layer],
            blending: three.AdditiveBlending,
            depthWrite: false,
          })
        );
        lines.frustumCulled = false;
        currentWorld.add(lines);
        webLineLayers.push({ base, position });
      });

      const nodeColors = [0xf0ced0, 0xcad3e6, 0xe75a67];
      nodeBaseByLayer.forEach((baseValues, layer) => {
        const base = new Float32Array(baseValues);
        const colors = new Float32Array(base.length);
        const color = new three.Color(nodeColors[layer]);
        for (let index = 0; index < base.length; index += 3) {
          const variation = 0.65 + random() * 0.35;
          colors[index] = color.r * variation;
          colors[index + 1] = color.g * variation;
          colors[index + 2] = color.b * variation;
        }
        const geometry = new three.BufferGeometry();
        const position = new three.BufferAttribute(new Float32Array(base), 3);
        position.setUsage(three.DynamicDrawUsage);
        geometry.setAttribute("position", position);
        geometry.setAttribute("color", new three.Float32BufferAttribute(colors, 3));
        const nodes = new three.Points(
          geometry,
          new three.PointsMaterial({
            size: layer === 0 ? 1.8 : 1.45,
            sizeAttenuation: false,
            vertexColors: true,
            transparent: true,
            opacity: 0.72 - layer * 0.12,
            blending: three.AdditiveBlending,
            depthWrite: false,
          })
        );
        nodes.frustumCulled = false;
        currentWorld.add(nodes);
        webNodeLayers.push({ base, position });
      });

      const particleCount = Math.min(260, Math.round(worldWidth * 8));
      particleBase = new Float32Array(particleCount * 3);
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);
      for (let index = 0; index < particleCount; index++) {
        const offset = index * 3;
        particleBase[offset] = (random() - 0.5) * worldWidth;
        particleBase[offset + 1] = (random() - 0.5) * worldHeight;
        particleBase[offset + 2] = -17 + random() * 27;
        particlePositions.set(particleBase.subarray(offset, offset + 3), offset);
        const color = new three.Color(
          [0xc1bdce, 0x9e5066, 0x7488bb][index % 3]
        );
        particleColors[offset] = color.r;
        particleColors[offset + 1] = color.g;
        particleColors[offset + 2] = color.b;
      }
      const particleGeometry = new three.BufferGeometry();
      particlePosition = new three.BufferAttribute(particlePositions, 3);
      particlePosition.setUsage(three.DynamicDrawUsage);
      particleGeometry.setAttribute("position", particlePosition);
      particleGeometry.setAttribute(
        "color",
        new three.Float32BufferAttribute(particleColors, 3)
      );
      currentWorld.add(
        new three.Points(
          particleGeometry,
          new three.PointsMaterial({
            size: 2,
            sizeAttenuation: false,
            vertexColors: true,
            transparent: true,
            opacity: 0.52,
            blending: three.AdditiveBlending,
            depthWrite: false,
          })
        )
      );

      const energyGeometry = new three.SphereGeometry(0.043, 6, 5);
      const energyMaterial = new three.MeshBasicMaterial({
        color: 0xff5264,
        transparent: true,
        opacity: 0.9,
        blending: three.AdditiveBlending,
        depthWrite: false,
      });
      energyLights = new three.InstancedMesh(
        energyGeometry,
        energyMaterial,
        energyTracks.length
      );
      currentWorld.add(energyLights);

      const objectDefinitions = [
        {
          label: "ABOUT",
          section: "about",
          color: 0xe2d5d7,
          x: -worldWidth * 0.36,
          y: -worldHeight * 0.12,
          z: 4.8,
          shape: "octahedron",
        },
        {
          label: "SKILLS",
          section: "skills",
          color: 0xdb5260,
          x: worldWidth * 0.35,
          y: worldHeight * 0.23,
          z: 0.2,
          shape: "icosahedron",
        },
        {
          label: "PROJECTS",
          section: "projects",
          color: 0xabbad7,
          x: worldWidth * 0.33,
          y: -worldHeight * 0.2,
          z: -3.2,
          shape: "dodecahedron",
        },
        {
          label: "JOURNEY",
          section: "journey",
          color: 0x8e78af,
          x: -worldWidth * 0.18,
          y: worldHeight * 0.34,
          z: -5.5,
          shape: "tetrahedron",
        },
        {
          label: "CONTACT",
          section: "contact",
          color: 0xe0a1a1,
          x: worldWidth * 0.12,
          y: -worldHeight * 0.38,
          z: 2.8,
          shape: "torus",
        },
      ];

      for (const [index, definition] of objectDefinitions.entries()) {
        const group = new three.Group();
        const geometry =
          definition.shape === "icosahedron"
            ? new three.IcosahedronGeometry(0.28, 0)
            : definition.shape === "dodecahedron"
              ? new three.DodecahedronGeometry(0.27, 0)
              : definition.shape === "tetrahedron"
                ? new three.TetrahedronGeometry(0.3, 0)
                : definition.shape === "torus"
                  ? new three.TorusGeometry(0.24, 0.025, 5, 28)
                  : new three.OctahedronGeometry(0.29, 0);
        const material = new three.MeshBasicMaterial({
          color: definition.color,
          wireframe: true,
          transparent: true,
          opacity: 0.78,
          blending: three.AdditiveBlending,
          depthWrite: false,
        });
        const target = new three.Mesh(geometry, material);
        target.userData.section = definition.section;
        target.userData.label = definition.label;
        target.userData.portalNode = true;
        group.add(target);
        const orbit = new three.Mesh(
          new three.TorusGeometry(0.42, 0.006, 3, 40),
          new three.MeshBasicMaterial({
            color: definition.color,
            transparent: true,
            opacity: 0.34,
            blending: three.AdditiveBlending,
            depthWrite: false,
          })
        );
        orbit.rotation.x = Math.PI * 0.5;
        orbit.rotation.y = 0.4 + index * 0.24;
        group.add(orbit);
        group.position.set(definition.x, definition.y, definition.z);
        currentWorld.add(group);
        environmentObjects.push({
          label: definition.label,
          section: definition.section,
          mesh: group,
          target,
          material,
          phase: random() * Math.PI * 2,
          base: group.position.clone(),
        });
      }

      const rippleGeometry = new three.RingGeometry(0.94, 1, 64);
      for (let index = 0; index < 3; index++) {
        const rippleMaterial = new three.MeshBasicMaterial({
          color: index === 1 ? 0xf1d9df : 0xe64254,
          transparent: true,
          opacity: 0,
          side: three.DoubleSide,
          blending: three.AdditiveBlending,
          depthWrite: false,
        });
        const rippleMesh = new three.Mesh(rippleGeometry, rippleMaterial);
        rippleMesh.position.z = 8.5 + index * 0.01;
        currentWorld.add(rippleMesh);
        rippleMeshes.push(rippleMesh);
      }

      const bodyMaterial = new three.MeshStandardMaterial({
        color: 0x1b1118,
        metalness: 0.64,
        roughness: 0.32,
        emissive: 0x9b192a,
        emissiveIntensity: 0.72,
        transparent: true,
      });
      const legMaterial = new three.MeshBasicMaterial({
        color: 0xd9c3c6,
        transparent: true,
        opacity: 0.76,
      });
      spiderMaterials.push(bodyMaterial, legMaterial);
      spiderGroup = new three.Group();
      const body = new three.Mesh(
        new three.SphereGeometry(0.17, 12, 9),
        bodyMaterial
      );
      body.scale.set(0.78, 1.28, 0.75);
      spiderGroup.add(body);
      const head = new three.Mesh(
        new three.SphereGeometry(0.09, 10, 8),
        new three.MeshStandardMaterial({
          color: 0x30111b,
          emissive: 0x6e101d,
          emissiveIntensity: 0.9,
          metalness: 0.5,
          roughness: 0.3,
          transparent: true,
        })
      );
      spiderMaterials.push(head.material as ThreeTypes.Material);
      head.position.y = 0.22;
      spiderGroup.add(head);
      for (let leg = 0; leg < 8; leg++) {
        const side = leg < 4 ? -1 : 1;
        const row = leg % 4;
        const direction = row < 2 ? 1 : -1;
        const start = new three.Vector3(side * 0.08, 0.08 - row * 0.04, 0);
        const middle = new three.Vector3(
          side * (0.23 + row * 0.035),
          0.1 + direction * 0.1,
          0.025
        );
        const end = new three.Vector3(
          side * (0.36 + row * 0.045),
          direction * (0.17 + row * 0.025),
          0.03
        );
        const curve = new three.CatmullRomCurve3([start, middle, end]);
        spiderGroup.add(
          new three.Mesh(
            new three.TubeGeometry(curve, 8, 0.009, 4, false),
            legMaterial
          )
        );
      }
      currentWorld.add(spiderGroup);
      const threadGeometry = new three.BufferGeometry();
      const threadPositions = new Float32Array(6);
      threadGeometry.setAttribute(
        "position",
        new three.BufferAttribute(threadPositions, 3)
      );
      spiderThread = threadGeometry.getAttribute(
        "position"
      ) as ThreeTypes.BufferAttribute;
      spiderThreadMaterial = new three.LineBasicMaterial({
        color: 0xe3d9dc,
        transparent: true,
        opacity: 0.46,
        blending: three.AdditiveBlending,
        depthWrite: false,
      });
      currentWorld.add(
        new three.Line(threadGeometry, spiderThreadMaterial)
      );
    };

    const toWorldPoint = (x: number, y: number) => {
      if (
        !camera ||
        !raycasterRef.current ||
        !planeRef.current ||
        !intersectionRef.current ||
        !pointerNdc
      ) {
        return { x: 0, y: 0 };
      }
      pointerNdc.set((x / window.innerWidth) * 2 - 1, 1 - (y / window.innerHeight) * 2);
      raycasterRef.current.setFromCamera(pointerNdc, camera);
      const intersection = raycasterRef.current.ray.intersectPlane(
        planeRef.current,
        intersectionRef.current
      );
      return intersection
        ? { x: intersection.x, y: intersection.y }
        : { x: 0, y: 0 };
    };

    const findPortalNode = (x: number, y: number) => {
      if (!camera || !world || !projectionRef.current) return null;
      camera.updateMatrixWorld();
      world.updateMatrixWorld(true);
      let nearest: PortalNode | null = null;
      let nearestDistance = 36;

      for (const node of environmentObjects) {
        node.mesh.getWorldPosition(projectionRef.current);
        projectionRef.current.project(camera);
        const screenX =
          (projectionRef.current.x * 0.5 + 0.5) * window.innerWidth;
        const screenY =
          (0.5 - projectionRef.current.y * 0.5) * window.innerHeight;
        const distance = Math.hypot(x - screenX, y - screenY);
        if (projectionRef.current.z < -1 || projectionRef.current.z > 1) {
          continue;
        }
        if (distance < nearestDistance) {
          nearest = node;
          nearestDistance = distance;
        }
      }
      return nearest;
    };

    const addRipple = (x: number, y: number, strength = 1) => {
      const point = toWorldPoint(x, y);
      const meshIndex = rippleCursor % 3;
      rippleCursor += 1;
      const target = rippleMeshes[meshIndex];
      if (!target) return;
      target.position.set(point.x, point.y, 8.5 + meshIndex * 0.01);
      target.scale.setScalar(0.02);
      (target.material as ThreeTypes.MeshBasicMaterial).opacity = 0.76;
      ripples.push({
        ...point,
        startedAt: performance.now(),
        strength,
        meshIndex,
      });
      while (ripples.length > 3) ripples.shift();
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerActive = true;
      const dx = event.clientX - previousPointer.x;
      const dy = event.clientY - previousPointer.y;
      pointerSpeed = Math.min(1200, Math.hypot(dx, dy) * 60);
      previousPointer = { x: event.clientX, y: event.clientY };
      pointerWorld = toWorldPoint(event.clientX, event.clientY);

      if (!camera || !pointerNdc) return;
      pointerNdc.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        1 - (event.clientY / window.innerHeight) * 2
      );
      const node = findPortalNode(event.clientX, event.clientY);
      setHoveredNode(node, event.clientX, event.clientY);
    };

    const handlePointerLeave = () => {
      pointerActive = false;
      pointerSpeed = 0;
      setHoveredNode(null);
    };

    const handleRipple = (event: Event) => {
      const detail = (event as CustomEvent<ScreenPoint & { strength?: number }>).detail;
      if (
        !detail ||
        !Number.isFinite(detail.x) ||
        !Number.isFinite(detail.y)
      ) {
        return;
      }
      addRipple(detail.x, detail.y, detail.strength ?? 1);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target =
        event.target instanceof Element ? event.target : null;
      if (target?.closest("a, button, input, textarea, select, [role='button']")) {
        return;
      }
      window.dispatchEvent(
        new CustomEvent("spider:ripple", {
          detail: { x: event.clientX, y: event.clientY, strength: 1 },
        })
      );
    };

    const handleClick = (event: MouseEvent) => {
      if (
        !camera ||
        !world ||
        event.detail === 0 ||
        !(event.target instanceof Element) ||
        event.target.closest("a, button, input, textarea, select, [role='button']")
      ) {
        return;
      }
      const node = findPortalNode(event.clientX, event.clientY);
      if (!node) return;
      const variants: Record<string, "pull" | "expansion" | "energy" | "shatter" | "spider"> = {
        about: "pull",
        skills: "expansion",
        projects: "energy",
        journey: "shatter",
        contact: "spider",
      };
      window.dispatchEvent(
        new CustomEvent("spider:transition", {
          detail: {
            type: "section",
            variant: variants[node.section] ?? "expansion",
            x: event.clientX,
            y: event.clientY,
          },
        })
      );
      document.getElementById(node.section)?.scrollIntoView({
        behavior: motionQuery.matches ? "auto" : "smooth",
        block: "start",
      });
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleVisibility = () => {
      cancelAnimationFrame(animationFrame);
      if (
        !document.hidden &&
        !disposed &&
        !motionQuery.matches &&
        !compactQuery.matches
      ) {
        lastFrameTime = 0;
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const handleQualityChange = () => {
      cancelAnimationFrame(animationFrame);
      if (motionQuery.matches || compactQuery.matches) {
        if (startupTimer) {
          window.clearTimeout(startupTimer);
          startupTimer = 0;
          loading = false;
        }
        canvas.style.display = "none";
        if (renderer) {
          canvas.classList.remove("cinematic-environment--ready");
        }
        document.documentElement.classList.remove("has-cinematic-3d");
        setHoveredNode(null);
      } else {
        canvas.style.display = "";
        if (renderer) {
          canvas.classList.add("cinematic-environment--ready");
          document.documentElement.classList.add("has-cinematic-3d");
          lastFrameTime = 0;
          animationFrame = requestAnimationFrame(animate);
        } else {
          startEnvironment();
        }
      }
    };

    const resize = () => {
      if (!renderer || !camera || !scene || !world || !threeModule) return;
      const three = threeModule;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.35)
      );
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      worldWidth = worldHeight * (window.innerWidth / Math.max(window.innerHeight, 1));
      camera.left = -worldWidth / 2;
      camera.right = worldWidth / 2;
      camera.top = worldHeight / 2;
      camera.bottom = -worldHeight / 2;
      camera.updateProjectionMatrix();
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!disposed && scene && world) {
          buildEnvironment(
            three,
            scene,
            world,
            window.innerWidth,
            window.innerHeight
          );
        }
      }, 120);
    };

    let threeModule: typeof import("three") | null = null;

    const animate = (time: number) => {
      if (
        disposed ||
        document.hidden ||
        motionQuery.matches ||
        compactQuery.matches ||
        !renderer ||
        !scene ||
        !camera ||
        !world ||
        !pointerNdc
      ) {
        return;
      }
      animationFrame = requestAnimationFrame(animate);
      if (time - lastFrameTime < 19) return;
      const delta = Math.min((time - (lastFrameTime || time)) / 1000, 0.045);
      lastFrameTime = time;
      const elapsed = time * 0.001;
      const pointerInfluence = pointerActive ? 1 : 0;

      camera.position.x +=
        (pointerNdc.x * worldWidth * 0.012 - camera.position.x) * 0.018;
      camera.position.y +=
        (pointerNdc.y * 0.12 + scrollY * 0.00012 - camera.position.y) * 0.016;
      camera.lookAt(0, camera.position.y, 0);

      if (atmosphericMaterial) {
        atmosphericMaterial.uniforms.uTime.value = elapsed;
        atmosphericMaterial.uniforms.uPointer.value.set(
          pointerNdc.x * 0.5 + 0.5,
          pointerNdc.y * 0.5 + 0.5
        );
        const flash = Math.pow(
          Math.max(0, Math.sin(elapsed * 0.27 + 1.3)),
          92
        );
        atmosphericMaterial.uniforms.uFlash.value = flash * 0.16;
      }

      const pointerMotion = Math.min(pointerSpeed / 1000, 1.35);
      const deform = (
        base: Float32Array,
        position: ThreeTypes.BufferAttribute,
        layer: number,
        isNode = false
      ) => {
        const array = position.array as Float32Array;
        const layerDepth = 1 - layer * 0.24;
        const rippleStates = ripples.map((ripple) => {
          const age = Math.max(0, (time - ripple.startedAt) / 1000);
          return {
            ...ripple,
            age,
            radius: age * 4.5,
            strength: ripple.strength * Math.exp(-age * 3.2),
          };
        });

        for (let offset = 0; offset < base.length; offset += 3) {
          const x = base[offset];
          const y = base[offset + 1];
          const z = base[offset + 2];
          const dx = x - pointerWorld.x;
          const dy = y - pointerWorld.y;
          const distance = Math.hypot(dx, dy);
          const falloff =
            pointerInfluence && distance < 3.2
              ? Math.pow(1 - distance / 3.2, 2)
              : 0;
          const push =
            falloff * (isNode ? 0.38 : 0.23) * (1 + pointerMotion * 0.72) * layerDepth;
          let nextX = x + (distance ? (dx / distance) * push : 0);
          let nextY = y + (distance ? (dy / distance) * push : 0);
          const nextZ =
            z +
            Math.sin(elapsed * (0.75 + layer * 0.14) + offset * 0.017) *
              (isNode ? 0.035 : 0.018);

          if (falloff) {
            const tangent = Math.sin(elapsed * 1.6 + x * 0.8 + y * 0.5);
            nextX += (-dy / (distance || 1)) * tangent * push * 0.48;
            nextY += (dx / (distance || 1)) * tangent * push * 0.48;
          }

          for (const ripple of rippleStates) {
            const rippleDistance = Math.hypot(x - ripple.x, y - ripple.y);
            const wave = Math.sin((rippleDistance - ripple.radius) * 3.1);
            const envelope = Math.exp(-Math.abs(rippleDistance - ripple.radius) * 1.5);
            const impulse = wave * envelope * ripple.strength * layerDepth * 0.085;
            const normalized = rippleDistance || 1;
            nextX += ((x - ripple.x) / normalized) * impulse;
            nextY += ((y - ripple.y) / normalized) * impulse;
          }

          array[offset] = nextX;
          array[offset + 1] = nextY;
          array[offset + 2] = nextZ;
        }
        position.needsUpdate = true;
      };

      webLineLayers.forEach((layer, index) =>
        deform(layer.base, layer.position, index)
      );
      webNodeLayers.forEach((layer, index) =>
        deform(layer.base, layer.position, index, true)
      );

      if (particlePosition) {
        const positions = particlePosition.array as Float32Array;
        const count = particleBase.length / 3;
        for (let index = 0; index < count; index++) {
          const offset = index * 3;
          const baseX = particleBase[offset];
          const baseY = particleBase[offset + 1];
          const dx = baseX - pointerWorld.x;
          const dy = baseY - pointerWorld.y;
          const distance = Math.hypot(dx, dy);
          const reaction =
            pointerInfluence && distance < 2.7
              ? Math.pow(1 - distance / 2.7, 2) * (0.56 + pointerMotion * 0.46)
              : 0;
          positions[offset] =
            baseX +
            Math.sin(elapsed * (0.28 + index % 5 * 0.025) + index) * 0.16 +
            (distance ? (dx / distance) * reaction : 0);
          positions[offset + 1] =
            particleBase[offset + 1] +
            Math.cos(elapsed * (0.21 + index % 7 * 0.02) + index * 0.7) * 0.13 +
            (distance ? (dy / distance) * reaction : 0);
          positions[offset + 2] = particleBase[offset + 2] + Math.sin(elapsed + index) * 0.12;
        }
        particlePosition.needsUpdate = true;
      }

      if (energyLights && dummyRef.current) {
        energyTracks.forEach((track, index) => {
          const progress = (elapsed * track.speed + track.phase) % 1;
          const radius = track.center.radius * (0.1 + progress * 0.86);
          const angle = track.angle + Math.sin(elapsed + track.phase) * 0.008;
          dummyRef.current!.position.set(
            track.center.x + Math.cos(angle) * radius,
            track.center.y + Math.sin(angle) * radius,
            track.center.z + 0.04
          );
          const glow = 0.75 + Math.sin(elapsed * 4 + track.phase) * 0.25;
          dummyRef.current!.scale.setScalar(glow);
          dummyRef.current!.updateMatrix();
          energyLights!.setMatrixAt(index, dummyRef.current!.matrix);
        });
        energyLights.instanceMatrix.needsUpdate = true;
      }

      environmentObjects.forEach((node) => {
        const isHovered = hoveredNode === node;
        const targetScale = isHovered ? 1.32 : 1;
        const currentScale = node.mesh.scale.x;
        const nextScale = currentScale + (targetScale - currentScale) * 0.13;
        node.mesh.scale.setScalar(nextScale);
        node.mesh.position.y =
          node.base.y + Math.sin(elapsed * 0.65 + node.phase) * 0.075;
        node.mesh.rotation.y += delta * (isHovered ? 0.9 : 0.2);
        node.mesh.rotation.x += delta * (isHovered ? 0.55 : 0.11);
        node.material.opacity =
          (isHovered ? 1 : 0.7) + Math.sin(elapsed * 2 + node.phase) * 0.06;
      });

      if (spiderGroup && spiderThread) {
        const drop = Math.min(1, elapsed / 1.85);
        const easedDrop = 1 - Math.pow(1 - drop, 3);
        const anchorY = worldHeight * 0.13;
        spiderGroup.position.set(
          worldWidth * 0.24,
          anchorY + (1 - easedDrop) * 2.6 + Math.sin(elapsed * 1.05) * 0.045,
          6.1
        );
        const fade = Math.max(0, 1 - Math.max(0, scrollY / (window.innerHeight * 1.9)));
        spiderGroup.visible = fade > 0.01;
        spiderMaterials.forEach((material) => {
          const candidate = material as ThreeTypes.Material & { opacity?: number };
          if ("opacity" in candidate) candidate.opacity = 0.76 * fade;
        });
        if (spiderThreadMaterial) spiderThreadMaterial.opacity = 0.46 * fade;
        const topY = worldHeight * 0.5 + 0.8;
        const thread = spiderThread.array as Float32Array;
        thread[0] = worldWidth * 0.24;
        thread[1] = topY;
        thread[2] = 6.1;
        thread[3] = spiderGroup.position.x;
        thread[4] = spiderGroup.position.y + 0.26;
        thread[5] = spiderGroup.position.z;
        spiderThread.needsUpdate = true;
      }

      for (const ripple of ripples) {
        const age = (time - ripple.startedAt) / 1000;
        const target = rippleMeshes[ripple.meshIndex];
        if (!target) continue;
        const progress = Math.min(age / 0.92, 1);
        target.scale.setScalar(0.02 + progress * 3.1);
        (target.material as ThreeTypes.MeshBasicMaterial).opacity =
          Math.max(0, (1 - progress) * 0.72 * ripple.strength);
      }
      for (let index = ripples.length - 1; index >= 0; index--) {
        if (time - ripples[index].startedAt > 920) ripples.splice(index, 1);
      }

      if (time - lastWindowFlicker > 240) {
        windowMaterials.forEach((material, index) => {
          material.opacity =
            [0.63, 0.4, 0.27][index] +
            Math.sin(elapsed * (0.45 + index * 0.12) + index * 2) * 0.055;
        });
        sceneLights.forEach((light, index) => {
          light.intensity =
            (index === 0 ? 8 : 7) +
            Math.sin(elapsed * 0.55 + index * 4) * 0.65 +
            pointerMotion * 0.45;
        });
        lastWindowFlicker = time;
      }

      pointerSpeed *= 0.88;
      renderer.render(scene, camera);
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(animationFrame);
      showFallback("WebGL context lost; the lightweight web canvas remains active.");
    };

    const initialize = async () => {
      const three = await import("three");
      threeModule = three;
      if (disposed || motionQuery.matches || compactQuery.matches) return;

      try {
        renderer = new three.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: (window.devicePixelRatio || 1) <= 1.5,
          powerPreference: "low-power",
          stencil: false,
        });
      } catch (error) {
        console.warn("Three.js could not start; using the lightweight web canvas.", error);
        showFallback(WEBGL_FALLBACK_LABEL);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = three.SRGBColorSpace;
      renderer.toneMapping = three.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      worldWidth =
        worldHeight * (window.innerWidth / Math.max(window.innerHeight, 1));
      scene = new three.Scene();
      camera = new three.OrthographicCamera(
        -worldWidth / 2,
        worldWidth / 2,
        worldHeight / 2,
        -worldHeight / 2,
        0.1,
        80
      );
      camera.position.set(0, 0, 30);
      camera.lookAt(0, 0, 0);
      world = new three.Group();
      scene.add(world);
      raycasterRef.current = new three.Raycaster();
      planeRef.current = new three.Plane(
        new three.Vector3(0, 0, 1),
        0
      );
      intersectionRef.current = new three.Vector3();
      pointerNdc = new three.Vector2(-2, -2);
      dummyRef.current = new three.Object3D();
      projectionRef.current = new three.Vector3();
      buildEnvironment(
        three,
        scene,
        world,
        window.innerWidth,
        window.innerHeight
      );
      canvas.dataset.fallback = "";
      canvas.classList.add("cinematic-environment--ready");
      document.documentElement.classList.add("has-cinematic-3d");
      canvas.addEventListener("webglcontextlost", handleContextLost, false);
      window.addEventListener("resize", resize, { passive: true });
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerleave", handlePointerLeave);
      window.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("spider:ripple", handleRipple);
      window.addEventListener("click", handleClick);
      window.addEventListener("scroll", handleScroll, { passive: true });
      document.addEventListener("visibilitychange", handleVisibility);
      animationFrame = requestAnimationFrame(animate);
    };

    const startEnvironment = () => {
      if (
        disposed ||
        loading ||
        renderer ||
        motionQuery.matches ||
        compactQuery.matches
      ) {
        return;
      }
      loading = true;
      startupTimer = window.setTimeout(() => {
        startupTimer = 0;
        void initialize()
          .catch((error: unknown) => {
            if (!disposed) {
              console.error(
                "Failed to load the Three.js cinematic environment.",
                error
              );
            }
          })
          .finally(() => {
            loading = false;
          });
      }, 180);
    };

    motionQuery.addEventListener("change", handleQualityChange);
    compactQuery.addEventListener("change", handleQualityChange);
    if (motionQuery.matches || compactQuery.matches) {
      canvas.style.display = "none";
    } else {
      startEnvironment();
    }

    return () => {
      disposed = true;
      window.clearTimeout(startupTimer);
      window.clearTimeout(resizeTimer);
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("spider:ripple", handleRipple);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleQualityChange);
      compactQuery.removeEventListener("change", handleQualityChange);
      window.dispatchEvent(
        new CustomEvent("spider:cursor", { detail: { variant: "" } })
      );
      document.documentElement.classList.remove("has-cinematic-3d");
      if (world) clearGroup(world);
      renderer?.dispose();
      renderer = null;
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="cinematic-environment"
        aria-hidden="true"
      />
      {tooltip && (
        <div
          ref={tooltipRef}
          className="environment-tooltip"
          aria-hidden="true"
        >
          <span className="environment-tooltip__dot" />
          {tooltip}
        </div>
      )}
    </>
  );
}
