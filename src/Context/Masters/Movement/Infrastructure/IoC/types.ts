export const MOVEMENT_TYPES = {
    MongoRepository: Symbol.for(`${__dirname}MongoRepository`),
    UseCaseFind: Symbol.for(`${__dirname}UseCaseFind`),
    UseCaseGetAll: Symbol.for(`${__dirname}UseCaseGetAll`),
    UseCaseInsertOne: Symbol.for(`${__dirname}UseCaseInsertOne`),
    UseCaseUpdateOne: Symbol.for(`${__dirname}UseCaseUpdateOne`),
}