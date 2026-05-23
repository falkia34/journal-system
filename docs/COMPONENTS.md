# Components

## Organization

Components are organized by scope in `src/presentation/components/`:

```
components/
  auth/             → Authentication UI (login form, auth layout)
  shared/           → Global shared (MUI setup, logos, icons)
  internal/shared/  → Authenticated layout shell + shared entity sub-views
  admin/            → Administrator role components
  editor/           → Editor role components
  reviewer/         → Reviewer role components
  author/           → Author role components
```

## Component Types

Each entity gets three main component types:

### List (`{entity}s-list.tsx`)

MUI X DataGrid with server-side cursor-based pagination.

**Structure**: `<NoSsr>` → `<Box component="section" className="mb-6 w-full px-6">` → `<DataGrid>`

**Props**:
```typescript
type Props = {
  initialJournals: JournalDto[];
  initialPaginationOptions: PaginationOptionsDto;
};
```

**DataGrid configuration**:
- `paginationMode="server"`, `pageSizeOptions={[25, 50, 100]}`
- `rowCount={-1}` when hasNextPage, exact count otherwise
- `paginationMeta={{ hasNextPage }}`
- `slots={{ noRowsOverlay: EmptyRowOverlay }}` with `slotProps={{ noRowsOverlay: { text: 'No X found.' } }}`
- `disableRowSelectionOnClick`
- `initialState.columns.columnVisibilityModel: { id: false }`
- sx: hide `.MuiTablePagination-displayedRows`, pointer cursor on row hover

**Pagination flow** (via server actions):
```
handlePaginationModelChange(newModel)
  → determine cursor from paginationOptions (nextCursor/previousCursor)
  → startTransition(() => getEntitiesPageAction({ cursor, perPage }))
  → on success: setRows, setPaginationOptions, setPaginationMeta
```

**Actions column** (`type: 'actions'`):
```tsx
<GridActionsCell {...params}>
  <GridActionsCellItem showInMenu icon={<VisibilityRounded />} label="View"
    component={Link} href={`/entities/${params.row.actions.id}`}
    // @ts-expect-error Link component requires href prop
  />
  {/* Edit: permission-gated, component={Link} */}
  {/* Delete: permission-gated, onClick → handleDeleteClick → AlertDialog */}
</GridActionsCell>
```

**Rows**: Mapped to flat objects with `actions: domainEntity` for action column access.
**Delete flow**: `setSelectedId/Name` → `AlertDialog` → onAccept calls server action → filters row from local state.

### Toolbar (`{entity}s-toolbar.tsx`)

```tsx
'use client';
export function JournalsToolbar() {
  return (
    <Box className="ml-auto">
      <Button variant="filled" LinkComponent={Link} href="/admin/journals/new"
        startIcon={<AddRounded />}>Add</Button>
    </Box>
  );
}
```

### View (`{entity}-view.tsx`)

Read-only detail page composing sub-section views with `ViewTile`.

**Structure per sub-section**:
```
Box(section, mb-4, px-6) > Container(max-w-2xl) > Toolbar(h2 header) + Grid(spacing=0.5) > ViewTile
```

```tsx
export function JournalView({ initialJournal }: Props) {
  const journal = JournalMapper.fromDtoToDomain(initialJournal);
  return (
    <>
      <GeneralView journal={journal} />
      <DetailsView journal={journal} />
    </>
  );
}

// Sub-section:
export function GeneralView({ journal }: Props) {
  return (
    <Box component="section" className="mb-4 w-full px-6">
      <Container maxWidth={false} className="max-w-2xl p-0">
        <Toolbar component="header" className="h-auto min-h-10 p-3">
          <Typography component="h2" variant="h6" className="font-medium">General</Typography>
        </Toolbar>
        <Grid container spacing={0.5}>
          <Grid size={12}><ViewTile title="Name" subtitle={journal.name} position="top" /></Grid>
          <Grid size={12}><ViewTile title="Description" subtitle={journal.description} position="middle" /></Grid>
          <Grid size={12}><ViewTile title="ISSN" subtitle={journal.issn ?? '—'} position="bottom" /></Grid>
        </Grid>
      </Container>
    </Box>
  );
}
```

