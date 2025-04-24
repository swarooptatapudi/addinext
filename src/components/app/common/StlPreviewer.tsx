'use client';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Grid, Environment, Bounds } from '@react-three/drei';
import { Suspense, useState, useRef } from 'react';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function Model({ url, fileType }: { url: string; fileType: string }) {
  switch (fileType) {
    case '.stl':
      const stl = useLoader(STLLoader, url);
      return (
        <mesh geometry={stl} scale={0.5} castShadow receiveShadow>
          <meshStandardMaterial color="#ccc" />
        </mesh>
      );
    case '.obj':
      const obj = useLoader(OBJLoader, url);
      return <primitive object={obj} scale={0.5} />;
    case '.ply':
      const ply = useLoader(PLYLoader, url);
      return (
        <mesh geometry={ply} scale={0.5} castShadow receiveShadow>
          <meshStandardMaterial color="#ccc" />
        </mesh>
      );
    default:
      return null;
  }
}

function AutoRotateOrbitControls() {
  const controlsRef = useRef<any>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  useFrame(() => {
    if (controlsRef.current && isAutoRotating) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 1.2;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      autoRotate={isAutoRotating}
      autoRotateSpeed={1.5}
      onStart={() => setIsAutoRotating(false)}
      onEnd={() => setIsAutoRotating(true)}
    />
  );
}

function ModelViewerR3F({ fileUrl, fileType }: { fileUrl: string; fileType: string }) {
  if (!fileUrl) return null;

  return (
    <div style={{ height: 400 }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 100], fov: 70 }}
        style={{ background: '#f8f8f8', borderRadius: 8 }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight castShadow position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={<Html center><p>Loading 3Dmodel...</p></Html>}>
          <Bounds fit clip margin={1.2}>
            <Model url={fileUrl} fileType={fileType} />
          </Bounds>
        </Suspense>

        <AutoRotateOrbitControls />
        <Grid cellSize={1} sectionColor="#444" fadeDistance={30} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

type ModelFilePickerProps = {
  label?: string;
  buttonText?: string;
  onFileSelect?: (file: File | null) => void;
};

export default function ModelFilePicker({
  label = 'Select Scan',
  buttonText = 'Upload Scan File',
  onFileSelect,
}: ModelFilePickerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setError(null);

    if (!f) return;

    const allowedExtensions = ['.stl', '.obj', '.ply'];
    const fileExtension = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload .stl, .obj, or .ply files.');
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (f.size > maxSize) {
      setError('File size exceeds 25MB limit.');
      return;
    }

    setFile(f);
    setFileType(fileExtension);
    setFileUrl(URL.createObjectURL(f));
    onFileSelect?.(f);
  };

  return (
    <div className="space-y-2 pl-4 pr-4 pb-4 w-[200px] sm:w-[150px] md:w-[150px] lg:w-[145px] xl:w-[170px]">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            {file ? <p className="truncate">{file?.name}</p> : buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{file ? `Preview ${fileType.toUpperCase()} File` : buttonText}</DialogTitle>
          </DialogHeader>

          {file ? (
            <div>
              <p className="text-xs text-muted-foreground truncate max-w-[500px]">{file.name}</p>
              <div className="flex items-center gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setFileUrl(null);
                    setFileType('');
                    onFileSelect?.(null);
                  }}
                >
                  Remove File
                </Button>
                <DialogTrigger asChild>
                  <Button>Done</Button>
                </DialogTrigger>
              </div>
            </div>
          ) : (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">{label}</Label>
              <Input id="picture" type="file" onChange={handleChange} accept=".stl,.obj,.ply" />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <p className="text-xs text-muted-foreground">
                Max file size: 25MB | Allowed types: .stl, .obj, .ply
              </p>
            </div>
          )}

          {fileUrl && <ModelViewerR3F fileUrl={fileUrl} fileType={fileType} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------it is working ----------------------
// 'use client';
// import { Canvas, useLoader } from '@react-three/fiber';
// import { OrbitControls } from '@react-three/drei';
// import { Suspense, useState } from 'react';
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';

// function Model({ url, fileType }: { url: string; fileType: string }) {
//   let geometry;
  
//   switch (fileType) {
//     case '.stl':
//       geometry = useLoader(STLLoader, url);
//       return <mesh geometry={geometry} scale={0.5}>
//         <meshStandardMaterial color="#fff" />
//       </mesh>;
    
//     case '.obj':
//       const obj = useLoader(OBJLoader, url);
//       return <primitive object={obj} scale={0.5} />;
    
//     case '.ply':
//       const ply = useLoader(PLYLoader, url);
//       return <mesh geometry={ply} scale={0.5}>
//         <meshStandardMaterial color="#fff" />
//       </mesh>;
    
//     default:
//       return null;
//   }
// }

// function ModelViewerR3F({ fileUrl, fileType }: { fileUrl: string; fileType: string }) {
//   if (!fileUrl) return null;

//   return (
//     <div style={{ height: 400 }}>
//       <Canvas camera={{ position: [0, 0, 100], fov: 70 }}>
//         <ambientLight intensity={0.6} />
//         <directionalLight position={[1, 1, 1]} intensity={0.8} />
//         <Suspense fallback={null}>
//           <Model url={fileUrl} fileType={fileType} />
//         </Suspense>
//         <OrbitControls />
//       </Canvas>
//     </div>
//   );
// }

// type ModelFilePickerProps = {
//   label?: string;
//   buttonText?: string;
//   onFileSelect?: (file: File | null) => void;
// };

// export default function ModelFilePicker({
//   label = 'Select Scan',
//   buttonText = 'Upload Scan File',
//   onFileSelect,
// }: ModelFilePickerProps) {
//   const [file, setFile] = useState<File | null>(null);
//   const [fileUrl, setFileUrl] = useState<string | null>(null);
//   const [fileType, setFileType] = useState<string>('');
//   const [error, setError] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     setError(null);
    
//     if (!f) return;

//     const allowedExtensions = ['.stl', '.obj', '.ply'];
//     const fileExtension = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    
//     if (!allowedExtensions.includes(fileExtension)) {
//       setError('Invalid file type. Please upload .stl, .obj, or .ply files.');
//       return;
//     }
//     const maxSize = 5 * 1024 * 1024; // 5MB in bytes
//     // const maxSize = 20 * 1024 * 1024; // 20MB in bytes
//     if (f.size > maxSize) {
//       setError('File size exceeds 20MB limit.');
//       return;
//     }

//     setFile(f);
//     setFileType(fileExtension);
//     setFileUrl(URL.createObjectURL(f));
//     onFileSelect?.(f);
//   };

//   return (
//     <div className="pl-4 pr-4 pb-4 space-y-4 w-[170px]">
//       <Dialog>
//         <DialogTrigger asChild>
//           <Button variant="outline" className="w-full">
//             {file ? <p className="truncate">{file?.name}</p> : buttonText}
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{file ? `Preview ${fileType.toUpperCase()} File` : buttonText}</DialogTitle>
//           </DialogHeader>
//           {file ? (
//             <div>
//               <p className="text-xs text-muted-foreground truncate max-w-[500px]">{file.name}</p>
//               <div className="flex items-center gap-4 mt-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setFile(null);
//                     setFileUrl(null);
//                     setFileType('');
//                     onFileSelect?.(null);
//                   }}
//                 >
//                   Remove File
//                 </Button>
//                 <DialogTrigger asChild>
//                   <Button>Done</Button>
//                 </DialogTrigger>
//               </div>
//             </div>
//           ) : (
//             <div className="grid w-full max-w-sm items-center gap-1.5">
//               <Label htmlFor="picture">{label}</Label>
//               <Input id="picture" type="file" onChange={handleChange} accept=".stl,.obj,.ply" />
//               {error && (
//                 <p className="text-sm text-red-500">{error}</p>
//               )}
//               <p className="text-xs text-muted-foreground">
//                 Max file size: 20MB | Allowed types: .stl, .obj, .ply
//               </p>
//             </div>
//           )}
//           {fileUrl && <ModelViewerR3F fileUrl={fileUrl} fileType={fileType} />}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
//------------------------------------------------