import { useEffect, useRef } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

export function ManualHtmlCopyModal({ open, html, onClose, title = 'Copy HTML manually' }) {
  const taRef = useRef(null);

  useEffect(() => {
    if (open && taRef.current) {
      taRef.current.focus();
      taRef.current.select();
    }
  }, [open, html]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      className="z-[100]"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            className="!bg-[#3b5bdb] hover:!bg-[#324fcc]"
            onClick={() => {
              const el = taRef.current;
              if (!el) return;
              el.focus();
              el.select();
              try {
                document.execCommand('copy');
              } catch {
                /* ignore */
              }
            }}
          >
            Select all
          </Button>
        </div>
      }
    >
      <p className="mb-3 text-sm text-slate-600">
        Select the paste HTML below (table + hosted image URL only), then{' '}
        <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs">Ctrl+C</kbd> /{' '}
        <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs">Cmd+C</kbd> and paste
        into Gmail or Outlook signature settings.
      </p>
      <textarea
        ref={taRef}
        readOnly
        value={html || ''}
        className="h-48 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800"
        spellCheck={false}
      />
    </Modal>
  );
}
