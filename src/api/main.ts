import axios from 'api/utilities/axios';
import { createSlug } from 'helpers/functions';
import {
  IResponse,
  IPaginate,
  IPaginatedListing,
  IMedia,
  IMediaData
} from 'types/types';

type IObject = {
  [name: string]: any;
};

export default {
  async listing(
    route: string,
    pagination: IPaginate,
    query?: string,
    searchBy?: string
  ): Promise<IResponse<IPaginatedListing<Array<any>>>> {
    const response = await axios.get(`/${route}`, {
      params: { ...pagination, query, searchBy }
    });

    return response;
  },

  async delete(route: string, uuid: string): Promise<IResponse<any>> {
    const response = await axios.delete(`/${route}/${uuid}`);

    return response;
  },

  async patch(
    route: string,
    uuid: string,
    data: IObject,
    generateSlug = false
  ): Promise<IResponse<any>> {
    const dataToSend = { ...data };

    if (generateSlug) {
      dataToSend.slug = createSlug(data);
    }

    const response = await axios.patch(`/${route}/${uuid}`, {
      ...dataToSend
    });

    return response;
  },

  async post(
    route: string,
    data: IObject,
    generateSlug = false
  ): Promise<IResponse<any>> {
    const dataToSend = { ...data };

    if (generateSlug) {
      dataToSend.slug = createSlug(data);
    }

    const response = await axios.post(`/${route}`, {
      ...dataToSend
    });

    return response;
  },

  async get(route: string, uuid: string): Promise<IResponse<any>> {
    const response = await axios.get(`/${route}/${uuid}`);

    return response;
  },

  async mediaPost(formData: FormData): Promise<IResponse<Array<IMedia>>> {
    const response = await axios.post(`media/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response;
  },

  async mediaGet(route: string, uuid: string): Promise<IResponse<IMediaData>> {
    const response = await axios.get(`${route}/${uuid}/media`);

    return response;
  },

  async mediaDelete(id: string): Promise<IResponse<unknown>> {
    const response = await axios.post(`media/${id}/delete`);

    return response;
  },

  async mediaAssign(
    route: string,
    uuid: string,
    slot: string,
    uuids: Array<string>
  ): Promise<IResponse<unknown>> {
    const response = await axios.post(
      `${route}/${uuid}/media/assign/${slot}`,
      uuids
    );

    return response;
  },

  async mediaReplace(
    route: string,
    uuid: string,
    slot: string,
    newUuid: string
  ): Promise<IResponse<unknown>> {
    const response = await axios.post(
      `${route}/${uuid}/media/replace/${slot}`,
      {
        new_id: newUuid
      }
    );

    return response;
  },

  async mediaSort(uuid: string, sort: number): Promise<IResponse<any>> {
    const response = await axios.post(`/media/${uuid}/sort`, {
      sort
    });

    return response;
  }
};
