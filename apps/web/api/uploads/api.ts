export type UploadImageResponse = {
  url: string;
};

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message ?? 'Failed to upload image');
  }

  const data = (await res.json()) as UploadImageResponse;
  return data.url;
}
