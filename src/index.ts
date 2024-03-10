import { Prisma } from '@prisma/client/extension'
import { IFindManyProExtArgs } from './types/find-many-pro-ext-args.type';
import { findManyUtil } from './utils/find-many.util';
import { FieldType } from './types/field.type';

type Args = {}

export const findManyProExtension = (_extensionArgs: Args) =>
  Prisma.defineExtension({
    name: "prisma-extension-filter-sort",
    model: {
      $allModels: {
        async findManyPro<T>(args: Omit<IFindManyUtilArgs<T>, 'model'>) {
          try {
            return await findManyUtil<T>({
              ...args,
              model: Prisma.getExtensionContext(this),
            });
          } catch (error) {
            throw error;
          }
        },
      },
    },
  })

export { FieldType };