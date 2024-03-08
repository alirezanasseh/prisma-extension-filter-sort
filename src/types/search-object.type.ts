export interface ISearchObject {
  [key: string]: string | number | boolean | Date | ISearchObject[];
  OR: ISearchObject[];
}
