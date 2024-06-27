// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { observable, action, makeObservable, runInAction } from 'mobx';

// API
import api from 'api';

// Types
import {
  IPaginate,
  IMedia,
  IMediaData,
  IMediaIntrospectObj,
  IPaginatedListing
} from 'types/types';

import axios from 'axios';
import introspectionStore from './IntrospectionStore';

interface IError {
  isOk: boolean;
  msg: string;
  data: IPaginatedListing<Array<any>>;
}

interface IMediaError {
  isOk: boolean;
  msg: string;
  introspect: IMediaIntrospectObj | null;
  media: IMediaData;
}

interface IItemError {
  isOk: boolean;
  msg: string;
  data: any;
}

interface IVoidError {
  isOk: boolean;
  msg: string;
}

export enum PageVariant {
  nextPage,
  prevPage,
  currentPage
}

class MainStore {
  @observable
  perPage = 10;

  @observable
  list: IPaginatedListing<Array<any>> = {
    current_page: 1,
    last_page: 1,
    per_page: this.perPage,
    total: 0,
    data: []
  };

  @observable
  item: any = {};

  @observable
  itemLoading = false;

  @observable
  mediaLoading = false;

  @observable
  listLoading = false;

  @observable
  deletingItem = '';

  @observable
  updatingItem = '';

  @observable
  searchString: string | undefined = '';

  constructor() {
    makeObservable(this);
  }

  @action
  setPerPage = (newPerPage: number): void => {
    this.perPage = newPerPage;
  };

