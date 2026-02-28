import os from "os"
import path from "path"
import fs from "fs/promises"
import ini from "ini"

const fileExist = (filePath: string) => fs.access(filePath).then(() => true, () => false)

export type ConfigType = {
  PROVIDER?: string,
  OPENROUTER_API_KEY?: string,
  OPENAI_API_KEY?: string,
  GOOGLE_API_KEY?: string,
  AI_MODEL?: string,
  [key: string]: string | undefined
}

export const getConfig =  async (): Promise<ConfigType> => {
  const confitPath = path.join(os.homedir(), '.committs')
  const confitExist = await fileExist(confitPath)
  if(!confitExist) return {}

  const confitString = await fs.readFile(confitPath, 'utf-8')
  return ini.parse(confitString)
}

export const saveConfig = async (updates: Partial<ConfigType>) => {
  const currentConfig = await getConfig()
  const newConfig = { ...currentConfig, ...updates }
  const confitPath = path.join(os.homedir(), '.committs')
  await fs.writeFile(confitPath, ini.stringify(newConfig))
}
