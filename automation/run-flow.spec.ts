import { resolve } from "node:path";
import { executeFlow } from "./executor";
import { loadFlow } from "./flow";

const projectRoot = resolve(import.meta.dirname, "..");

describe("Plunibio automation flow", () => {
    it("executes every requested user action", async () => {
        const filename = process.env.PLUNIBIO_AUTOMATION_FLOW;
        if (!filename) {
            throw new Error("PLUNIBIO_AUTOMATION_FLOW is not set");
        }
        const flow = await loadFlow(filename);
        await executeFlow(flow, projectRoot);
    });
});
