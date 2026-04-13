import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { getCroppedImageBlob } from '../../lib/cropImage.js';

function IconMinus() {
  return (
    <span className="w-5 text-center text-sm font-bold text-slate-500" aria-hidden>
      −
    </span>
  );
}

function IconPlus() {
  return (
    <span className="w-5 text-center text-sm font-bold text-slate-500" aria-hidden>
      +
    </span>
  );
}

function IconRotateCcw() {
  return (
    <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function IconRotateCw() {
  return (
    <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
    </svg>
  );
}

function IconFlipV({ active }) {
  return (
    <svg
      className={`h-5 w-5 ${active ? 'text-[#3b5bdb]' : 'text-slate-500'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" />
    </svg>
  );
}

function IconFlipH({ active }) {
  return (
    <svg
      className={`h-5 w-5 ${active ? 'text-[#3b5bdb]' : 'text-slate-500'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" d="M4 12h16M8 8H4v8h4m8-8h4v8h-4" />
    </svg>
  );
}

/**
 * @param {{ open: boolean, imageSrc: string | null, onClose: () => void, onConfirm: (blob: Blob) => Promise<void> | void }} props
 */
export function PhotoCropModal({ open, imageSrc, onClose, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setCroppedAreaPixels(null);
    }
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, rotation, {
        horizontal: flipH,
        vertical: flipV,
      });
      await onConfirm(blob);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crop image"
      size="lg"
      className="!z-[100]"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" type="button" onClick={reset} disabled={busy}>
            Reset
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button
              type="button"
              className="!bg-[#3b5bdb] hover:!bg-[#324fcc]"
              disabled={!croppedAreaPixels || busy}
              onClick={handleConfirm}
            >
              {busy ? 'Applying…' : 'Confirm'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative h-[min(52vh,360px)] w-full overflow-hidden rounded-lg bg-neutral-700">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            restrictPosition
            minZoom={0.5}
            maxZoom={4}
            zoomSpeed={0.2}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <IconMinus />
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer accent-[#3b5bdb]"
              aria-label="Zoom"
            />
            <IconPlus />
          </div>

          <div className="flex items-center gap-3">
            <IconRotateCcw />
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer accent-[#3b5bdb]"
              aria-label="Rotation"
            />
            <IconRotateCw />
          </div>

          <div className="flex items-center justify-between gap-4 px-1">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-slate-100"
              aria-label="Flip vertical"
              aria-pressed={flipV}
              onClick={() => setFlipV((v) => !v)}
            >
              <IconFlipV active={flipV} />
            </button>
            <span className="flex-1 text-center text-xs text-slate-400">Flip</span>
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-slate-100"
              aria-label="Flip horizontal"
              aria-pressed={flipH}
              onClick={() => setFlipH((v) => !v)}
            >
              <IconFlipH active={flipH} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
