import { helpers } from './helpers';
import { FieldType } from '../types/field.type';
import { Modifiers } from '../types/modifier.type';

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
  filterableFields: Record<string, FieldType>;
  obj: object;
}) {
  const { obj, filterableFields } = params;
  const result = {};
  for (const key of Object.keys(obj)) {
    const keyParts = key.split('.');
    if (keyParts.length === 1) {
      if (key === 'OR') {
        if (!Array.isArray(obj[key])) {
          throw new Error('OR condition should be an array');
        }
        result['OR'] = obj[key].map((innerObj: object) =>
          parseQueryObject({ obj: innerObj, filterableFields }),
        );
      } else {
        if (!Object.keys(filterableFields).includes(key)) {
          throw new Error(
            `filterable fields for this model are: ${Object.keys(filterableFields)}`,
          );
        }
        let value = obj[key];
        if (filterableFields[key] === FieldType.DATE) {
          value = new Date(value);
        }
        if (filterableFields[key] === FieldType.STRING) {
          result[key] = { equals: value, mode: 'insensitive' };
        } else {
          result[key] = { equals: value };
        }
      }
    } else {
      const field = keyParts[0];
      const modifier = keyParts[1];
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
      let value = obj[key];
      if (filterableFields[field] === FieldType.DATE) {
        value = new Date(value);
      }
      if (filterableFields[field] === FieldType.STRING) {
        result[field] = { [modifier]: value, mode: 'insensitive' };
      } else {
        result[field] = { [modifier]: value };
      }
    }
  }
  return result;
}

export function queryUtil(params: {
  search: string;
  filterableFields: Record<string, FieldType>;
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
