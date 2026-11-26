import { useEffect, useState, type FormEvent } from 'react';
import { FolderPlus, Pencil } from 'lucide-react';
import type { Playlist } from '../../types/music';
import { validatePlaylistName } from '../../utils/playlistLogic';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface PlaylistFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'rename';
  initialPlaylist: Playlist | null;
  playlists: Playlist[];
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function PlaylistFormModal({
  isOpen,
  mode,
  initialPlaylist,
  playlists,
  onClose,
  onSubmit,
}: PlaylistFormModalProps) {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(mode === 'rename' && initialPlaylist ? initialPlaylist.name : '');
      setTouched(false);
    }
  }, [isOpen, mode, initialPlaylist]);

  const error = validatePlaylistName(
    name,
    playlists,
    mode === 'rename' ? initialPlaylist?.id : undefined
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (error) return;
    onSubmit(name.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Playlist' : 'Rename Playlist'}
      subtitle={
        mode === 'create'
          ? 'Give your playlist a unique, memorable name.'
          : `Updating "${initialPlaylist?.name ?? ''}"`
      }
      icon={mode === 'create' ? <FolderPlus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
      maxWidthClass="max-w-md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="playlist-form">
            {mode === 'create' ? 'Create Playlist' : 'Save Name'}
          </Button>
        </>
      }
    >
      <form id="playlist-form" onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Playlist Name"
          placeholder="e.g. Late Night Synthwave"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!touched) setTouched(true);
          }}
          error={touched ? error : null}
          autoFocus
          maxLength={60}
        />
        <p className="text-[11px] text-gray-500">
          Required · Must be unique across your playlists (up to 60 characters).
        </p>
      </form>
    </Modal>
  );
}
