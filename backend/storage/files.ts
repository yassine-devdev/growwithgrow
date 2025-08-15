import { api } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";

// Create buckets for different file types
const profilePictures = new Bucket("profile-pictures", { public: true });
const documents = new Bucket("documents");
const assignments = new Bucket("assignments");
const media = new Bucket("media", { public: true });

export interface UploadFileResponse {
  uploadUrl: string;
  fileUrl: string;
}

// Generates a signed upload URL for profile pictures.
export const getProfileUploadUrl = api<{ fileName: string }, UploadFileResponse>(
  { expose: true, method: "POST", path: "/storage/profile/upload-url" },
  async (req) => {
    const fileName = `${Date.now()}-${req.fileName}`;
    const { url: uploadUrl } = await profilePictures.signedUploadUrl(fileName, {
      ttl: 3600 // 1 hour
    });

    const fileUrl = profilePictures.publicUrl(fileName);

    return {
      uploadUrl,
      fileUrl
    };
  }
);

// Generates a signed upload URL for documents.
export const getDocumentUploadUrl = api<{ fileName: string }, UploadFileResponse>(
  { expose: true, method: "POST", path: "/storage/document/upload-url" },
  async (req) => {
    const fileName = `${Date.now()}-${req.fileName}`;
    const { url: uploadUrl } = await documents.signedUploadUrl(fileName, {
      ttl: 3600 // 1 hour
    });

    const { url: fileUrl } = await documents.signedDownloadUrl(fileName, {
      ttl: 86400 // 24 hours
    });

    return {
      uploadUrl,
      fileUrl
    };
  }
);

// Generates a signed upload URL for assignments.
export const getAssignmentUploadUrl = api<{ fileName: string }, UploadFileResponse>(
  { expose: true, method: "POST", path: "/storage/assignment/upload-url" },
  async (req) => {
    const fileName = `${Date.now()}-${req.fileName}`;
    const { url: uploadUrl } = await assignments.signedUploadUrl(fileName, {
      ttl: 3600 // 1 hour
    });

    const { url: fileUrl } = await assignments.signedDownloadUrl(fileName, {
      ttl: 86400 // 24 hours
    });

    return {
      uploadUrl,
      fileUrl
    };
  }
);

// Generates a signed upload URL for media files.
export const getMediaUploadUrl = api<{ fileName: string }, UploadFileResponse>(
  { expose: true, method: "POST", path: "/storage/media/upload-url" },
  async (req) => {
    const fileName = `${Date.now()}-${req.fileName}`;
    const { url: uploadUrl } = await media.signedUploadUrl(fileName, {
      ttl: 3600 // 1 hour
    });

    const fileUrl = media.publicUrl(fileName);

    return {
      uploadUrl,
      fileUrl
    };
  }
);

export interface GetFileRequest {
  fileName: string;
}

export interface GetFileResponse {
  downloadUrl: string;
}

// Generates a signed download URL for profile pictures.
export const getProfileDownloadUrl = api<GetFileRequest, GetFileResponse>(
  { expose: true, method: "GET", path: "/storage/profile/download-url" },
  async (req) => {
    return {
      downloadUrl: profilePictures.publicUrl(req.fileName)
    };
  }
);

// Generates a signed download URL for documents.
export const getDocumentDownloadUrl = api<GetFileRequest, GetFileResponse>(
  { expose: true, method: "GET", path: "/storage/document/download-url" },
  async (req) => {
    const { url: downloadUrl } = await documents.signedDownloadUrl(req.fileName, {
      ttl: 3600 // 1 hour
    });

    return { downloadUrl };
  }
);

// Generates a signed download URL for assignments.
export const getAssignmentDownloadUrl = api<GetFileRequest, GetFileResponse>(
  { expose: true, method: "GET", path: "/storage/assignment/download-url" },
  async (req) => {
    const { url: downloadUrl } = await assignments.signedDownloadUrl(req.fileName, {
      ttl: 3600 // 1 hour
    });

    return { downloadUrl };
  }
);

// Generates a signed download URL for media files.
export const getMediaDownloadUrl = api<GetFileRequest, GetFileResponse>(
  { expose: true, method: "GET", path: "/storage/media/download-url" },
  async (req) => {
    return {
      downloadUrl: media.publicUrl(req.fileName)
    };
  }
);

export interface DeleteFileRequest {
  fileName: string;
}

// Deletes a profile picture file.
export const deleteProfileFile = api<DeleteFileRequest, void>(
  { expose: true, method: "DELETE", path: "/storage/profile/files" },
  async (req) => {
    await profilePictures.remove(req.fileName);
  }
);

// Deletes a document file.
export const deleteDocumentFile = api<DeleteFileRequest, void>(
  { expose: true, method: "DELETE", path: "/storage/document/files" },
  async (req) => {
    await documents.remove(req.fileName);
  }
);

// Deletes an assignment file.
export const deleteAssignmentFile = api<DeleteFileRequest, void>(
  { expose: true, method: "DELETE", path: "/storage/assignment/files" },
  async (req) => {
    await assignments.remove(req.fileName);
  }
);

// Deletes a media file.
export const deleteMediaFile = api<DeleteFileRequest, void>(
  { expose: true, method: "DELETE", path: "/storage/media/files" },
  async (req) => {
    await media.remove(req.fileName);
  }
);
