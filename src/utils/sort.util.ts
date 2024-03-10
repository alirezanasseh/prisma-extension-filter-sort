import { ISortUtilArgs } from '../types/sort-util.type';

export function sortUtil<T>(params: ISortUtilArgs<T>) {
  const { sort, sortableFields } = params;
  let { order } = params;
  let result: Record<string, any> = {};
  if (!sort) {
    return result;
  }
  if (sortableFields && !sortableFields.includes(sort)) {
    throw new Error(
      `Invalid sort field: ${sort.toString()}, must be one of: ${sortableFields.join(', ')}`,
    );
  }
  if (!order) {
    order = 'asc';
  }
  if (!['asc', 'desc'].includes(order)) {
    throw new Error('Invalid order, must be asc or desc');
  }
  if (sort) {
    result = { [sort]: order };
  }
  return result;
}
