import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Artist from '../types/Artist';
import Album from '../types/Album';
import ApiSpotify from '../utils/api-spotify';
import { useSelector, useDispatch } from 'react-redux';
import { togglePlay } from '../store/player-slice';
import { RootState } from '../store';
import { AuthContext } from '../context/auth-context';
import { makeRequest, getArtistNames, ucwords } from '../utils/helpers';
import useFetchTracks from '../hooks/useFetchTracks';

import CardItem from '../components/Card/CardItem';
import PlayButton from '../components/Button/PlayButton';
import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListTrack from '../components/PlayerList/PlayerListTrack';
import TextLink from '../components/Text/TextLink';
import FolllowButton from '../components/Button/FollowButton';
import Slider from '../components/Slider/Slider';
import { CARD_COUNT } from '../utils/constants';

const ArtistPage: React.FC = () => {
  const dispatch = useDispatch();
  const params = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [artist, setArtist] = useState<Artist>(Object);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [relatedAtists, setRelatedArtists] = useState<Artist[]>([]);
  const [isShowMore, setIsShowMore] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);
  const { isLoggedIn } = useContext(AuthContext);

  const { setNextUrl, tracks, pageData } = useFetchTracks(
    '/artists/' + params.id + '/top-tracks'
  );

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setIsLoading(true);
        const dataArtist = await makeRequest('/artists/' + params.id, {}, isLoggedIn);
        setArtist(dataArtist.data);

        const dataAlbums = await makeRequest('/artists/' + params.id + '/albums', {
          params: {
            limit: CARD_COUNT,
          },
        }, isLoggedIn);
        setAlbums(dataAlbums.data.items);

        const dataRelatedArtists = await makeRequest('/artists/' + params.id + '/related-artists', {
          params: {
            limit: CARD_COUNT,
          },
        }, isLoggedIn);
        setRelatedArtists(dataRelatedArtists.data.artists);

        if (isLoggedIn) {
          const dataFollowed = await ApiSpotify.get('/me/following/contains', {
            params: {
              type: 'artist',
              ids: params.id,
            },
          });
          setIsFollowed(dataFollowed.data[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtist();
  }, [params.id, isLoggedIn]);

  const handleFollow = async () => {
    let response;
    if (isFollowed) {
      response = await ApiSpotify.delete('/me/following', {
        params: {
          type: 'artist',
          ids: artist.id,
        },
      });
    } else {
      response = await ApiSpotify.put('/me/following', {}, {
        params: {
          type: 'artist',
          ids: artist.id,
        },
      });
    }
    if (response.status === 204) {
      setIsFollowed((prevState) => !prevState);
    }
  };

  const handlePlay = () => {
    dispatch(togglePlay({
      uris: [artist.uri],
    }));
  };

  const CardLoading = (
    [...Array(CARD_COUNT)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <PlayerListHeader
          image={artist.images && artist.images[0]?.url}
          name={artist.name}
          type={ucwords(artist.type)}
          footer={[
            `${artist.followers?.total.toLocaleString()} Followers`,
          ]}
          isLoading={isLoading}
        />
        <div className="flex items-center justify-center sm:justify-start">
          <PlayButton className="w-16 h-16 mr-6" onClick={handlePlay} />
          <FolllowButton
            isFollowed={isFollowed}
            onClick={handleFollow}
          />
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-4 flex justify-between items-end font-bold w-full">
          <div className="text-lg md:text-2xl truncate">Popular</div>
        </div>
        <PlayerListTrack
          tracks={!isShowMore ? tracks.slice(0, 5) : tracks}
          showAlbum
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          uris={[artist.uri]}
          handleNext={() => setNextUrl(pageData.next)}
          hasMore={!!pageData.next}
        />
        <span
          className="cursor-pointer hover:underline"
          onClick={() => setIsShowMore((prevState) => !prevState)}
        >
          {!isShowMore ? 'See More' : 'See Less'}
        </span>
      </div>
      <div className="mb-4">
        <div className="mb-4 flex justify-between items-end font-bold w-full">
          <div className="text-lg md:text-2xl truncate">Albums</div>
          <TextLink
            className="ml-6 whitespace-pre"
            text="See All"
            url={'/artist/' + params.id + '/albums'}
          />
        </div>
        <Slider>
          {isLoading && CardLoading}
          {!isLoading && albums.map((album) => (
            <CardItem
              key={album.id}
              name={album.name}
              description={getArtistNames(album.artists)}
              image={album.images && album.images[0] && album.images[0].url}
              uri={album.uri}
              href={'/album/' + album.id}
            />
          ))}
        </Slider>
      </div>

      <div className="mb-4">
        <div className="mb-4 flex justify-between items-end font-bold w-full">
          <div className="text-lg md:text-2xl truncate">Fans Also Like</div>
          <TextLink
            className="ml-6 whitespace-pre"
            text="See All"
            url={'/artist/' + params.id + '/related'}
          />
        </div>
        <Slider>
          {isLoading && CardLoading}
          {!isLoading && relatedAtists.map((artist) => (
            <CardItem
              key={artist.id}
              name={artist.name}
              description={artist.name}
              image={
                artist.images && artist.images[0] && artist.images[0].url
              }
              uri={artist.uri}
              href={'/artist/' + artist.id}
            />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ArtistPage;
