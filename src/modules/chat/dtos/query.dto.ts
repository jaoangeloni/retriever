import { IsNotEmpty, IsString } from 'class-validator';

export class QueryDto {
    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    sessionId: string;
}