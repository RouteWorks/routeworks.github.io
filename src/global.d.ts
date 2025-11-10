// Type declarations for Google Analytics
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

declare module '*.png' {
  const value: string;
  export default value;
}
