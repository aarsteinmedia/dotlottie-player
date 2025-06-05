import type { AnimationData, LottieManifest } from '@aarsteinmedia/lottie-web';
export default function getAnimationData(input: unknown): Promise<{
    animations?: AnimationData[];
    manifest: LottieManifest | null;
    isDotLottie: boolean;
}>;
