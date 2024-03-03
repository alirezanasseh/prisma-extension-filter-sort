export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export type PaginateOptions = {
  page?: number | string;
  perPage?: number | string;
};

const defaultOptions = {
  page: 1,
  perPage: 10,
};

export async function paginate<T>(
  model: any,
  args?: any,
  options?: PaginateOptions,
): Promise<PaginatedResult<T>> {
  try {
    const page =
      options?.page && Number(options?.page) > 0
        ? Number(options?.page)
        : defaultOptions.page;
    const perPage =
      options?.perPage &&
      Number(options?.perPage) > 0 &&
      Number(options?.perPage) <= 100
        ? Number(options?.perPage)
        : defaultOptions.perPage;

    const skip = perPage * (page - 1);
    const [total, data] = await Promise.all([
      model.count({ where: args.where }),
      model.findMany({
        ...args,
        take: perPage,
        skip,
      }),
    ]);
    const lastPage = Math.ceil(total / perPage) || 1;

    return {
      meta: {
        total,
        lastPage,
        currentPage: page,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
      data,
    };
  } catch (error) {
    throw error;
  }
}
