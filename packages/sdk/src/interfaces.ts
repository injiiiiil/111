import { InterfaceDeclaration } from './integration/definition'
import z from './zui'

const withId = (schema: z.ZodTypeAny) => z.intersection(schema, z.object({ id: z.string() }))

const capitalize = (s: string) => s[0]!.toUpperCase() + s.slice(1)
const camelCase = (...parts: string[]) => {
  const [first, ...rest] = parts.filter((s) => s.length > 0).map((s) => s.toLowerCase())
  if (!first) {
    return ''
  }
  return [first, ...rest.map(capitalize)].join('')
}

const nextToken = z.string().optional()
export const listable = new InterfaceDeclaration({
  name: 'listable',
  version: '0.0.1',
  entities: {
    item: {
      schema: z.object({
        id: z.string(),
      }),
    },
  },
  events: {},
  actions: {
    list: {
      input: {
        schema: () => z.object({ nextToken }),
      },
      output: {
        schema: (args) =>
          z.object({
            items: z.array(withId(args.item)),
            meta: z.object({ nextToken }),
          }),
      },
    },
  },
  templateName: (name, props) => camelCase(props.item, name), // issueList
})

export const creatable = new InterfaceDeclaration({
  name: 'creatable',
  version: '0.0.1',
  entities: {
    item: {
      schema: z.object({
        id: z.string(),
      }),
    },
  },
  events: {
    created: {
      schema: (args) =>
        z.object({
          item: withId(args.item),
        }),
    },
  },
  actions: {
    create: {
      input: {
        schema: (args) => z.object({ item: args.item }),
      },
      output: {
        schema: (args) => z.object({ item: withId(args.item) }),
      },
    },
  },
  templateName: (name, props) => camelCase(props.item, name), // issueCreate, issueCreated
})

export const readable = new InterfaceDeclaration({
  name: 'readable',
  version: '0.0.1',
  entities: {
    item: {
      schema: z.object({
        id: z.string(),
      }),
    },
  },
  events: {},
  actions: {
    read: {
      input: {
        schema: () => z.object({ id: z.string() }),
      },
      output: {
        schema: (args) => z.object({ item: withId(args.item) }),
      },
    },
  },
  templateName: (name, props) => camelCase(props.item, name), // issueRead
})

export const updatable = new InterfaceDeclaration({
  name: 'updatable',
  version: '0.0.1',
  entities: {
    item: {
      schema: z.object({
        id: z.string(),
      }),
    },
  },
  events: {
    updated: {
      schema: (args) =>
        z.object({
          item: withId(args.item),
        }),
    },
  },
  actions: {
    update: {
      input: {
        schema: (args) => z.object({ id: z.string(), item: args.item }),
      },
      output: {
        schema: (args) => z.object({ item: withId(args.item) }),
      },
    },
  },
  templateName: (name, props) => camelCase(props.item, name), // issueUpdate, issueUpdated
})

export const deletable = new InterfaceDeclaration({
  name: 'deletable',
  version: '0.0.1',
  entities: {
    item: {
      schema: z.object({
        id: z.string(),
      }),
    },
  },
  events: {
    deleted: {
      schema: (args) =>
        z.object({
          item: withId(args.item),
        }),
    },
  },
  actions: {
    delete: {
      input: {
        schema: () => z.object({ id: z.string() }),
      },
      output: {
        schema: (args) => z.object({ item: withId(args.item) }),
      },
    },
  },
  templateName: (name, props) => camelCase(props.item, name), // issueDelete, issueDeleted
})

export const hitl = new InterfaceDeclaration({
  name: 'hitl',
  version: '0.0.1',
  entities: {},
  events: {},
  actions: {
    startHITL: {
      input: {
        schema: () => z.object({ upstreamConversationId: z.string() }),
      },
      output: {
        schema: () => z.object({ downstreamConversationId: z.string() }),
      },
    },
  },
})
