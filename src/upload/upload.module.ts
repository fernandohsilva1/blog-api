import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'
import { resolve } from 'path'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        fallthrough: false,
        index: false,
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
