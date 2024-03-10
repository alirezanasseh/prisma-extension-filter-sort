export enum IOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface ISortUtilArgs<T> {
  sort?: keyof T;
  order?: IOrder;
  sortableFields?: (keyof T)[];
}
