import { existsSync, mkdirSync } from "fs-extra";

export function createDirIfNotExists(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