### Form (`{entity}-form.tsx`)

Create/Edit form using React Hook Form + Zod + server actions.

**Key pattern**:
```tsx
'use client';
import { useActionState, useRef, startTransition } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const entityInputSchema = z.object({ /* fields */ });
export type EntityInput = z.infer<typeof entityInputSchema>;

type Props = {
  initialEntity?: EntityDto;
  action: (prevState: unknown, formData: FormData) => Promise<ActionState>;
};

export function EntityForm({ initialEntity, action }: Props) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  const entity = initialEntity ? EntityMapper.fromDtoToDomain(initialEntity) : null;
  const methods = useForm<EntityInput>({
    mode: 'all',
    resolver: zodResolver(entityInputSchema) as Resolver<EntityInput>,
    defaultValues: entity ? { /* from entity */ } : { /* empty */ },
  });

  return (
    <>
      <SectionHeader title={entity ? entity.name : 'Create Entity'}>
        <EntityToolbar ref={ref} methods={methods} initialEntity={initialEntity} />
      </SectionHeader>
      <Box component="form" ref={ref} noValidate action={(fd) => startTransition(() => formAction(fd))}>
        <GeneralForm methods={methods} />
      </Box>
    </>
  );
}
```

**Sub-forms** receive `methods: UseFormReturn<EntityInput>`, destructure `{ register, control, formState: { errors, isSubmitting } }`.
Simple fields: `{...register('field')}`, Selects: `<Controller>`.

**Section layout** (mirrors view): `Box(section) > Container(max-w-2xl) > Toolbar(h2) + Grid(spacing={2})`

### Toolbar (View/Edit Switch)

Uses `OneOf` union type — view mode shows "Edit" link, form mode shows "Cancel" + "Save".

```tsx
type ViewProps = { entityId: string; editHref: string };
type FormProps = { ref: RefObject<HTMLFormElement | null>; methods: UseFormReturn<EntityInput> };

export function EntityToolbar({ entityId, editHref, ref, methods }: OneOf<[ViewProps, FormProps]>) {
  const router = useRouter();
  if (entityId) {
    return (
      <Box className="ml-auto">
        <Button variant="filled" LinkComponent={Link} href={editHref} startIcon={<EditRounded />}>Edit</Button>
      </Box>
    );
  } else if (ref && methods) {
    const { formState: { isDirty, isSubmitting } } = methods;
    return (
      <Box className="ml-auto flex flex-wrap-reverse justify-end gap-y-2">
        <Button variant="text" disabled={isSubmitting} onClick={() => router.back()}>Cancel</Button>
        <Button variant="filled" disabled={!isDirty || isSubmitting}
          onClick={() => ref.current?.requestSubmit()} startIcon={<SaveRounded />}>Save</Button>
      </Box>
    );
  }
  return null;
}
```

## Shared vs Role-Specific

| Component Type | Location | When |
|---------------|----------|------|
| Layout shell | `internal/shared/` | Always shared |
| Status badges | `internal/shared/` | Always shared |
| Entity sub-views | `internal/shared/{entity}/` | Shared inline lists embedded in parent views |
| Role-specific List/View/Form | `{role}/{entity}/` | Different columns, fields, or actions per role |

## Naming Conventions

| Pattern | Example | Used For |
|---------|---------|----------|
| `{entity}s-list.tsx` | `journals-list.tsx` | DataGrid list page |
| `{entity}s-toolbar.tsx` | `journals-toolbar.tsx` | List page toolbar (add button) |
| `{entity}-view.tsx` | `journal-view.tsx` | Detail view page |
| `{entity}-form.tsx` | `journal-form.tsx` | Create/edit form |
| `{entity}-toolbar.tsx` | `journal-toolbar.tsx` | View/Edit toolbar switch |
| `*-badge.tsx` | `submission-status-badge.tsx` | Status indicator |

## OneOf Utility Type

```typescript
// types/app.d.ts
type UnionKeys<T> = T extends T ? keyof T : never;
type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never;
type OneOf<T extends NonNullable<unknown>[]> = {
  [K in keyof T]: Expand<T[K] & Partial<Record<Exclude<UnionKeys<T[number]>, keyof T[K]>, never>>>;
}[number];
```
