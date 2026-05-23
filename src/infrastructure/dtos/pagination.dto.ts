import { PaginationOptions } from '@app/domain/entities';

export interface PaginationOptionsDto {
  take: number;
  cursor?: string;
  next_cursor?: string;
  previous_cursor?: string;
}

export class PaginationOptionsMapper {
  public static fromDomainToDto(paginationOptions: PaginationOptions): PaginationOptionsDto {
    return {
      take: paginationOptions.take,
      cursor: paginationOptions.cursor,
      next_cursor: paginationOptions.nextCursor,
      previous_cursor: paginationOptions.previousCursor,
    };
  }

  public static fromDtoToDomain(dto: PaginationOptionsDto): PaginationOptions {
    return new PaginationOptions(dto.take, dto.cursor, dto.next_cursor, dto.previous_cursor);
  }
}
