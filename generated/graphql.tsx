export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Base64ImageData: string;
};

export type Role = 
  | 'USER'
  | 'ADMIN';

export type User = {
  readonly __typename: 'User';
  readonly name: Maybe<Scalars['String']>;
  readonly email: Maybe<Scalars['String']>;
  readonly username: Scalars['String'];
  readonly roles: ReadonlyArray<Role>;
};

export type BasicTask = {
  readonly __typename: 'BasicTask';
  readonly id: Scalars['String'];
  readonly uid2: Scalars['String'];
  readonly uan: Maybe<Scalars['String']>;
  readonly assignee: Scalars['String'];
  readonly description: Scalars['String'];
};

export type TaskStatistics = {
  readonly __typename: 'TaskStatistics';
  readonly readyCount: Scalars['Int'];
  readonly waitingCount: Scalars['Int'];
  readonly totalCount: Scalars['Int'];
};


export type Query = {
  readonly __typename: 'Query';
  readonly user: User;
  readonly task: Maybe<BasicTask>;
  readonly statistics: TaskStatistics;
};

export type AddNoteResponse = {
  readonly __typename: 'AddNoteResponse';
  readonly success: Scalars['Boolean'];
};

export type Mutation = {
  readonly __typename: 'Mutation';
  readonly addNote: AddNoteResponse;
};