export type FilterOperator = 'eq' | 'neq' | 'in'

export interface QueryFilter {
  field: string
  operator: FilterOperator
  value: unknown
}

export interface QueryOrder {
  field: string
  ascending: boolean
}

export interface DatabaseQuery {
  table: string
  operation: 'select' | 'insert' | 'update' | 'upsert' | 'delete'
  selection?: string
  values?: unknown
  filters: QueryFilter[]
  orders: QueryOrder[]
  limit?: number
  offset?: number
  count?: 'exact'
  head?: boolean
  resultMode?: 'single' | 'maybeSingle'
  onConflict?: string
  rawOr?: string
}

export interface DatabaseError {
  message: string
  code?: string
}

export type QueryData = any[] & Record<string, any>

export interface DatabaseResult<T = QueryData> {
  data: T | null
  error: DatabaseError | null
  count?: number | null
}

export type QueryExecutor = (query: DatabaseQuery) => Promise<DatabaseResult>

export class QueryBuilder implements PromiseLike<DatabaseResult> {
  private readonly query: DatabaseQuery

  constructor(
    table: string,
    private readonly executeQuery: QueryExecutor,
  ) {
    this.query = {
      table,
      operation: 'select',
      filters: [],
      orders: [],
    }
  }

  select(selection = '*', options?: { count?: 'exact'; head?: boolean }) {
    this.query.selection = selection
    this.query.count = options?.count
    this.query.head = options?.head
    return this
  }

  insert(values: unknown) {
    this.query.operation = 'insert'
    this.query.values = values
    return this
  }

  update(values: unknown) {
    this.query.operation = 'update'
    this.query.values = values
    return this
  }

  upsert(values: unknown, options?: { onConflict?: string }) {
    this.query.operation = 'upsert'
    this.query.values = values
    this.query.onConflict = options?.onConflict
    return this
  }

  delete() {
    this.query.operation = 'delete'
    return this
  }

  eq(field: string, value: unknown) {
    this.query.filters.push({ field, operator: 'eq', value })
    return this
  }

  neq(field: string, value: unknown) {
    this.query.filters.push({ field, operator: 'neq', value })
    return this
  }

  in(field: string, values: unknown[]) {
    this.query.filters.push({ field, operator: 'in', value: values })
    return this
  }

  not(field: string, _operator: 'is' | 'eq', value: unknown) {
    this.query.filters.push({ field, operator: 'neq', value })
    return this
  }

  or(expression: string) {
    this.query.rawOr = expression
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.query.orders.push({ field, ascending: options?.ascending !== false })
    return this
  }

  limit(limit: number) {
    this.query.limit = limit
    return this
  }

  range(from: number, to: number) {
    this.query.offset = from
    this.query.limit = Math.max(0, to - from + 1)
    return this
  }

  single() {
    this.query.resultMode = 'single'
    return this
  }

  maybeSingle() {
    this.query.resultMode = 'maybeSingle'
    return this
  }

  then<TResult1 = DatabaseResult, TResult2 = never>(
    onfulfilled?: ((value: DatabaseResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.executeQuery(structuredClone(this.query)).then(onfulfilled, onrejected)
  }
}

export function createQueryClient(executor: QueryExecutor) {
  return {
    from(table: string) {
      return new QueryBuilder(table, executor)
    },
  }
}
