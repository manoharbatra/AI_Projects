import fs from "fs/promises"
import path from "path"

export async function readFileContent(fileName) {
    try {
        const filePath = path.join(process.cwd(), "files", fileName)

        return await fs.readFile(filePath, "utf-8")
    } catch {
        return `File not found: ${fileName}`
    }
}
