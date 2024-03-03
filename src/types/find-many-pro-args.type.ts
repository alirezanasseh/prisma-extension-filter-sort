import { IOrder } from './sort-util.type';

export interface IFindManyProArgs {
  search?: string;
  sort?: string;
  order?: IOrder;
  page?: number;
  perPage?: number;
}
