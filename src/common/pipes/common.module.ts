import { Module } from '@nestjs/common'
import { HashingService } from '../hashing/hasing.service'
import { BcryptHashingService } from '../hashing/bcrypt-hasing.service'

@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptHashingService,
    },
  ],
  exports: [HashingService],
})
export class CommonModule {}
