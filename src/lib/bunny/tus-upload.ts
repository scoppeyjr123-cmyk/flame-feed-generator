export type BunnyTusUploadCredentials = {
  endpoint: string;
  libraryId: string;
  videoId: string;
  expirationTime: number;
  signature: string;
};

type ProgressHandler = (progress: number) => void;

function encodeMetadata(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function authHeaders(credentials: BunnyTusUploadCredentials) {
  return {
    AuthorizationSignature: credentials.signature,
    AuthorizationExpire: String(credentials.expirationTime),
    VideoId: credentials.videoId,
    LibraryId: credentials.libraryId,
  };
}

async function getOffset(uploadUrl: string, credentials: BunnyTusUploadCredentials) {
  const response = await fetch(uploadUrl, {
    method: "HEAD",
    headers: {
      "Tus-Resumable": "1.0.0",
      ...authHeaders(credentials),
    },
  });
  if (!response.ok) throw new Error(`Falha ao retomar upload (${response.status}).`);
  return Number(response.headers.get("Upload-Offset") || "0");
}

async function patchChunk(
  uploadUrl: string,
  chunk: Blob,
  offset: number,
  credentials: BunnyTusUploadCredentials,
) {
  const response = await fetch(uploadUrl, {
    method: "PATCH",
    headers: {
      "Tus-Resumable": "1.0.0",
      "Upload-Offset": String(offset),
      "Content-Type": "application/offset+octet-stream",
      ...authHeaders(credentials),
    },
    body: chunk,
  });

  if (!response.ok) {
    throw new Error(`Falha no envio do vídeo (${response.status}).`);
  }

  return Number(response.headers.get("Upload-Offset") || offset + chunk.size);
}

export async function uploadFileToBunnyTus(
  file: File,
  credentials: BunnyTusUploadCredentials,
  onProgress: ProgressHandler,
) {
  const createResponse = await fetch(credentials.endpoint, {
    method: "POST",
    headers: {
      "Tus-Resumable": "1.0.0",
      "Upload-Length": String(file.size),
      "Upload-Metadata": `filename ${encodeMetadata(file.name)},filetype ${encodeMetadata(
        file.type || "application/octet-stream",
      )}`,
      ...authHeaders(credentials),
    },
  });

  if (!createResponse.ok) {
    throw new Error(`Não foi possível iniciar o upload no Bunny (${createResponse.status}).`);
  }

  const location = createResponse.headers.get("Location");
  if (!location) throw new Error("Bunny não retornou a URL da sessão de upload.");

  const uploadUrl = new URL(location, credentials.endpoint).toString();
  const chunkSize = 8 * 1024 * 1024;
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, Math.min(offset + chunkSize, file.size));
    let attempts = 0;

    while (true) {
      try {
        offset = await patchChunk(uploadUrl, chunk, offset, credentials);
        break;
      } catch (error) {
        attempts += 1;
        if (attempts >= 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, attempts * 1200));
        offset = await getOffset(uploadUrl, credentials);
      }
    }

    onProgress(Math.min(100, Math.round((offset / file.size) * 100)));
  }

  return { uploadUrl };
}
