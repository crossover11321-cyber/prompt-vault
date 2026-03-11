import type { MidjourneyParams } from './db';

/**
 * MidjourneyパラメータからDiscord用の /imagine コマンド文字列を組み立てる
 */
export function buildImagineCommand(body: string, params: MidjourneyParams): string {
    const parts: string[] = ['/imagine'];

    // プロンプト本文
    const trimmedBody = body.trim();
    if (trimmedBody) {
        parts.push(trimmedBody);
    }

    // --no (ネガティブプロンプト)
    if (params.no.trim()) {
        parts.push(`--no ${params.no.trim()}`);
    }

    // --v or --niji
    if (params.version.startsWith('niji')) {
        const nijiVer = params.version.replace('niji ', '');
        parts.push(`--niji ${nijiVer}`);
    } else {
        parts.push(`--v ${params.version}`);
    }

    // --ar
    if (params.aspectRatio !== '1:1') {
        parts.push(`--ar ${params.aspectRatio}`);
    }

    // --s (stylize) - only if non-default
    if (params.stylize !== 100) {
        parts.push(`--s ${params.stylize}`);
    }

    // --c (chaos)
    if (params.chaos > 0) {
        parts.push(`--c ${params.chaos}`);
    }

    // --q (quality) - only if non-default
    if (params.quality !== 1) {
        parts.push(`--q ${params.quality}`);
    }

    // --w (weird)
    if (params.weird > 0) {
        parts.push(`--w ${params.weird}`);
    }

    // --seed
    if (params.seed !== undefined && params.seed !== null) {
        parts.push(`--seed ${params.seed}`);
    }

    // --tile
    if (params.tile) {
        parts.push('--tile');
    }

    // --stop
    if (params.stop < 100) {
        parts.push(`--stop ${params.stop}`);
    }

    // --sref
    if (params.styleRef.trim()) {
        parts.push(`--sref ${params.styleRef.trim()}`);
    }

    // --cref
    if (params.characterRef.trim()) {
        parts.push(`--cref ${params.characterRef.trim()}`);
    }

    // --p (personalize)
    if (params.personalize.trim()) {
        parts.push(`--p ${params.personalize.trim()}`);
    }

    return parts.join(' ');
}

/**
 * /imagine コマンド文字列をクリップボードにコピーする
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch {
            document.body.removeChild(textarea);
            return false;
        }
    }
}
