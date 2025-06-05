import type { AnimationData } from '@aarsteinmedia/lottie-web';
export default function createJSON({ animation, fileName, shouldDownload, }: {
    animation?: AnimationData;
    fileName?: string;
    shouldDownload?: boolean;
}): string | null;
