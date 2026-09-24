import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: 'E-mail incorreto!' })
  email: string

  @IsString({ message: 'Senha precisa conter letras' })
  @IsNotEmpty({ message: 'Digite sua senha' })
  password: string
}
