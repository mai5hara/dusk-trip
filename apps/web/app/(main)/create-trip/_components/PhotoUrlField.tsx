'use client';

import { useState } from 'react';
import { PhotoUpload } from '@mood-trip/ui';
import { uploadImage } from '@/api/uploads/api';

type Props = {
  id?: string;
  variant?: 'border' | 'filled' | 'raised' | 'inset';
  value?: string;
  onChange: (url: string) => void;
  onBlur?: () => void;
  errorMessage?: string;
  placeholder?: string;
};

/**
 * Bridges tokonoma PhotoUpload (File) to form fields that store a URL string.
 * Uploads to local `/api/uploads` and saves under `public/uploads`.
 */
const PhotoUrlField = ({
  id,
  variant = 'inset',
  onChange,
  onBlur,
  errorMessage,
  placeholder,
}: Props) => {
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
      value={file}
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
