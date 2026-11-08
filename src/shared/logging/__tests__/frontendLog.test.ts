import { afterEach, describe, expect, it, vi } from "vitest";
import { configureFrontendLog, frontendLog } from "../frontendLog";

const invoke = vi.hoisted(() => vi.fn());
vi.mock("@tauri-apps/api/core", () => ({ invoke }));

describe("frontendLog", () => {
    afterEach(() => {
        invoke.mockReset();
        vi.restoreAllMocks();
    });

    it("sends the event and level to Rust", async () => {
        invoke.mockResolvedValueOnce("info");
        await configureFrontendLog();
        invoke.mockResolvedValue(undefined);
        frontendLog("info", "about.opened", { kind: "markdown" });
        await vi.waitFor(() => expect(invoke).toHaveBeenCalledWith("frontend_log", {
            event: "about.opened",
            level: "info",
            details: { kind: "markdown" },
        }));
    });

    it("reports an IPC failure without throwing", async () => {
        invoke.mockResolvedValueOnce("info");
        await configureFrontendLog();
        invoke.mockRejectedValue(new Error("IPC unavailable"));
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
        expect(() => frontendLog("info", "about.opened")).not.toThrow();
        await vi.waitFor(() => expect(error).toHaveBeenCalled());
    });

    it("does not call Rust for levels disabled by the backend", async () => {
        invoke.mockResolvedValueOnce("warn");
        await configureFrontendLog();
        invoke.mockClear();
        frontendLog("debug", "quiet debug");
        frontendLog("trace", "quiet trace");
        await Promise.resolve();
        expect(invoke).not.toHaveBeenCalled();
        frontendLog("warn", "warning", { count: 1 });
        await vi.waitFor(() => expect(invoke).toHaveBeenCalledWith("frontend_log", {
            event: "warning", details: { count: 1 }, level: "warn",
        }));
    });

    it.each([
        ["off", []],
        ["error", ["error"]],
        ["warn", ["error", "warn"]],
        ["info", ["error", "warn", "info"]],
        ["debug", ["error", "warn", "info", "debug"]],
        ["trace", ["error", "warn", "info", "debug", "trace"]],
    ] as const)("respects the %s threshold", async (threshold, expected) => {
        invoke.mockResolvedValueOnce(threshold);
        await configureFrontendLog();
        invoke.mockClear();
        for (const level of ["error", "warn", "info", "debug", "trace"] as const) {
            frontendLog(level, level);
        }
        await Promise.resolve();
        expect(invoke.mock.calls.map((call) => call[1].level)).toEqual(expected);
    });
});
