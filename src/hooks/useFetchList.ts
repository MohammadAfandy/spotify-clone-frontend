import { useState, useEffect, useContext, useCallback } from 'react';
import Page from '../types/Page';
import { AuthContext } from '../context/auth-context';
import { makeRequest, removeNull } from '../utils/helpers';
import { ITEM_LIST_LIMIT } from '../utils/constants';

type UseFetchListParams = {
  url: string;
  propertyName?: string;
  limit?: number;
};

const useFetchList = <T>({
  url,
  propertyName,
  limit: defaultLimit,
}: UseFetchListParams) => {

  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [pageData, setPageData] = useState<Page>({} as Page);
  const [items, setItems] = useState<T[]>([]);
  const [additionalData, setAdditionalData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasPagination, setHasPagination] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { isLoggedIn } = useContext(AuthContext);

  const fetchList = useCallback(async () => {
    if (!url) return;
    try {
      setIsLoading(true);
      const params = {
        limit: defaultLimit || ITEM_LIST_LIMIT,
      };
      let response;
      if (nextUrl) {
        let newUrl = nextUrl.split('/v1')[1];
        response = await makeRequest(newUrl, {}, isLoggedIn);
      } else {
        response = await makeRequest(url, { params }, isLoggedIn);
      }

      let responseData = [];
      // find where object that contains page data is really placed
      if (propertyName) {
        const {
          [propertyName]: itemData,
          ...rest
        } = response.data;
        responseData = itemData;
        setAdditionalData(rest);
      } else {
        responseData = response.data;
      }

      const {
        href,
        limit,
        next,
        offset,
        previous,
        total,
        items: responseItems,
      } = responseData;

      // for endpoint that doesn't support pagination (e.g. related-artists)
      if (next === undefined) {
        setHasPagination(false);
        setItems(responseData);
        return;
      } else {
        setHasPagination(true);
      }

      setPageData({
        href,
        limit,
        next,
        offset,
        previous,
        total,
      });

      const finalItems = responseItems.filter(removeNull);
      if (nextUrl) {
        setItems((prevState) => [...prevState, ...finalItems]);
      } else {
        setItems(finalItems);
      }

    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [nextUrl, url, propertyName, defaultLimit, isLoggedIn]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { setNextUrl, items, pageData, error, fetchList, setItems, hasPagination, additionalData, isLoading };
};

export default useFetchList;
