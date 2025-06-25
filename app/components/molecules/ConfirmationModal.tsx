import React from 'react';
import { Card } from '../ui';
import { Button } from '../ui';

export interface ConfirmationModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-modal-backdrop">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Modal Content */}
      <Card className="relative z-modal max-w-md w-full p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-text-primary">
          {title}
        </h2>
        {description && (
          <p className="text-text-secondary">
            {description}
          </p>
        )}
        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
} 