'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { EllipsisIcon } from 'lucide-react';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@mood-trip/ui';
import { toast } from 'sonner';
import { useDeleteTripMutation } from '@/app/(main)/create-trip/_hooks/useTripMutation';
import { getErrorMessage } from '@/lib/get-error-message';

type TripCardMenuProps = {
  tripId: string;
  tripTitle: string;
};

const TripCardMenu = ({ tripId, tripTitle }: TripCardMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { mutateAsync: deleteTripAsync, isPending } = useDeleteTripMutation();

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent): void => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  const deleteAlbum = async (): Promise<void> => {
    setIsConfirmingDelete(false);
    try {
      await deleteTripAsync(tripId);
      toast.success('Album deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete album'));
    }
  };

  return (
    <div ref={menuRef} className="absolute top-3 right-3 z-10">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        rounded="full"
        aria-label="Album actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <EllipsisIcon className="size-4" />
      </Button>
      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 mt-1 flex min-w-44 flex-col rounded-xl border bg-surface p-1 shadow-md"
        >
          <Link
            role="menuitem"
            href={`/trips/${tripId}/edit`}
            className="rounded-lg px-3 py-2 text-sm hover:bg-black/5"
            onClick={() => setIsOpen(false)}
          >
            Edit Album
          </Link>
          <Link
            role="menuitem"
            href={`/trips/${tripId}/edit/memories`}
            className="rounded-lg px-3 py-2 text-sm hover:bg-black/5"
            onClick={() => setIsOpen(false)}
          >
            Edit Memories
          </Link>
          <button
            type="button"
            role="menuitem"
            className="rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-black/5"
            onClick={() => {
              setIsOpen(false);
              setIsConfirmingDelete(true);
            }}
          >
            Delete Album
          </button>
        </div>
      ) : null}

      <Modal open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <ModalContent>
          <ModalHeader
            title="Delete album?"
            description={`“${tripTitle}” and its memories will be permanently deleted.`}
          />
          <ModalFooter>
            <Button
              type="button"
              variant="flat"
              disabled={isPending}
              onClick={() => setIsConfirmingDelete(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={isPending}
              onClick={deleteAlbum}
            >
              {isPending ? 'Deleting...' : 'Delete Album'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TripCardMenu;
