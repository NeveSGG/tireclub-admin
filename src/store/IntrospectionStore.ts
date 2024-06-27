// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { observable, action, makeObservable, runInAction } from 'mobx';

// API
import api from 'api';

// Types
import {
  IApiMeta,
  IGenericErrorWithData,
  IIntrospectData,
  IIntrospectedRoute,
  IIntrospectObject
} from 'types/types';

import axios from 'axios';

interface IErrorWithData {
  isOk: boolean;
  msg: string;
  data: Array<IIntrospectedRoute>;
}

const API_META_STORAGE_KEY = '__bushido__api';

class IntrospectionStore {
  @observable
  introspection: IIntrospectObject = {};

  @observable
  introspectionRoutes: Array<IIntrospectedRoute> =
    JSON.parse(localStorage.getItem('routes') || '[]') || [];

  /** TODO: Refactor this loading scheme */
  @observable
  introspectionRoutesLoading = false;

  @observable
  apiMetaLoading = false;

  @observable
  introspectionLoading = false;

  @observable
  apiMeta: IApiMeta = JSON.parse(
    localStorage.getItem(API_META_STORAGE_KEY) || '{"fields": {}}'
  );

  constructor() {
    makeObservable(this);

    this.introspectionRoutes.forEach((el) => {
      if (el.in_admin) {
        this.introspection[el.url.slice(1)] = JSON.parse(
          localStorage.getItem(el.url.slice(1)) ||
            '{"rels":{},"fields":{},"media":[]}'
        ) || { rels: {}, fields: {}, media: [] };
      }
    });
  }

  @action
  getApiMeta = async (): Promise<IGenericErrorWithData<IApiMeta>> => {
    this.apiMetaLoading = true;

    const res = {
      isOk: false,
      msg: '',
      data: {
        fields: {}
      }
    };

    try {
      const apiMetaInfo = await api.apiMeta.getApiMeta();
      runInAction(() => {
        if (apiMetaInfo.status === 200) {
          if (!apiMetaInfo.data) {
            throw new Error('aaa ебать блять');
          }
          this.apiMeta = apiMetaInfo.data;

          res.isOk = true;
          res.msg = 'Информация получена';
          res.data = apiMetaInfo.data;
        } else {
          console.error(
            `Error\nCode: ${apiMetaInfo.status}\nStatus: ${apiMetaInfo.statusText}`
          );
          res.isOk = false;
          res.msg = apiMetaInfo.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    } finally {
      this.apiMetaLoading = false;
      localStorage.setItem('__bushido__api', JSON.stringify(this.apiMeta));
    }

    return res;
  };

  @action
  introspectRoutes = async (): Promise<IErrorWithData> => {
    this.introspectionRoutesLoading = true;

    const res = {
      isOk: false,
      msg: '',
      data: [] as Array<IIntrospectedRoute>
    };

    try {
      const introspectedInfo = await api.introspection.introspectRoutes();
      runInAction(() => {
        if (introspectedInfo.status === 200) {
          this.introspectionRoutes = introspectedInfo.data || [];

          res.isOk = true;
          res.msg = 'Информация получена';
          res.data = introspectedInfo.data || [];
        } else {
          console.error(
            `Error\nCode: ${introspectedInfo.status}\nStatus: ${introspectedInfo.statusText}`
          );
          res.isOk = false;
          res.msg = introspectedInfo.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    } finally {
      runInAction(() => {
        this.introspectionRoutesLoading = false;
        localStorage.setItem(
          'routes',
          JSON.stringify(this.introspectionRoutes)
        );
      });
    }

    return res;
  };

  @action
  introspect = async (route: string): Promise<any> => {
    this.introspectionLoading = true;

    const res = {
      isOk: false,
      msg: '',
      data: { fields: {}, rels: {}, media: [] } as IIntrospectData
    };

    try {
      /* deprecated */
      const introspectedInfo = await api.introspection.introspect(route);

      runInAction(() => {
        if (introspectedInfo.status === 200) {
          res.data = introspectedInfo.data ?? {
            rels: {},
            fields: {},
            media: []
          };

          this.introspection[route] = introspectedInfo.data || {
            rels: {},
            fields: {},
            media: []
          };
          localStorage.setItem(
            route,
            JSON.stringify(
              introspectedInfo.data || {
                rels: {},
                fields: {}
              }
            )
          );

          res.isOk = true;
          res.msg = 'Информация о таблице получена';
        } else {
          console.error(
            `Error\nCode: ${introspectedInfo.status}\nStatus: ${introspectedInfo.statusText}`
          );
          res.isOk = false;
          res.msg = introspectedInfo.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    } finally {
      runInAction(() => {
        this.introspectionLoading = false;
      });
    }

    return res;
  };
}

const introspectionStore = new IntrospectionStore();
export default introspectionStore;
