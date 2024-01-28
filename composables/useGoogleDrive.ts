import {
  FolderIcon,
  FileIcon,
  FileSpreadsheetIcon,
  ImageIcon,
} from 'lucide-vue-next';

export default function useGoogleDrive() {
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  const fileIcon = (mimeType: string) => {
    const icons = {
      'application/vnd.google-apps.document': FileIcon,
      'application/vnd.google-apps.spreadsheet': FileSpreadsheetIcon,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        FileSpreadsheetIcon,
      'application/vnd.google-apps.presentation': FileIcon,
      'application/vnd.google-apps.drawing': ImageIcon,
      'image/jpeg': ImageIcon,
      'image/png': ImageIcon,
      'image/svg+xml': ImageIcon,
      'image/bmp': ImageIcon,
      'image/webp': ImageIcon,
      'image/gif': ImageIcon,
      'image/tiff': ImageIcon,
      'application/vnd.google-apps.script': FileIcon,
      'application/vnd.google-apps.folder': FolderIcon,
      'application/vnd.google-apps.audio': FileIcon,
      'application/vnd.google-apps.video': FileIcon,
      'application/vnd.google-apps.photo': ImageIcon,
      'application/vnd.google-apps.file': FileIcon,
      'application/vnd.google-apps.unknown': FileIcon,
      'application/pdf': FileIcon,
      'application/vnd.google.colaboratory': FileIcon,
      folder: FolderIcon,
    };
    return icons[mimeType] || FileIcon;
  };

  async function downloadFileToUploadsFolder(fileId: string) {
    const res = await $fetch(`/api/google/download?fileId=${fileId}`, {
      signal: ac.signal,
    });
    return res;
  }

  return {
    fileIcon,
  };
}
