// API layer for file uploads (artwork, chat attachments, admin images).
// Currently only /uploads/artwork is wired up — it's public (no auth) and
// used by the product customizer / cart artwork flow.

import { apiFetch } from "./api";

export type UploadedArtworkFile = {
  id: string;
  name: string;
  url: string;
  /** Always "file" for this endpoint — no real MIME detection here. */
  kind: string;
  size: string;
};

type ArtworkUploadResponse = { files: UploadedArtworkFile[] };

/**
 * POST /uploads/artwork — uploads one or more artwork files and returns
 * their server-assigned ids/urls, in the same order they were passed in.
 * No auth required. Rate limited to 5/minute server-side, and rejects any
 * single file over 15MB (the *entire* request fails if one file is too
 * big, so callers should pre-filter oversized files before calling this).
 */
export async function uploadArtwork(
  files: File[],
): Promise<UploadedArtworkFile[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const res = await apiFetch<ArtworkUploadResponse>("/uploads/artwork", {
    method: "POST",
    body: formData,
  });

  return res.files;
}
