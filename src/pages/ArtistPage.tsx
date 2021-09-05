import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Artist from '../types/Artist';
import Album from '../types/Album';
import ApiSpotify from '../utils/api-spotify';
import { PlayerContext } from '../context/player-context';
import { AuthContext } from '../context/auth-context';
import { makeRequest, getArtistNames } from '../utils/helpers';
import useFetchTracks from '../hooks/useFetchTracks';

import CardItem from '../components/Card/CardItem';
import PlayButton from '../components/Button/PlayButton';
import PlayerListHeader from '../components/PlayerList/PlayerListHeader';
import PlayerListTrack from '../components/PlayerList/PlayerListTrack';
import TextLink from '../components/Link/TextLink';
import FolllowButton from '../components/Button/FollowButton';
import GridWrapper from '../components/Grid/GridWrapper';

const ArtistPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [artist, setArtist] = useState<Artist>(Object);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [relatedAtists, setRelatedArtists] = useState<Artist[]>([]);
  const [isShowMore, setIsShowMore] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const { currentTrack, togglePlay } = useContext(PlayerContext);
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
            limit: 5,
          },
        }, isLoggedIn);
        setAlbums(dataAlbums.data.items);
  
        const dataRelatedArtists = await makeRequest('/artists/' + params.id + '/related-artists', {
          params: {
            limit: 5,
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
      response = await ApiSpotify.put('/me/following', null, {
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
    togglePlay([artist.uri], 0);
  };

  const handlePlayTrack = (
    selectedOffset: number,
    selectedPositionMs: number
  ) => {
    togglePlay([artist.uri], selectedOffset, selectedPositionMs);
  };

  const CardLoading = (
    [...Array(5)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="px-4 py-4">
      {artist.id ? (
        <div className="px-4 py-4">
          <PlayerListHeader
            image={artist.images && artist.images[0]?.url}
            name={artist.name}
            type={artist.type}
          />
          <div className="flex items-center justify-center sm:justify-start">
            <PlayButton className="w-16 h-16 mr-6" onClick={handlePlay} />
            <FolllowButton
              isFollowed={isFollowed}
              onClick={handleFollow}
            />
          </div>
          <PlayerListTrack
            tracks={!isShowMore ? tracks.slice(0, 5) : tracks}
            showAlbum
            currentTrack={currentTrack}
            handlePlayTrack={handlePlayTrack}
            handleNext={() => setNextUrl(pageData.next)}
            hasMore={!!pageData.next}
          />
          <span
            className="cursor-pointer hover:underline"
            onClick={() => setIsShowMore((prevState) => !prevState)}
          >
            {!isShowMore ? 'See More' : 'See Less'}
          </span>
          <div className="mb-4">
            <div className="mb-4 flex justify-between items-end font-bold w-full">
              <div className="text-2xl">Albums</div>
              <TextLink
                text="See All"
                url={'/artist/' + params.id + '/albums'}
              />
            </div>
            <GridWrapper>
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
            </GridWrapper>
          </div>

          <div className="mb-4">
            <div className="mb-4 flex justify-between items-end font-bold w-full">
              <div className="text-2xl">Fans Also Like</div>
              <TextLink
                text="See All"
                url={'/artist/' + params.id + '/related'}
              />
            </div>
            <GridWrapper>
              {isLoading && CardLoading}
              {!isLoading && relatedAtists.slice(0, 5).map((artist) => (
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
            </GridWrapper>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default ArtistPage;
