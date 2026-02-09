import os from "os"
import path from "path"
import fs from "fs/promises"
import ini from "ini"

const fileExist = (filePath: string) => fs.access(filePath).then(() => true, () => false)

type ConfigType = {
  OPENROUTER_API_KEY?: string,
  AI_MODEL?: string
}

export const getConfig =  async (): Promise<ConfigType> => {
  const confitPath = path.join(os.homedir(), '.committs')
  const confitExist = await fileExist(confitPath)
  if(!confitExist) return {}

  const confitString = await fs.readFile(confitPath, 'utf-8')
  return ini.parse(confitString)
}
