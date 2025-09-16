export {};

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;

    /**
     * Optional runtime banner:
     * window.HESAA_BANNER = { message: "Site maintenance tonight 7-9 PM.", tone: "warning" }
     */
     HESAA_BANNER?: { message: string; tone?: "warning" | "info" | "success" | "danger" };
    setHESAA_BANNER?: (message: string, tone?: "warning" | "info" | "success" | "danger") => void;
  }
}
