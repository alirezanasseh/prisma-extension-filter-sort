import { IOrder, ISortUtilArgs } from '../types/sort-util.type';

export function sortUtil(params: ISortUtilArgs) {
  const { sort, sortableFields } = params;
  let { order } = params;
  let result: Record<string, any> = { id: 'desc' };
  if (!sort) {
    return result;
  }
  if (!sortableFields.includes(sort)) {
    throw new Error(
      `Invalid sort field: ${sort}, must be one of: ${sortableFields.join(', ')}`,
    );
  }
  if (!order) {
    order = IOrder.ASC;
  }
  if (!['asc', 'desc'].includes(order)) {
    throw new Error('Invalid order, must be asc or desc');
  }
  if (sort) {
    result = { [sort]: order };
  }
  return result;
}
