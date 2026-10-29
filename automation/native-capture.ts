import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function captureGnomeWindow(
    filename: string,
    includeCursor: boolean
): Promise<void> {
    if (includeCursor) {
        throw new Error("XWayland native-window captures do not support includeCursor");
    }
    await browser.execute(() => window.focus());
    await browser.pause(150);

    const title = await browser.getTitle();
    const { stdout } = await execFileAsync("xwininfo", ["-root", "-tree"]);
    const windowLine = stdout
        .split("\n")
        .find((line) => line.includes(`"${title}"`));
    const windowId = windowLine?.trimStart().match(/^(0x[0-9a-f]+)/i)?.[1];
    if (!windowId) {
        throw new Error(`Unable to find the XWayland window titled '${title}'`);
    }

    await execFileAsync("import", ["-window", windowId, filename]);
}
