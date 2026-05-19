import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', reject);
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const size = Math.min(pixelCrop.width, pixelCrop.height, 512);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0, size, size,
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), 'image/jpeg', 0.88);
    });
}

export default function ImageCropModal({ imageSrc, onConfirm, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        const url = await getCroppedImg(imageSrc, croppedAreaPixels);
        onConfirm(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Ajustar Fotografia
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Arrasta para reposicionar · Roda o scroll para fazer zoom
                    </p>
                </div>

                <div className="relative bg-gray-800" style={{ height: 320 }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="px-4 py-3 space-y-3">
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 accent-blue-600"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" />
                        </svg>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
