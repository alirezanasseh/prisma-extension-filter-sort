import { IFindManyProArgs } from './find-many-pro-args.type';
import { FieldType } from './field.type';

export type IFindManyUtilArgs<T, K> = IFindManyProArgs & {
  filterableFields: Partial<{
    [key in keyof T]: FieldType;
  }>;
  model: any;
  accessControlFields?: Record<string, any>;
  include?: any;
  select?: K;
  where?: any;
};
