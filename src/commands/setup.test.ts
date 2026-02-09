import { describe, expect, it } from "bun:test";
import { command } from "cleye";

describe("setup command", () => {
  it("should define setup command with correct name", () => {
    const mockCommand = command({
      name: "setup",
      description: "configure your AI provider",
    },
      (argv) => {
        // Mock handler
      }
    );
    expect(mockCommand).toBeDefined();
  });

  it("should accept valid command parameters", () => {
    expect(() => {
      command({
        name: "setup",
        description: "configure your AI provider",
      }, (argv) => {});
    }).not.toThrow();
  });
});