  @action
  getList = async (
    route: string,
    pagination?: IPaginate,
    query?: string,
    searchBy?: string
  ): Promise<IError> => {
    this.listLoading = true;

    const res: IError = {
      isOk: false,
      msg: '',
      data: {
        current_page: 1,
        per_page: this.perPage,
        last_page: 1,
        total: 0,
        data: []
      }
    };

    try {
      console.log(route, pagination || { paginate: true }, query, searchBy);
      const listData = await api.main.listing(
        route,
        pagination || { paginate: true },
        query,
        searchBy
      );

      runInAction(() => {
        if (listData.status === 200) {
          this.list = listData.data || {
            current_page: 1,
            per_page: this.perPage,
            last_page: 1,
            total: 0,
            data: []
          };

          res.data = listData.data || {
            current_page: 1,
            per_page: this.perPage,
            last_page: 1,
            total: 0,
            data: []
          };
          res.isOk = true;
          res.msg = `Получен список ${route}`;
        } else {
          console.error(
            `Error\nCode: ${listData.status}\nStatus: ${listData.statusText}`
          );
          res.isOk = false;
          res.msg = listData.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    } finally {
      runInAction(() => {
        this.listLoading = false;
      });
    }

    return res;
  };

  @action
  cleanList = (): void => {
    this.list = {
      current_page: 1,
      last_page: 1,
      per_page: this.perPage,
      total: 0,
      data: []
    };
  };

  @action
  getListQuit = async (route: string, pagination?: IPaginate): Promise<any> => {
    const res = {
      isOk: false,
      msg: '',
      data: {
        current_page: 1,
        per_page: this.perPage,
        last_page: 1,
        total: 0,
        data: []
      } as any
    };

    try {
      const listData = await api.main.listing(route, pagination || {});

      runInAction(() => {
        if (listData.status === 200) {
          if (listData.data) {
            res.data = listData.data;
          } else {
            res.data = pagination
              ? {
                  current_page: 1,
                  per_page: this.perPage,
                  last_page: 1,
                  total: 0,
                  data: []
                }
              : [];
          }
          res.isOk = true;
          res.msg = `Получен список ${route}`;
        } else {
          console.error(
            `Error\nCode: ${listData.status}\nStatus: ${listData.statusText}`
          );
          res.isOk = false;
          res.msg = listData.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    } finally {
      runInAction(() => {
        this.listLoading = false;
      });
    }

    return res;
  };

  @action
  deleteItem = async (
    route: string,
    uuid: string,
    pagination: IPaginate
  ): Promise<IVoidError> => {
    this.deletingItem = uuid;

    const res: IVoidError = {
      isOk: false,
      msg: ''
    };

    try {
      const result = await api.main.delete(route, uuid);

      runInAction(() => {
        if (result.status === 200) {
          res.isOk = true;
          res.msg = `Получен список ${route}`;

          this.listLoading = true;

          const listData = this.getListQuit(route, {
            ...pagination
          });

          listData.then((newval) => {
            if (newval.isOk) {
              this.list = newval.data || {
                current_page: 1,
                per_page: this.perPage,
                last_page: 1,
                total: 0,
                data: []
              };
            }

            this.listLoading = false;
          });
        } else {
          console.error(
            `Error\nCode: ${result.status}\nStatus: ${result.statusText}`
          );
          res.isOk = false;
          res.msg = result.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    } finally {
      runInAction(() => {
        this.deletingItem = '';
      });
    }

    return res;
  };

  @action
  sortItem = async (
    route: string,
    id: string, // uuid
    data: any, // data with new sort or old sort for other pages
    page: PageVariant, // which page
    pagination: IPaginate,
    ind: number // index in list
  ) => {
    this.updatingItem = id;
    const arrCopy = [...(this.list.data || [])];
    const res: IVoidError = {
      isOk: false,
      msg: ''
    };
    let newSort = data.sort;

    switch (page) {
      case PageVariant.nextPage: {
        const nextPageData = await this.getListQuit(route, {
          ...pagination,
          page: (pagination.page || 1) + 1
        });

        if (nextPageData.isOk) {
          if (this.list.data && nextPageData.data && nextPageData.data.data) {
            newSort = Math.floor(
              (this.list.data[this.list.data.length - 1].sort +
                nextPageData.data.data[0].sort) /
                2
            );
          }
        }

        break;
      }
      case PageVariant.prevPage: {
        const prevPageData = await this.getListQuit(route, {
          ...pagination,
          page: (pagination.page || 2) - 1
        });

        if (prevPageData.isOk) {
          if (this.list.data && prevPageData.data && prevPageData.data.data) {
            newSort = Math.floor(
              (this.list.data[this.list.data.length - 1].sort +
                prevPageData.data.data[0].sort) /
                2
            );
          }
        }

        break;
      }
      default: {
        break;
      }
    }

    try {
      if (this.list.data?.length) {
        this.list.data[ind].sort = newSort;
        this.list.data = [
          ...this.list.data.sort(
            (a, b) => parseInt(a.sort, 10) - parseInt(b.sort, 10)
          )
        ];
      }
      const result = await api.main.patch(route, id, {
        ...data,
        sort: newSort
      });

      runInAction(() => {
        if (result.status === 200) {
          res.isOk = true;
          res.msg = `Элемент перемещён`;
        } else {
          this.list.data = [...arrCopy];
          console.error(
            `Error\nCode: ${result.status}\nStatus: ${result.statusText}`
          );
          res.isOk = false;
          res.msg = result.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    } finally {
      runInAction(() => {
        this.updatingItem = '';
      });
    }

    return res;
  };

  @action
  moveItem = async (
    route: string,
    id: string,
    data: any,
    page: number,
    pagination: IPaginate
  ) => {
    this.listLoading = true;
    const res: IVoidError = {
      isOk: false,
      msg: ''
    };
    let newSort1 = 0;
    let newSort2 = 0;

    const pageData = await this.getListQuit(route, {
      ...pagination,
      page
    });

    if (pageData.isOk) {
      if (pageData.data && pageData.data.data) {
        newSort1 = pageData.data.data[0].sort;
        if (pageData.data.data.length > 1) {
          newSort2 = pageData.data.data[1].sort;
        } else {
          newSort2 = pageData.data.data[0].sort + 200;
        }
      }
    } else {
      res.msg = pageData.msg;
      this.listLoading = false;
      return res;
    }

    try {
      const result = await api.main.patch(route, id, {
        ...data,
        sort: Math.floor((newSort1 + newSort2) / 2)
      });

      runInAction(() => {
        if (result.status === 200) {
          res.isOk = true;
          res.msg = `Элемент перемещён на страницу ${page}`;

          const listData = this.getListQuit(route, {
            ...pagination
          });

          listData.then((newval) => {
            if (newval.isOk) {
              this.list = newval.data || {
                current_page: 1,
                per_page: this.perPage,
                last_page: 1,
                total: 0,
                data: []
              };
            }
          });
        } else {
          console.error(
            `Error\nCode: ${result.status}\nStatus: ${result.statusText}`
          );
          res.isOk = false;
          res.msg = result.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    } finally {
      runInAction(() => {
        this.listLoading = false;
      });
    }

    return res;
  };

  @action
  createItem = async (route: string, data: any, pagination: IPaginate) => {
    const res: IVoidError = {
      isOk: false,
      msg: ''
    };

    let generateSlug = false;

    if (introspectionStore.introspection[route]?.fields.slug && !data.slug) {
      generateSlug = true;
    }

    try {
      const result = await api.main.post(route, data, generateSlug);

      runInAction(() => {
        if (result.status === 201) {
          res.isOk = true;
          res.msg = `Элемент создан`;

          const listData = this.getList(route, pagination);

          listData.then((newval) => {
            if (newval.isOk) {
              this.list = newval.data || {
                current_page: 1,
                per_page: this.perPage,
                last_page: 1,
                total: 0,
                data: []
              };
            } else {
              res.isOk = false;
              res.msg = newval.msg;
            }
          });
        } else {
          console.error(
            `Error\nCode: ${result.status}\nStatus: ${result.statusText}`
          );
          res.isOk = false;
          res.msg = result.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    }

    return res;
  };

  @action
  getItem = async (
    route: string,
    uuid: string | undefined
  ): Promise<IItemError> => {
    this.itemLoading = true;
    const res: IItemError = {
      isOk: false,
      msg: '',
      data: {} as any
    };

    try {
      const result = await api.main.get(route, uuid || '');

      runInAction(() => {
        if (result.status === 200) {
          res.isOk = true;
          res.msg = `Элемент получен`;
          res.data = result.data;

          this.item = result.data;
        } else {
          console.error(
            `Error\nCode: ${result.status}\nStatus: ${result.statusText}`
          );

          res.msg = result.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
    } finally {
      this.itemLoading = false;
    }

    return res;
  };

  @action
  updateItem = async (route: string, data: any) => {
    this.updatingItem = data.id;
    const res: IVoidError = {
      isOk: false,
      msg: ''
    };

    let generateSlug = false;

    if (introspectionStore.introspection[route]?.fields.slug && !data.slug) {
      generateSlug = true;
    }

    try {
      const result = await api.main.patch(route, data.id, data, generateSlug);

      runInAction(() => {
        if (result.status === 200) {
          res.isOk = true;
          res.msg = `Элемент изменён`;
        } else {
          console.error(
            `Error\nCode: ${result.status}\nStatus: ${result.statusText}`
          );
          res.isOk = false;
          res.msg = result.statusText || '';
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${error.response?.data.message}`;
      }
      res.isOk = false;
    } finally {
      this.updatingItem = '';
    }

    return res;
  };

  @action
  cleanItem = (): void => {
    this.item = {};
  };

  @action
  getMedia = async (route: string, uuid: string): Promise<IMediaError> => {
    this.mediaLoading = true;

    const res: IMediaError = {
      isOk: false,
      msg: '',
      introspect: null,
      media: {}
    };

    try {
      // const introspectData = await api.main.mediaIntrospect(route, uuid);

      // if (introspectData.status === 200 && introspectData.data) {
      //   res.introspect = { ...introspectData.data };

      const mediaFromAPI = await api.main.mediaGet(route, uuid);

      if (mediaFromAPI.status === 200) {
        res.isOk = true;
        res.msg = 'Медиа получено';

        res.media = { ...mediaFromAPI.data };
      } else {
        console.error(
          `Error\nCode: ${mediaFromAPI.status}\nStatus: ${mediaFromAPI.statusText}`
        );

        res.isOk = false;
        res.msg = mediaFromAPI.name
          ? `Ошибка ${mediaFromAPI.name}: ${mediaFromAPI.message}`
          : `Ошибка ${mediaFromAPI.status}: ${mediaFromAPI.statusText}`;
      }
      // } else {
      //   console.error(
      //     `Error\nCode: ${introspectData.status}\nStatus: ${introspectData.statusText}`
      //   );

      //   res.isOk = false;
      //   res.msg = introspectData.name
      //     ? `Ошибка ${introspectData.name}: ${introspectData.message}`
      //     : `Ошибка ${introspectData.status}: ${introspectData.statusText}`;
      // }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${
          error.response?.data.message || error.name
        }`;
      }

      res.isOk = false;
      console.error(error);
    } finally {
      this.mediaLoading = false;
    }
    return res;
  };

  @action
  assignMedia = async (
    route: string,
    uuid: string,
    slot: string,
    mediaToAssign: IMedia[]
  ): Promise<IVoidError> => {
    this.mediaLoading = true;
    const res: IVoidError = {
      isOk: false,
      msg: ''
    };

    try {
      const mediaFromAPI = await api.main.mediaAssign(
        route,
        uuid,
        slot,
        mediaToAssign.map((el) => el.id)
      );

      runInAction(() => {
        if (mediaFromAPI.status === 200) {
          res.isOk = true;
          res.msg = 'Успешно';
        } else {
          console.error(
            `Error\nCode: ${mediaFromAPI.status}\nStatus: ${mediaFromAPI.statusText}`
          );

          res.isOk = false;
          res.msg = mediaFromAPI.name
            ? `Ошибка ${mediaFromAPI.name}: ${mediaFromAPI.message}`
            : `Ошибка ${mediaFromAPI.status}: ${mediaFromAPI.statusText}`;
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${
          error.response?.data.message || error.name
        }`;
      }

      res.isOk = false;
      console.error(error);
    } finally {
      this.mediaLoading = false;
    }
    return res;
  };

  @action
  uploadToMedia = async (data: FormData): Promise<any> => {
    this.mediaLoading = true;
    const res = {
      isOk: false,
      msg: '',
      data: [] as Array<IMedia> | null
    };

    try {
      const mediaFromAPI = await api.main.mediaPost(data);

      runInAction(async () => {
        if (mediaFromAPI.status === 200) {
          res.isOk = true;
          res.msg = 'Изображения загружены';
          res.data = mediaFromAPI.data;
        } else {
          console.error(
            `Error\nCode: ${mediaFromAPI.status}\nStatus: ${mediaFromAPI.statusText}`
          );

          res.isOk = false;
          res.msg = mediaFromAPI.name
            ? `Ошибка ${mediaFromAPI.name}: ${mediaFromAPI.message}`
            : `Ошибка ${mediaFromAPI.status}: ${mediaFromAPI.statusText}`;
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${
          error.response?.statusText ||
          error.response?.data.message ||
          error.name
        }`;
      } else {
        res.msg = JSON.stringify(error);
      }
      console.error(error);
    } finally {
      this.mediaLoading = false;
    }

    return res;
  };

  @action
  uploadMedia = async (
    route: string,
    uuid: string,
    slot: string,
    data: FormData
  ): Promise<IMediaError> => {
    this.mediaLoading = true;

    const res: IMediaError = {
      isOk: false,
      msg: '',
      introspect: null,
      media: {}
    };

    try {
      const uploadedMedia = await this.uploadToMedia(data);

      if (uploadedMedia.isOk) {
        const assignedMedia = await this.assignMedia(
          route,
          uuid,
          slot,
          uploadedMedia.data
        );

        if (assignedMedia.isOk) {
          res.isOk = true;
          res.msg = 'Файл успешно загружен';
          // eslint-disable-next-line prefer-destructuring
          res.media = { ...uploadedMedia.data };
        } else {
          res.isOk = false;
          res.msg = 'Произошла ошибка при загрузке файла';
        }
      } else {
        res.isOk = false;
        res.msg = 'Произошла ошибка при загрузке файла';
      }
    } catch (error) {
      res.isOk = false;
      res.msg = 'Произошла ошибка при загрузке файла';

      console.error(error);
    } finally {
      this.mediaLoading = false;
    }
    return res;
  };

  @action
  changeMediaSort = async (uuid: string, sort: number): Promise<IVoidError> => {
    this.mediaLoading = true;
    const res = {
      isOk: false,
      msg: ''
    };

    try {
      const mediaFromAPI = await api.main.mediaSort(uuid, sort);

      runInAction(() => {
        if (mediaFromAPI.status === 200) {
          res.isOk = true;
          res.msg = 'Порядок элемента изменён';
        } else {
          console.error(
            `Error\nCode: ${mediaFromAPI.status}\nStatus: ${mediaFromAPI.statusText}`
          );

          res.isOk = false;
          res.msg = mediaFromAPI.name
            ? `Ошибка ${mediaFromAPI.name}: ${mediaFromAPI.message}`
            : `Ошибка ${mediaFromAPI.status}: ${mediaFromAPI.statusText}`;
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${
          error.response?.data.message || error.name
        }`;
      }

      res.isOk = false;

      console.error(error);
    } finally {
      this.mediaLoading = false;
    }

    return res;
  };

  @action
  deleteImage = async (uuid: string): Promise<IVoidError> => {
    this.mediaLoading = true;
    const res: IVoidError = {
      isOk: false,
      msg: ''
    };

    try {
      const response = await api.main.mediaDelete(uuid);

      runInAction(() => {
        if (response.status === 200) {
          res.isOk = true;
          res.msg = 'Изображение удалено';
        } else {
          console.error(
            `Error\nCode: ${response.status}\nStatus: ${response.statusText}`
          );

          res.isOk = false;
          res.msg = response.name
            ? `Ошибка ${response.name}: ${response.message}`
            : `Ошибка ${response.status}: ${response.statusText}`;
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.msg = `${error.message}:\n ${
          error.response?.data.message || error.name
        }`;
      }
      res.isOk = false;

      console.error(error);
    } finally {
      this.mediaLoading = false;
    }

    return res;
  };

  @action setSearchString(s: string) {
    this.searchString = s;
  }

  @action clearSearchString() {
    this.searchString = undefined;
  }
}

const mainStore = new MainStore();
export default mainStore;
