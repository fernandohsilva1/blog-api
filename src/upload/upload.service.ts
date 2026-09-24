import { BadRequestException, Injectable } from '@nestjs/common'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { fileTypeFromBuffer } from 'file-type'
import { resolve } from 'path'
import { generateRandomSuffix } from 'src/common/utils/generate-random-suffix'

@Injectable()
export class UploadService {
  async handleUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado')
    }

    const maxFileSize = 20 * 1024 * 1024

    if (file.size > maxFileSize) {
      throw new BadRequestException('Arquivo muito grande')
    }

    const fileType = await fileTypeFromBuffer(file.buffer)

    if (
      !fileType ||
      !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
        fileType.mime,
      )
    ) {
      throw new BadRequestException('Arquivo inválido ou tipo não permitido')
    }

    const today = new Date().toISOString().split('T')[0]
    const uploadPath = resolve(__dirname, '..', '..', 'uploads', today)

    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true })
    }

    const uniqueSuffix = `${Date.now()}-${generateRandomSuffix()}`
    const fileExension = fileType.ext
    const fileName = `${uniqueSuffix}.${fileExension}`
    const fileFullPath = resolve(uploadPath, fileName)

    writeFileSync(fileFullPath, file.buffer)

    return {
      url: `/uploads/${today}/${fileName}`,
    }
  }
}
