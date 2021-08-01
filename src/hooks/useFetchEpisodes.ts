import { useState, useEffect } from 'react';
import ApiSpotify from '../utils/api-spotify';
import Episode from '../types/Episode';
import Page from '../types/Page';
import { ITEM_LIST_LIMIT } from '../utils/constants';

const useFetchEpisodes = (url: string) => {
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [increment, setIncrement] = useState(0);
  const [pageData, setPageData] = useState<Page>({} as Page);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const forceUpdate = () => {
    setIncrement((prevState) => prevState + 1);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          limit: ITEM_LIST_LIMIT,
        };
        let newUrl = url;
        if (nextUrl) {
          newUrl = nextUrl;
        }
        const response = await ApiSpotify.get(newUrl, { params });

        let episodeList: Episode[] = [];

        // sometime, episode array object is under 'episodes' object (e.g. artists top episode)
        if ('episodes' in response.data) {
          episodeList = response.data.episodes;
          setPageData({} as Page);
        } else {
          if (response.data.items.length) {

            // sometime the episode object is nested inside items (e.g. playlist)
            if ('episode' in response.data.items[0]) {
              episodeList = response.data.items.map((item: { added_at: Date, episode: Episode }) => ({
                ...item.episode,
                added_at: item.added_at,
              }));
            } else {
              episodeList = response.data.items;
            }
          }
          const { items, ...pageData } = response.data;
          setPageData(pageData);
        }

        // get is the episode currently under saved episodes
        if (episodeList && episodeList.length) {
          const response = await ApiSpotify.get('/me/episodes/contains', { params: {
            ids: episodeList.map((episode) => episode.id).join(','),
          }});
          const savedepisodes = response.data;
  
          episodeList = episodeList.map((episode, idx) => ({
            ...episode,
            is_saved: savedepisodes[idx],
          }));
        }

        if (nextUrl) {
          setEpisodes((prevState) => [...prevState, ...episodeList]);
        } else {
          setEpisodes(episodeList);
        }
      } catch (error) {
        setError(error);
      }
    };

    fetchData();
  }, [nextUrl, increment, url]);

  return { setNextUrl, episodes, pageData, error, forceUpdate };
}

export default useFetchEpisodes;
