'use client';

import { useState } from 'react';
import { PhotoUpload } from '@mood-trip/ui';
import { uploadImage } from '@/api/uploads/api';

type PhotoUrlFieldProps = {
  id?: string;
  variant?: 'border' | 'filled' | 'raised' | 'inset';
  value?: string;
  onChange: (url: string) => void;
  onBlur?: () => void;
  errorMessage?: string;
  placeholder?: string;
};

/**
 * Bridges tokonoma PhotoUpload (File | URL) to form fields that store a URL string.
 */
const PhotoUrlField = ({
  id,
  value,
  variant = 'inset',
  onChange,
  onBlur,
  errorMessage,
  placeholder,
}: PhotoUrlFieldProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();

  return (
    <PhotoUpload
      id={id}
      variant={variant}
      placeholder={
        isUploading ? 'Uploading...' : (placeholder ?? 'Upload a photo')
      }
      value={file ?? (value ? value : null)}
      disabled={isUploading}
      errorMessage={uploadError ?? errorMessage}
      onBlur={onBlur}
      onValueChange={(nextFile: File | null) => {
        void (async () => {
          setUploadError(undefined);
          setFile(nextFile);

          if (!nextFile) {
            onChange('');
            return;
          }

          setIsUploading(true);
          try {
            const url = await uploadImage(nextFile);
            onChange(url);
            setFile(null);
          } catch (error) {
            setFile(null);
            onChange('');
            setUploadError(
              error instanceof Error ? error.message : 'Failed to upload image',
            );
          } finally {
            setIsUploading(false);
          }
        })();
      }}
    />
  );
};

export default PhotoUrlField;
