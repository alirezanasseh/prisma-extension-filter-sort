import { helpers } from './helpers';
import { FieldType } from '../types/field.type';
import { Modifiers } from '../types/modifier.type';
import { ISearchObject } from '../types/search-object.type';
import { IFindManyUtilArgs } from '../types/find-many-util-args.type';

const FieldTypeModifiers: Record<FieldType, Modifiers[]> = {
  string: [
    Modifiers.CONTAINS,
    Modifiers.STARTS_WITH,
    Modifiers.ENDS_WITH,
  ],
  number: [
    Modifiers.GT,
    Modifiers.GTE,
    Modifiers.LT,
    Modifiers.LTE,
  ],
  date: [Modifiers.GT, Modifiers.GTE, Modifiers.LT, Modifiers.LTE],
  boolean: [],
  id: [],
  enum: [],
  array: [Modifiers.CONTAINS],
};

function checkModifier(modifier: string, type: FieldType): boolean {
  const validModifiers = FieldTypeModifiers[type] || [];
  return helpers.enum.existsInEnum(validModifiers, modifier);
}

function parseQueryObject(params: {
  filterableFields?: Partial<{ [key: string]: FieldType }>;
  obj: ISearchObject;
}) {
  const { obj, filterableFields } = params;
  // Sample obj: { id: '1', 'name.contains': 'John', 'createdAt.GTE': '2024-01-01', OR: [{ 'age.lt': 18 }, { 'age.gt': 80 }] }
  const result: any = {};
  // Sample key: 'id', 'name.contains', 'createdAt.GTE', 'OR'
  for (const key of Object.keys(obj)) {
    // Sample value: '1', 'John', '2024-01-01', [{ 'age.lt': 18 }, { 'age.gt': 80 }]
    let value = obj[key];
    // Sample keyParts: ['id'], ['name', 'contains'], ['createdAt', 'GTE'], ['OR']
    const keyParts = key.split('.');
    if (keyParts.length === 1) {
      // Sample key: 'id', 'OR'
      if (key === 'OR') {
        if (!Array.isArray(value)) {
          throw new Error('OR condition should be an array');
        }
        result['OR'] = value.map((innerObj) =>
          // Sample innerObj: { 'age.lt': 18 }, { 'age.gt': 80 }
          parseQueryObject({ obj: innerObj, filterableFields }),
        );
      } else {
        // Sample key: 'id'
        if (filterableFields) {
          // Sample filterableFields: { id: FieldType.ID, name: FieldType.STRING, createdAt: FieldType.DATE, age: FieldType.NUMBER }
          if (!Object.keys(filterableFields).includes(key)) {
            throw new Error(
              `filterable fields for this model are: ${Object.keys(filterableFields)}`,
            );
          }
          if (filterableFields[key] === 'date' && typeof value === 'string') {
            // Sample value: '2024-01-01'
            value = new Date(value);
          }
          if (filterableFields[key] === 'string') {
            // Sample value: 'John'
            result[key] = {equals: value, mode: 'insensitive'};
          } else {
            // Sample value: '1'
            result[key] = value;
          }
        } else {
          result[key] = value;
        }
      }
    } else {
      // Sample key: 'name.contains', 'createdAt.GTE'
      const field = keyParts[0];
      // Sample field: 'name', 'createdAt'
      const modifier = keyParts[1];
      // Sample modifier: 'contains', 'GTE'
      if (filterableFields) {
        if (!Object.keys(filterableFields).includes(field)) {
          throw new Error(
            `filterable fields for this model are: ${Object.keys(filterableFields).join(', ')}`,
          );
        }
        if (!checkModifier(modifier, filterableFields[field]!)) {
          throw new Error(
            `Invalid modifier '${modifier}' for field '${field}' of type '${filterableFields[field]}', valid modifiers are: ${FieldTypeModifiers[filterableFields[field]!].join(', ')}`,
          );
        }
        if (filterableFields[field] === 'date' && typeof value === 'string') {
          value = new Date(value);
        }
        if (filterableFields[field] === 'string') {
          result[field] = {[modifier]: value, mode: 'insensitive'};
        } else {
          result[field] = {[modifier]: value};
        }
      } else {
        result[field] = {[modifier]: value};
      }
    }
  }
  return result;
}

export function queryUtil<T>(params: Pick<IFindManyUtilArgs<T>, 'search' | 'filterableFields' | 'accessControlFields'>) {
  const { search, filterableFields, accessControlFields } = params;
  if (!search) {
    return accessControlFields || {};
  }
  let queryObject: ISearchObject;
  try {
    queryObject = JSON.parse(search);
  } catch (e) {
    throw new Error('Invalid search JSON');
  }
  try {
    return {
      ...parseQueryObject({ obj: queryObject, filterableFields }),
      ...accessControlFields,
    };
  } catch (error) {
    throw error;
  }
}
