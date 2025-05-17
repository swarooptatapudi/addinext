'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useState } from 'react';
// @ts-expect-error - no types for STLLoader
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
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

function Model({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);

  return (
    <mesh geometry={geometry} scale={0.5}>
      <meshStandardMaterial color="#fff" />
    </mesh>
  );
}

function StlViewerR3F({ fileUrl }: { fileUrl: string }) {
  if (!fileUrl) return null;

  return (
    <div style={{ height: 400 }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 70 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />
        <Suspense fallback={null}>
          <Model url={fileUrl} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default function StlFilePicker() {
  const [file, setFile] = useState<any | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.name.endsWith('.stl')) {
      setFile(f);
      setFileUrl(URL.createObjectURL(f));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full ">
            {file ? <p className="truncate">{file?.name} </p> : 'Upload Scan File'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{file ? 'Preview STL File' : 'Select STL File'}</DialogTitle>
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
              <Label htmlFor="picture">Select Scan</Label>
              <Input id="picture" type="file" onChange={handleChange} accept=".stl" />
            </div>
          )}
          {fileUrl && <StlViewerR3F fileUrl={fileUrl} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
