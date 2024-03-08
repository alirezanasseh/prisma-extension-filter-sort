import { helpers } from './helpers';
import { FieldType } from '../types/field.type';
import { Modifiers } from '../types/modifier.type';
import { ISearchObject } from '../types/search-object.type';

const FieldTypeModifiers: Record<FieldType, Modifiers[]> = {
  [FieldType.STRING]: [
    Modifiers.CONTAINS,
    Modifiers.STARTS_WITH,
    Modifiers.ENDS_WITH,
  ],
  [FieldType.NUMBER]: [
    Modifiers.GT,
    Modifiers.GTE,
    Modifiers.LT,
    Modifiers.LTE,
  ],
  [FieldType.DATE]: [Modifiers.GT, Modifiers.GTE, Modifiers.LT, Modifiers.LTE],
  [FieldType.BOOLEAN]: [],
  [FieldType.ID]: [],
  [FieldType.ENUM]: [],
  [FieldType.ARRAY]: [Modifiers.CONTAINS],
};

function checkModifier(modifier: string, type: FieldType): boolean {
  const validModifiers = FieldTypeModifiers[type] || [];
  return helpers.enum.existsInEnum(validModifiers, modifier);
}

function parseQueryObject(params: {
  filterableFields?: Record<string, FieldType>;
  obj: ISearchObject;
}) {
  const { obj, filterableFields } = params;
  const result: any = {};
  // Sample obj: { id: '1', 'name.contains': 'John', 'createdAt.GTE': '2024-01-01', OR: [{ 'age.lt': 18 }, { 'age.gt': 80 }] }
  for (const key of Object.keys(obj)) {
    // Sample key: 'id', 'name.contains', 'createdAt.GTE', 'OR'
    let value = obj[key];
    // Sample value: '1', 'John', '2024-01-01', [{ 'age.lt': 18 }, { 'age.gt': 80 }]
    const keyParts = key.split('.');
    // Sample keyParts: ['id'], ['name', 'contains'], ['createdAt', 'GTE'], ['OR']
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
        if (filterableFields) {
          // Sample filterableFields: { id: FieldType.ID, name: FieldType.STRING, createdAt: FieldType.DATE, age: FieldType.NUMBER }
          if (!Object.keys(filterableFields).includes(key)) {
            throw new Error(
              `filterable fields for this model are: ${Object.keys(filterableFields)}`,
            );
          }
          if (filterableFields[key] === FieldType.DATE && typeof value === 'string') {
            // Sample value: '2024-01-01'
            value = new Date(value);
          }
          if (filterableFields[key] === FieldType.STRING) {
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
        if (!checkModifier(modifier, filterableFields[field])) {
          throw new Error(
            `Invalid modifier '${modifier}' for field '${field}' of type '${filterableFields[field]}', valid modifiers are: ${FieldTypeModifiers[filterableFields[field]].join(', ')}`,
          );
        }
        if (filterableFields[field] === FieldType.DATE && typeof value === 'string') {
          value = new Date(value);
        }
        if (filterableFields[field] === FieldType.STRING) {
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

export function queryUtil(params: {
  search?: string;
  filterableFields?: Record<string, FieldType>;
  accessControlFields?: Record<string, any>;
}) {
  const { search, filterableFields, accessControlFields } = params;
  if (!search) {
    return accessControlFields || {};
  }
  let queryObject: any;
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
