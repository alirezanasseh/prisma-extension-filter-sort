import { ISortUtilArgs } from './sort-util.type';
import { IPagination } from './pagination.type';
import { FieldType } from './field.type';

export type IFindManyUtilArgs<T> =
  {
    model: any;
    search?: string;
    filterableFields?: Record<keyof T, FieldType>
    accessControlFields?: Record<keyof T, any>;
    include?: any;
    select?: any;
    where?: any;
  } &
  ISortUtilArgs<T> &
  IPagination;
