import { Expose } from 'class-transformer';
import { IsDefined, IsString, MinLength } from 'class-validator';

export class BodyReqDeletePhotoDTO {
    @IsDefined()
    @IsString()
    @MinLength(1)
    @Expose()
    key!: string
}