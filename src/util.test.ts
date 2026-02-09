import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import * as fs from "fs/promises";
import * as path from "path";
import os from "os";
import ini from "ini";

const fileExist = async (filePath: string) => fs.access(filePath).then(() => true, () => false);

const getConfig = async (customPath?: string) => {
  const confitPath = customPath || path.join(os.homedir(), '.committs')
  const confitExist = await fileExist(confitPath)
  if(!confitExist) return {}

  const confitString = await fs.readFile(confitPath, 'utf-8')
  return ini.parse(confitString)
}

describe("fileExist", () => {
  it("should return true for existing file", async () => {
    const testFile = path.join(os.tmpdir(), `test-${Date.now()}.txt`);
    await fs.writeFile(testFile, "test");
    const result = await fileExist(testFile);
    await fs.unlink(testFile);
    expect(result).toBe(true);
  });

  it("should return false for non-existing file", async () => {
    const result = await fileExist("/nonexistent/path/to/file.txt");
    expect(result).toBe(false);
  });
});

describe("getConfig", () => {
  const testDir = path.join(os.tmpdir(), `committs-test-${Date.now()}`);

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it("should return empty object when config file does not exist", async () => {
    const config = await getConfig(path.join(testDir, '.committs'));
    expect(config).toEqual({});
  });

  it("should return parsed config from file", async () => {
    const configPath = path.join(testDir, '.committs');
    await fs.writeFile(configPath, 'OPENROUTER_API_KEY=test-key-123\n');
    const config = await getConfig(configPath);
    expect(config.OPENROUTER_API_KEY).toBe("test-key-123");
    await fs.unlink(configPath);
  });
});
