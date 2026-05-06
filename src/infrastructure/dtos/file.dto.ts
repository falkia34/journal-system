import type { Prisma } from '@app/generated/prisma/client';
import { File as FileEntity } from '@app/domain/entities';

export type FileRecord = Prisma.FileGetPayload<object>;

export interface FileDto {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export class FileMapper {
  public static fromPrismaToDomain(payload: FileRecord): FileEntity {
    return new FileEntity(
      payload.id,
      payload.filename,
      payload.originalName,
      payload.mimeType,
      payload.size,
    );
  }

  public static fromDomainToDto(file: Partial<FileEntity>): Partial<FileDto> {
    return {
      id: file.id,
      filename: file.filename,
      original_name: file.originalName,
      mime_type: file.mimeType,
      size: file.size,
    };
  }

  public static fromDtoToDomain(dto: FileDto): FileEntity {
    return new FileEntity(dto.id, dto.filename, dto.original_name, dto.mime_type, dto.size);
  }
}
