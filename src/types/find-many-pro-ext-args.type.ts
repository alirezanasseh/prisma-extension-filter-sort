import { IFindManyUtilArgs } from './find-many-util-args.type';

export type IFindManyProExtArgs<T, K> = Omit<IFindManyUtilArgs<T, K>, 'model'>;
