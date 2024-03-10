# Prisma filter and sort extension

This extension enables you to get filters and sorts for your Prisma models from the query string.

## Installation

```bash
npm install prisma-filter-sort

yarn add prisma-filter-sort
```

## Usage

```typescript
import { findManyProExtension } from 'prisma-extension-filter-sort';
import { PrismaClient, Notes } from '@prisma/client'

const prisma = new PrismaClient().$extends(findManyProExtension({}))

const notes = await prisma.notes.findManyPro<Notes>({
    // Fields comming from the request query string
    search: '{"title.contains": "work"}',
    sort: 'createdAt',
    order: 'desc',
    page: 1,
    perPage: 10,
    // Control fields you add
    filterableFields: {
      id: 'id',
      title: 'string',
      content: 'string',
    },
    sortableFields: ['id', 'createdAt'],
    accessControlFields: {
      authorId: user.id,
    },
})
```
## Options

- `search` - A JSON stringified object about the filters you want to apply to the query.
- `sort` - The field you want to sort by.
- `order` - The order you want to sort by.
- `page` - The page you want to get.
- `perPage` - The amount of items you want to get per page.
- `filterableFields` - An object with the fields you want to be able to filter by and their types.
- `sortableFields` - An array with the fields you want to be able to sort by.
- `accessControlFields` - An object you want to add to the query for access control.

## Search format

The search format is a JSON stringified object with the following format:

```json
{
  "field": "value",
  "field2.modifier": "value",
  "OR": [
    {
      "field3": "value"
    },
    {
      "field4.modifier": "value"
    }
  ]
}
```
if you don't use the `modifier` the default is `equals`.
each field type has its own modifiers:
- `string`:
  - `contains`
  - `startsWith`
  - `endsWith`
- `number`:
  - `gt`
  - `gte`
  - `lt`
  - `lte`
- `date`:
  - `gt`
  - `gte`
  - `lt`
  - `lte`
- Other types don't have modifiers (they will use equals logic).

A sample search string would be:
```
{ "title.contains": "work", "content.startsWith": "This is", "createdAt.gte": "2021-01-01", "OR": [{ "title.contains": "work" },{ "content.startsWith": "This is" }]}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT