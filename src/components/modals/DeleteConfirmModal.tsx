import { AlertTriangle } from 'lucide-react';
import type { Playlist } from '../../types/music';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface DeleteConfirmModalProps {
  playlist: Playlist | null;
  onClose: () => void;
  onConfirm: (playlistId: string) => void;
}

export function DeleteConfirmModal({ playlist, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={Boolean(playlist)}
      onClose={onClose}
      title="Delete Playlist"
      subtitle="This action cannot be undone."
      icon={<AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />}
      maxWidthClass="max-w-md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (playlist) {
                onConfirm(playlist.id);
                onClose();
              }
            }}
          >
            Delete Playlist
          </Button>
        </>
      }
    >
      {playlist && (
        <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            &ldquo;{playlist.name}&rdquo;
          </span>
          ? It currently contains{' '}
          <span className="font-semibold text-slate-900 dark:text-white">
            {playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'}
          </span>
          . Your songs will remain available in the Song Library.
        </p>
      )}
    </Modal>
  );
}
