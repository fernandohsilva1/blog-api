import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class UpdatePasswordDto {
  @IsString({ message: 'Senha precisa ter somente letras e números' })
  @IsNotEmpty({ message: 'Senha não pode estar vazio' })
  currentPassword: string

  @IsString({ message: 'Nova senha precisa conter letras' })
  @IsNotEmpty({ message: 'Digite sua nova senha' })
  @MinLength(4, { message: 'Nova senha deve ter no mínimo 4 caracteres' })
  newPassword: string
}
