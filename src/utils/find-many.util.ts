import { paginate } from './paginator.util';
import { queryUtil } from './query.util';
import { sortUtil } from './sort.util';
import { IFindManyUtilArgs } from '../types/find-many-util-args.type';

export async function findManyUtil<T, K = any>(
  params: IFindManyUtilArgs<T, K>,
) {
  const {
    search,
    sort,
    order,
    page,
    perPage,
    filterableFields,
    model,
    accessControlFields,
    include,
    select,
    where,
  } = params;
  try {
    return await paginate<T>(
      model,
      {
        where: {
          ...where,
          ...queryUtil({
            search,
            filterableFields,
            accessControlFields,
          }),
        },
        orderBy: sortUtil({
          sort,
          order,
          sortableFields: Object.keys(filterableFields),
        }),
        include,
        select,
      },
      { page, perPage },
    );
  } catch (error) {
    throw error;
  }
}
