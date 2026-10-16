export type GenericAsyncState<T> =
  | { status: 'idle'; value: null; error: null }
  | { status: 'loading'; value: null; error: null }
  | { status: 'success'; value: T; error: null }
  | { status: 'error'; value: null; error: string };
