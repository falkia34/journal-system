import type { Prisma } from '@app/generated/prisma/client';
import { DateTime } from 'luxon';
import { Journal } from '@app/domain/entities';
import type { UserDto } from './user.dto';
import { UserMapper } from './user.dto';

export type JournalRecord = Prisma.JournalGetPayload<object>;

export type JournalRecordWithIncludes = Prisma.JournalGetPayload<{
  include: {
    editorInChief: true;
  };
}>;

export interface JournalDto {
  id: string;
  name: string;
  description: string;
  editor_in_chief_id: string;
  created_at: string;
  updated_at: string;
  editor_in_chief?: UserDto;
}

export class JournalMapper {
  public static fromPrismaToDomain(payload: JournalRecord | JournalRecordWithIncludes): Journal {
    return new Journal(
      payload.id,
      payload.name,
      payload.description,
      payload.editorInChiefId,
      payload.createdAt,
      payload.updatedAt,
      'editorInChief' in payload ? UserMapper.fromPrismaToDomain(payload.editorInChief) : undefined,
    );
  }

  public static fromDomainToDto(journal: Partial<Journal>): Partial<JournalDto> {
    return {
      id: journal.id,
      name: journal.name,
      description: journal.description,
      editor_in_chief_id: journal.editorInChiefId,
      created_at: journal.createdAt?.toISOString(),
      updated_at: journal.updatedAt?.toISOString(),
      editor_in_chief: journal.editorInChief
        ? (UserMapper.fromDomainToDto(journal.editorInChief) as UserDto)
        : undefined,
    };
  }

  public static fromDtoToDomain(dto: JournalDto): Journal {
    return new Journal(
      dto.id,
      dto.name,
      dto.description,
      dto.editor_in_chief_id,
      DateTime.fromISO(dto.created_at).toJSDate(),
      DateTime.fromISO(dto.updated_at).toJSDate(),
      dto.editor_in_chief ? UserMapper.fromDtoToDomain(dto.editor_in_chief) : undefined,
    );
  }

  public static fromDomainToFormData(journal: Partial<Journal>): FormData {
    const formData = new FormData();
    if (journal.id) formData.append('id', journal.id);
    if (journal.name) formData.append('name', journal.name);
    if (journal.description) formData.append('description', journal.description);
    if (journal.editorInChiefId) formData.append('editorInChiefId', journal.editorInChiefId);
    if (journal.createdAt) formData.append('createdAt', journal.createdAt.toISOString());
    if (journal.updatedAt) formData.append('updatedAt', journal.updatedAt.toISOString());
    return formData;
  }

  public static fromFormDataToDomain(formData: FormData): Journal {
    return new Journal(
      formData.get('id') as string,
      formData.get('name') as string,
      formData.get('description') as string,
      formData.get('editorInChiefId') as string,
      formData.get('createdAt')
        ? DateTime.fromISO(formData.get('createdAt') as string).toJSDate()
        : new Date(),
      formData.get('updatedAt')
        ? DateTime.fromISO(formData.get('updatedAt') as string).toJSDate()
        : new Date(),
    );
  }
}
