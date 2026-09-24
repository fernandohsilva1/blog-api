import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsString({ message: 'Nome precisa ter somente letras e números' })
  @IsNotEmpty({ message: 'Nome não pode estar vazio' })
  name: string

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string

  @IsString({ message: 'Senha precisa ter somente letras e números' })
  @IsNotEmpty({ message: 'Senha não pode estar vazio' })
  @MinLength(4, { message: 'Senha deve ter no mínimo 4 caracteres' })
  password: string
}
