import axios from 'axios';
import { User, SignUpResponse, SignUpData, SingInData, SignInResponse } from '../types';

const serverUrl = 'http://localhost:3200/'

class GenericService {
  async signUp(data: SignUpData): Promise<SignUpResponse> {
    const res = await axios.post(serverUrl + 'signUp', data, { withCredentials: true });
    return res.data;
  }

  async signIn(data: SingInData): Promise<SignInResponse> {
    const res = await axios.post(serverUrl + 'signIn', data, { withCredentials: true });
    return res.data;
  }

  async signOut(): Promise<void> {
    await axios.post(serverUrl + 'signOut', {}, { withCredentials: true });
  }

  async getUser(): Promise<User | undefined> {
    const user = await axios.get(serverUrl + 'user', { withCredentials: true });
    return user.data;
  }
}

export const genericService = new GenericService();