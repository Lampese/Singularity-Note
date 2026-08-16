import type { ReactNode } from "react";
import { UploadProvider } from "@/contexts/UploadContext";

export default function WorkspacesLayout({ children }: { children: ReactNode }) {
    return <UploadProvider>{children}</UploadProvider>;
}
