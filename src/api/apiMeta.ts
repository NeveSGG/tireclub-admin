import axios from 'api/utilities/axios';
import { IResponse, IApiMeta } from 'types/types';

export default {
  async getApiMeta(): Promise<IResponse<IApiMeta>> {
    const response: IResponse<IApiMeta> = await axios.get(`/api_meta`);

    return response;
  }
};
