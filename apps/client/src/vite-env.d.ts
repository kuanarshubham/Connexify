/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more environment variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// ** Image Declaration for TypeScript **
// This declaration allows TypeScript to understand that importing
// files with these extensions (e.g., .svg, .png, .jpg)
// results in a string (the URL/path to the asset).
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.bmp' {
  const content: string;
  export default content;
}

declare module '*.tiff' {
  const content: string;
  export default content;
}