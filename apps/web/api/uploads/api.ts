import { nextApiClient } from '@/api/_common/next-api-client';

export type UploadImageResponse = {
  url: string;
};

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const data = await nextApiClient<UploadImageResponse>('/api/uploads', {
    method: 'POST',
    body: formData,
  });

  return data.url;
}
