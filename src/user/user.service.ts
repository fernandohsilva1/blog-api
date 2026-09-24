import {
  BadRequestException,
  Body,
  ConflictException,
  Injectable,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { HashingService } from 'src/common/hashing/hasing.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { UpdatePasswordDto } from './dto/update-password'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async findOneByEmailOrFail(email: string) {
    const exists = await this.userRepository.existsBy({
      email,
    })

    if (exists) {
      throw new ConflictException('Email já existe!')
    }
  }

  async findOneByOrFail(userData: Partial<User>) {
    const user = await this.userRepository.findOneBy(userData)

    if (!user) {
      throw new NotFoundException('Usuário não encontrado!')
    }

    return user
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    await this.findOneByEmailOrFail(dto.email)

    const hashedPasword = await this.hashingService.hash(dto.password)
    const newUser: CreateUserDto = {
      name: dto.name,
      email: dto.email,
      password: hashedPasword,
    }

    const created = await this.userRepository.save(newUser)

    return created
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email })
  }
  findById(id: string) {
    return this.userRepository.findOneBy({ id })
  }

  async update(id: string, dto: UpdateUserDto) {
    if (!dto.name && !dto.email) {
      throw new BadRequestException('Dados não enviados!')
    }

    const user = await this.findOneByOrFail({ id })

    user.name = dto.name ?? user.name

    if (dto.email && dto.email !== user.email) {
      await this.findOneByEmailOrFail(dto.email)
      user.email = dto.email
      user.forceLogout = true
    }

    return this.save(user)
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.findOneByOrFail({ id })

    const isCurrentPasswordValid = await this.hashingService.compare(
      dto.currentPassword,
      user.password,
    )

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta')
    }

    user.password = await this.hashingService.hash(dto.newPassword)
    user.forceLogout = true

    return this.save(user)
  }

  async delete(id: string) {
    return this.userRepository.delete(id)
  }

  save(user: User) {
    return this.userRepository.save(user)
  }
}
