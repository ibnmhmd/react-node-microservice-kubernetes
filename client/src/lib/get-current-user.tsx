// lib/get-current-user.ts
import { headers } from 'next/headers';
import axios from 'axios';

export const getCurrentUser = async () => {
  const INGRESS_ENDPOINT = 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local';
  const header = await headers();
  const cookie = header.get('cookie');

  const response = await axios.get(`${INGRESS_ENDPOINT}/api/users/currentuser`, {
    headers: {
      Host: header.get('host'),
      Cookie: cookie ?? '',
    }
  });

  return response.data;
}
