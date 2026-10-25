'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { EllipsisIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@mood-trip/ui';
import { getErrorMessage } from '@/lib/get-error-message';
import { useDeleteTripMutation } from '../_hooks/useDeleteTripMutation';

type TripCardMenuProps = {
  tripId: string;
  tripTitle: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
};

const _getMenuItems = (
  tripId: string,
): ReadonlyArray<{ label: string; href: string | null }> => [
  { label: 'Delete Album', href: null },
  { label: 'Edit Album', href: `/trips/${tripId}/edit` },
  { label: 'Edit Memories', href: `/trips/${tripId}/edit/memories` },
];

const TripCardMenu = ({
  tripId,
  tripTitle,
  cardRef,
}: TripCardMenuProps): React.JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteTripMutation = useDeleteTripMutation();

  const handleDelete = async (): Promise<void> => {
    try {
      await deleteTripMutation.mutateAsync(tripId);
      setIsConfirmOpen(false);
      toast.success('Album deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete album'));
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const card = cardRef.current;
    if (!card) return;

    const onClickCapture = (event: MouseEvent): void => {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }

      if (card.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
      }

      setIsOpen(false);
    };

    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, [cardRef, isOpen]);

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
          {_getMenuItems(tripId).map(({ label, href }) =>
            href ? (
              <Link
                key={label}
                role="menuitem"
                href={href}
                className="rounded-lg px-3 py-2 text-sm hover:bg-black/5"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ) : (
              <button
                key={label}
                type="button"
                role="menuitem"
                className="rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5"
                onClick={() => {
                  setIsOpen(false);
                  setIsConfirmOpen(true);
                }}
              >
                {label}
              </button>
            ),
          )}
        </div>
      ) : null}
      <Modal
        open={isConfirmOpen}
        onOpenChange={(open: boolean) => {
          if (!deleteTripMutation.isPending) setIsConfirmOpen(open);
        }}
      >
        <ModalContent size="sm">
          <ModalHeader
            title="Delete this album?"
            description={`"${tripTitle}" and all of its memories will be permanently deleted. This can't be undone.`}
          />
          <ModalFooter>
            <Button
              type="button"
              variant="flat"
              disabled={deleteTripMutation.isPending}
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={deleteTripMutation.isPending}
              onClick={handleDelete}
            >
              {deleteTripMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TripCardMenu;
