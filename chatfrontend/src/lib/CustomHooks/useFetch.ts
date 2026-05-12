import {useState, useEffect} from "react";
import axios, {AxiosRequestConfig} from "axios";
import {BACKEND_BASE_URL} from "../constant";

interface FetchOptions {
  method?: "get" | "post" | "put" | "delete";
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
}

const useFetch = <T>({ method = "get", url, data, headers = {} }: FetchOptions) => {
  const [response, setResponse] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchData = async (newUrl?: string) => {
    setLoading(true);
    setError(null);
    try{
      const token = localStorage.getItem("access_token");
      const config: AxiosRequestConfig = {
        method,
        url: `${BACKEND_BASE_URL}${newUrl || url}`,
        headers: {
          ...headers,
          access_token: token || "",
        },
        data,
      };
      const res = await axios(config);
      setResponse(res.data as T);
    } catch (err){
      setError((err as Error).message);
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {response, error, loading, refetch: fetchData};
};

export default useFetch;
