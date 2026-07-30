export type DetectedFileKind = "jpeg" | "png" | "webp" | "gif" | "pdf";

const IMAGE_KINDS = new Set<DetectedFileKind>(["jpeg", "png", "webp", "gif"]);
const LOGO_KINDS = new Set<DetectedFileKind>(["jpeg", "png", "webp", "pdf"]);

const MIME_BY_KIND: Record<DetectedFileKind, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

export function detectFileKind(buffer: Buffer): DetectedFileKind | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "gif";
  }

  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  if (buffer.toString("ascii", 0, 5) === "%PDF-") {
    return "pdf";
  }

  // Reject SVG / HTML-looking payloads explicitly
  const head = buffer.subarray(0, Math.min(buffer.length, 256)).toString("utf8");
  if (/^\s*<(!DOCTYPE\s+)?(svg|html|xml)/i.test(head)) {
    return null;
  }

  return null;
}

export function mimeForKind(kind: DetectedFileKind) {
  return MIME_BY_KIND[kind];
}

export function isAllowedGalleryKind(kind: DetectedFileKind) {
  return IMAGE_KINDS.has(kind);
}

export function isAllowedLogoKind(kind: DetectedFileKind) {
  return LOGO_KINDS.has(kind);
}

export const GALLERY_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

export const LOGO_ACCEPT =
  "image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf";
