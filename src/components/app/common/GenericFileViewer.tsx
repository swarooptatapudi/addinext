'use client';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Grid } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// PDF.js setup
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type FileViewerProps = {
  label?: string;
  buttonText?: string;
  onFileSelect?: (file: File | null) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
  disabled?: boolean;
};

export function GenericFileViewer({
  label = 'Select File',
  buttonText = 'Upload File',
  onFileSelect,
  allowedTypes = ['.png', '.jpg', '.jpeg', '.pdf', '.obj', '.mtl'],
  maxSizeMB = 25,
  disabled = false,
}: FileViewerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    if (!selectedFile) return;

    // Validate type
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      setError(`Allowed formats: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setFile(selectedFile);
    setFileUrl(URL.createObjectURL(selectedFile));
    onFileSelect?.(selectedFile);
  };

  const renderPreview = () => {
    if (!fileUrl || !file) return null;
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    // Images
    if (['.png', '.jpg', '.jpeg'].includes(fileExt)) {
      return (
        <div className="flex justify-center items-center h-[400px]">
          <img src={fileUrl} alt={file.name} className="max-h-full max-w-full object-contain" />
        </div>
      );
    }

    // PDF
    if (fileExt === '.pdf') {
      return (
        <div className="h-[400px] overflow-auto">
          <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <Page pageNumber={1} width={400} />
          </Document>
          <p className="text-xs text-center mt-2">Page 1 of {numPages} (PDF preview)</p>
        </div>
      );
    }

    // OBJ
    function OBJModel({ url }: { url: string }) {
      const obj = useLoader(OBJLoader, url);
      return <primitive object={obj} scale={0.5} />;
    }

    if (fileExt === '.obj') {
      return (
        <div className="h-[400px] w-full">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Suspense fallback={<Html>Loading 3D Model...</Html>}>
              <OBJModel url={fileUrl} />
            </Suspense>
            <OrbitControls />
            <Grid />
          </Canvas>
        </div>
      );
    }

    return <div>Unsupported file format</div>;
  };

  return (
    <div className="space-y-2 pl-4 pr-4 pb-4 w-[200px] sm:w-[150px] md:w-[150px] lg:w-[145px] xl:w-[170px]">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full" disabled={disabled}>
            <p className="truncate">{file ? file.name : buttonText}</p>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>{file ? `Preview ${file.name}` : buttonText}</DialogTitle>
          </DialogHeader>

          {file ? (
            <>
              <div className="py-2">{renderPreview()}</div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  disabled={disabled}
                  onClick={() => {
                    setFile(null);
                    setFileUrl(null);
                    onFileSelect?.(null);
                  }}
                >
                  Remove File
                </Button>
                <DialogTrigger asChild>
                  <Button disabled={disabled}>Confirm</Button>
                </DialogTrigger>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="file-upload">{label}</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept={allowedTypes.join(',')}
                  disabled={disabled}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <p className="text-xs text-muted-foreground">
                Max size: {maxSizeMB}MB | Allowed: {allowedTypes.join(', ')}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
