import { useFormik } from 'formik';
import * as Yup from 'yup';

export interface IResponse<T> {
  data: T | null;
  status?: number;
  statusText?: string;
  message?: string;
  name?: string;
}

export interface IMedia {
  id: string;
  path: string;
  sort?: number | null;
  mime_specific_type?: string | null;
  mime_global_type?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface IMediaData {
  [field: string]: Array<IMedia>;
}

export interface IPaginatedListing<T> {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  data: T | null;
}

export interface IPaginate {
  page?: number;
  paginate?: boolean;
  perpage?: number;
  lastpage?: number;
}

export interface IIntrospectedRoute {
  in_admin: boolean;
  key: string;
  url: string;
  name: string;
  icon: string;
  model_name: string;
}

export interface IIntrospectFields {
  [key: string]: {
    type: string;
    required: boolean;
    label: string;
    show: boolean;
    schema: null | string;
  };
}

export interface IIntrospectMedia {
  key: number;
  label: string;
  mime: Array<string>;
  multiple: boolean;
  name: string;
}

export interface IIntrospectData {
  rels: {
    [key: string]: [string, string, string | null, string];
  };
  fields: IIntrospectFields;
  media: Array<IIntrospectMedia>;
}

export interface IIntrospectObject {
  [route: string]: IIntrospectData;
}

export type Formik = ReturnType<typeof useFormik>;

export type Schema = Yup.ObjectSchema<
  {
    [x: string]: unknown;
  },
  Yup.AnyObject,
  {
    [x: string]: unknown;
  },
  ''
>;

export interface IRegistrationData {
  name: string;
  email: string;
  password: string;
  device_name: string;
}

export interface IMediaIntrospect {
  slot: string;
  label: string;
  global_mime_type: string | null;
  specific_mime_type: string | null;
}

export interface IMediaIntrospectObj {
  [f: string]: IMediaIntrospect;
}

export interface IApiMeta {
  fields: IIntrospectFields;
}

export interface IGenericErrorWithData<T> {
  isOk: boolean;
  msg: string;
  data: T;
}
