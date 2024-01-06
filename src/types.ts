import {
  Query as GQLQuery,
  Mutation as GQLMutation
} from '../generated/graphql';
import { keysAsRegExp } from './util';
import { OperationToQuery } from '../generated/graphql-operations';

export const operationsAsRegExp = () => keysAsRegExp(OperationToQuery);

type Query = Omit<GQLQuery, '__typename'> & Omit<GQLMutation, '__typename'>;

type TupleToUnion<T extends ReadonlyArray<string>> = T[number];

type SelectQueries<key extends keyof OperationToQuery> = {
  [QKey in TupleToUnion<OperationToQuery[key]>]: QKey extends keyof Query
    ? Query[QKey]
    : never;
};

type SelectQueryType<key extends keyof OperationToQuery> = TupleToUnion<
  OperationToQuery[key]
> extends keyof Query
  ? Query[TupleToUnion<OperationToQuery[key]>]
  : never;

type HasOneQuery<key extends keyof OperationToQuery> =
  OperationToQuery[key]['length'] extends 1 ? true : false;

export type OperationToType<key extends keyof OperationToQuery> =
  HasOneQuery<key> extends true ? SelectQueryType<key> : SelectQueries<key>;
