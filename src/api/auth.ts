import axios from 'api/utilities/axios';
import { IRegistrationData, IResponse } from 'types/types';

export default {
  async csrf(): Promise<IResponse<unknown>> {
    const response = await axios.get(`/sanctum/csrf-cookie`);

    return response;
  },

  async register(data: IRegistrationData): Promise<IResponse<unknown>> {
    const response = await axios.post(`/auth/signup`, {
      ...data
    });

    return response;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<IResponse<unknown>> {
    const response = await axios.post(`/login`, {
      ...data
    });

    return response;
  }
};
