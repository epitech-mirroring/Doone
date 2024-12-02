export type IdOf<T> = T extends { id: infer U } ? U : never;
export type SlugOf<T> = T extends { slug: infer U } ? U : never;

export * from './permissions';
export * from './user';
export * from './auth';
export * from './organization';
export * from './teams';
export * from './mail';
