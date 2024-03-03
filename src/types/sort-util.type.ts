export enum IOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface ISortUtilArgs {
  sort: string;
  order: IOrder;
  sortableFields: string[];
}
