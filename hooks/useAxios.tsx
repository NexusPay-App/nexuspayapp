import axios, { AxiosInstance } from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const useAxios = () => {
  const $http: AxiosInstance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return $http;
};

export default useAxios;
