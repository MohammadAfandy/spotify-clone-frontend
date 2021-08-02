import { useState, useEffect } from 'react';
import ApiSpotify from '../utils/api-spotify';
import Track from '../types/Track';
import Page from '../types/Page';
import { ITEM_LIST_LIMIT } from '../utils/constants';

const useFetchTracks = (url: string) => {
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [increment, setIncrement] = useState(0);
  const [pageData, setPageData] = useState<Page>({} as Page);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const forceUpdate = () => {
    setIncrement((prevState) => prevState + 1);
  };

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

        let trackList: Track[] = [];

        // sometime, track array object is under 'tracks' object
        if ('tracks' in response.data) {
          if (Array.isArray(response.data.tracks)) {
            // (e.g. artists top track)
            trackList = response.data.tracks;
            setPageData({} as Page);
          } else if ('items' in response.data.tracks) {
            // (e.g. search tracks)
            const { items, ...pageData } = response.data.tracks;
            trackList = items;
            setPageData(pageData);
          }
        } else {
          if (response.data.items.length) {
            // sometime the track object is nested inside items (e.g. playlist)
            if ('track' in response.data.items[0]) {
              trackList = response.data.items.map(
                (item: { added_at: Date; track: Track }) => ({
                  ...item.track,
                  added_at: item.added_at,
                })
              );
            } else {
              trackList = response.data.items;
            }
          }
          const { items, ...pageData } = response.data;
          setPageData(pageData);
        }

        // for playlist, track and episode can be mixed
        let trackListContain = trackList.filter(
          (track) => track.type === 'track'
        );
        let episodeListContain = trackList.filter(
          (episode) => episode.type === 'episode'
        );

        // get is the track currently under saved tracks
        if (trackListContain.length) {
          const response = await ApiSpotify.get('/me/tracks/contains', {
            params: {
              ids: trackListContain.map((track) => track.id).join(','),
            },
          });
          const savedTracks = response.data;
          trackListContain = trackListContain.map((track, idx) => ({
            ...track,
            is_saved: savedTracks[idx],
          }));
        }

        if (episodeListContain.length) {
          const response = await ApiSpotify.get('/me/episodes/contains', {
            params: {
              ids: episodeListContain.map((episode) => episode.id).join(','),
            },
          });
          const savedEpisodes = response.data;
          episodeListContain = episodeListContain.map((episode, idx) => ({
            ...episode,
            is_saved: savedEpisodes[idx],
          }));
        }

        trackList = [...trackListContain, ...episodeListContain].sort(
          (a, b) => {
            if (!a.added_at) return 0;
            if (a.added_at > b.added_at) return -1;
            if (a.added_at < b.added_at) return 1;
            return 0;
          }
        );

        if (nextUrl) {
          setTracks((prevState) => [...prevState, ...trackList]);
        } else {
          setTracks(trackList);
        }
      } catch (error) {
        setError(error);
      }
    };

    fetchData();
  }, [nextUrl, increment, url]);

  return { setNextUrl, tracks, pageData, error, forceUpdate };
};

export default useFetchTracks;
