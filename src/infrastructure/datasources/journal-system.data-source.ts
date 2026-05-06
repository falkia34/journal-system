import { PrismaClient } from '@app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JournalSystemDataSource extends PrismaClient {}

export const JournalSystemDataSourceImpl: JournalSystemDataSource = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});
