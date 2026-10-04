export type Factory<EntityClass, EntityProps> = {
  create: (data: Partial<EntityProps>) => Promise<EntityClass>
}
