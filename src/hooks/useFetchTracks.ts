import { useState, useEffect, useContext, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ApiSpotify from '../utils/api-spotify';
import Track from '../types/Track';
import Episode from '../types/Episode';
import Page from '../types/Page';
import { AuthContext } from '../context/auth-context';
import { ITEM_LIST_LIMIT } from '../utils/constants';
import { makeRequest } from '../utils/helpers';
import { addSavedTrackIds, setSavedTrackIds } from '../store/playlist-slice';

const useFetchTracks = (url: string) => {
  const dispatch = useDispatch();

  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [pageData, setPageData] = useState<Page>({} as Page);
  const [tracks, setTracks] = useState<Track[] & Episode[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { isLoggedIn } = useContext(AuthContext);

  const fetchTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        limit: ITEM_LIST_LIMIT,
      };
      let response;
      if (nextUrl) {
        let newUrl = nextUrl.split('/v1')[1];
        response = await makeRequest(newUrl, { params }, isLoggedIn);
      } else {
        response = await makeRequest(url, { params }, isLoggedIn);
      }

      let trackList: Track[] & Episode[] = [];

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
          } else if ('episode' in response.data.items[0]) {
            trackList = response.data.items.map(
              (item: { added_at: Date; episode: Episode }) => ({
                ...item.episode,
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
        if (isLoggedIn) {
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
      }

      if (episodeListContain.length) {
        if (isLoggedIn) {
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
      }

      let finalResult: Track[] & Episode[] = [];
      for (const trackLs of trackList) {
        let current = trackListContain.find((v) => v.id === trackLs.id);
        if (!current) {
          current = episodeListContain.find((v) => v.id === trackLs.id);
        }
        if (current) {
          finalResult.push(current);
        }
      }

      const allSavedTracksIds = [
        ...trackListContain.filter((track) => track.is_saved).map((track) => track.id),
        ...episodeListContain.filter((episode) => episode.is_saved).map((episode) => episode.id),
      ];
      if (nextUrl) {
        setTracks((prevState) => [...prevState, ...finalResult]);
        dispatch(addSavedTrackIds(allSavedTracksIds));
      } else {
        dispatch(setSavedTrackIds(allSavedTracksIds));
        setTracks(finalResult);
      }

    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, nextUrl, url, isLoggedIn]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return { setNextUrl, tracks, pageData, error, fetchTracks, setTracks, isLoading };
};

export default useFetchTracks;
