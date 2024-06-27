import axios from 'api/utilities/axios';
import { IResponse, IIntrospectData, IIntrospectedRoute } from 'types/types';

export default {
  async introspectRoutes(): Promise<IResponse<Array<IIntrospectedRoute>>> {
    const response: IResponse<Array<IIntrospectedRoute>> = await axios.get(
      `/introspect`
    );

    return response;
  },

  async introspect(route: string): Promise<IResponse<IIntrospectData>> {
    const response: IResponse<IIntrospectData> = await axios.get(`/${route}`, {
      params: {
        introspect: true
      }
    });

    return response;
  }
};
