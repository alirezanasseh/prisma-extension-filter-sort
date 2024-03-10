export interface ISortUtilArgs<T> {
  sort?: keyof T;
  order?: 'asc' | 'desc';
  sortableFields?: (keyof T)[];
}
