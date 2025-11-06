export const CMS_ORDER_TYPES = {
    DB: Symbol(`DB`),
    Collection: Symbol(`Collection`),
    RepositoryMongo: Symbol(`RepositoryMongo`),
    UseCaseFind: Symbol.for('UseCaseFind'),
    UseCaseSave: Symbol.for('UseCaseSave'),
}