import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Shield, Eye, Lock } from 'lucide-react';

function ProceduralShieldMesh() {
  const meshRef = useRef();
  const ringRef = useRef();
  const innerLensRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.3;
      ringRef.current.rotation.z += delta * 0.2;
    }
    if (innerLensRef.current) {
      innerLensRef.current.rotation.y -= delta * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Protective Geometric Torus / Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#0F766E"
          metalness={0.8}
          roughness={0.2}
          emissive="#0F766E"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Secondary Orbital Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.7, 0.04, 16, 64]} />
        <meshStandardMaterial
          color="#1D4ED8"
          metalness={0.9}
          roughness={0.1}
          emissive="#1D4ED8"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Center Crystalline Lens Core */}
      <mesh ref={innerLensRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshPhysicalMaterial
          color="#0EA5E9"
          transmission={0.6}
          opacity={1}
          transparent
          roughness={0.1}
          ior={1.5}
          reflectivity={0.9}
          clearcoat={1}
        />
      </mesh>

      {/* Small floating security orbs */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <mesh position={[1.4, 0.8, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.8} />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={2}>
        <mesh position={[-1.3, -0.7, 0.5]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#0F766E" emissive="#0F766E" emissiveIntensity={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

function FallbackShieldIllustration() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-50/50 to-slate-100 rounded-3xl border border-slate-200 shadow-inner">
      <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-primary to-accent-blue flex items-center justify-center text-white shadow-xl shadow-primary/20 animate-pulse">
        <Shield className="w-20 h-20 stroke-[1.5]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Eye className="w-8 h-8 text-white/90" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-mono font-semibold text-primary">
        <Lock className="w-3.5 h-3.5" />
        <span>TRUSTLENSE CRYPTOGRAPHIC ENGINE</span>
      </div>
    </div>
  );
}

export default function Shield3D() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL || hasError) {
    return <FallbackShieldIllustration />;
  }

  return (
    <div className="w-full h-[360px] sm:h-[420px] relative">
      <Suspense fallback={<FallbackShieldIllustration />}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 4.5], fov: 45 }}
          onError={() => setHasError(true)}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 5]} intensity={2.5} color="#FFFFFF" />
          <directionalLight position={[-10, -10, -5]} intensity={1.2} color="#0EA5E9" />
          <pointLight position={[0, 0, 2]} intensity={1.5} color="#0F766E" />
          <ProceduralShieldMesh />
        </Canvas>
      </Suspense>
    </div>
  );
}
