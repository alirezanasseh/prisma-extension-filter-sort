function existsInEnum(enumType: any, value: string) {
  const stringEnum = Object.values(enumType) as string[];
  return stringEnum.includes(value);
}

export const EnumHelpers = {
  existsInEnum,
};
