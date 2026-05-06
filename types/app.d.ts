type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UnionKeys<T> = T extends T ? keyof T : never;
type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never;
type OneOf<T extends NonNullable<unknown>[]> = {
  [K in keyof T]: Expand<T[K] & Partial<Record<Exclude<UnionKeys<T[number]>, keyof T[K]>, never>>>;
}[number];
