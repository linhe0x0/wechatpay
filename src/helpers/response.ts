export interface ResponseData<T> {
  data: T
}

export interface ResponseError {
  code: string
  message: string
  detail: {
    field: string
    value: any
    issue: string
    location: string
  }
}
