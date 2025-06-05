import type { AnimationData, LottieManifest } from '@aarsteinmedia/lottie-web';
export default function getLottieJSON(resp: Response): Promise<{
    data: AnimationData[];
    manifest: LottieManifest;
}>;
