import { paginate } from './paginator.util';
import { queryUtil } from './query.util';
import { sortUtil } from './sort.util';
import { IFindManyUtilArgs } from '../types/find-many-util-args.type';

export async function findManyUtil<T>(
  params: IFindManyUtilArgs<T>,
) {
  const {
    search,
    sort,
    sortableFields,
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
          ...queryUtil<T>({
            search,
            filterableFields,
            accessControlFields,
          }),
        },
        orderBy: sortUtil<T>({
          sort,
          order,
          sortableFields,
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
