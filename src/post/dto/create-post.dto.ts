import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator'

export class CreatePostDto {
  @IsString({ message: 'Titúlo precisa ser uma string' })
  @Length(10, 140, { message: 'Título precisa ter entre 10 e 140 caracteres' })
  title: string

  @IsString({ message: 'Excerto precisa ser uma string' })
  @Length(10, 200, { message: 'Excerto precisa ter entre 10 e 200 caracteres' })
  excerpt: string

  @IsString({ message: 'Conteúdo precisa ser uma string' })
  @IsNotEmpty({ message: 'Conteúdo não pode ficar vazio' })
  content: string

  @IsOptional()
  @Matches(/^(https?:\/\/|\/)/, {
    message: 'URL da imagem precisa ser uma URL válida',
  })
  coverImageUrl?: string

  @IsOptional()
  @IsBoolean({ message: 'Campo de publicar post precisa ser boolean' })
  published?: boolean
}
