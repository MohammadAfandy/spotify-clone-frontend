import { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import Artist from '../types/Artist';
import Album from '../types/Album';
import ApiSpotify from '../utils/api-spotify';
import { PlayerContext } from '../context/player-context';
import { getArtistNames } from '../utils/helpers';
import useFetchTracks from '../hooks/useFetchTracks';

import Button from '../Components/Button/Button';
import CardItem from '../Components/Card/CardItem';
import PlayButton from '../Components/Button/PlayButton';
import PlayerListHeader from '../Components/PlayerList/PlayerListHeader';
import PlayerListTrack from '../Components/PlayerList/PlayerListTrack';
import TextLink from '../Components/Link/TextLink';

const ArtistPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist>(Object);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [relatedAtists, setRelatedArtists] = useState<Artist[]>([]);
  const [isShowMore, setIsShowMore] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  const {
    currentTrack,
    togglePlay,
  } = useContext(PlayerContext);

  const {
    setNextUrl,
    tracks,
    pageData,
  } = useFetchTracks('/artists/' + params.id + '/top-tracks');

  useEffect(() => {
    const fetchArtist = async () => {
      const [
        dataArtist,
        dataAlbums,
        dataRelatedArtists,
        dataFollowed,
      ] = await Promise.all([
        ApiSpotify.get('/artists/' + params.id),
        ApiSpotify.get('/artists/' + params.id + '/albums', {
          params: {
            limit: 5,
          }
        }),
        ApiSpotify.get('/artists/' + params.id + '/related-artists', {
          params: {
            limit: 5,
          }
        }),
        ApiSpotify.get('/me/following/contains', {
          params: {
            type: 'artist',
            ids: params.id,
          }
        }),
      ]);
      setArtist(dataArtist.data);
      setAlbums(dataAlbums.data.items);
      setRelatedArtists(dataRelatedArtists.data.artists);
      setIsFollowed(dataFollowed.data[0]);
    }
    fetchArtist();
  }, [params.id]);

  const handleFollow = async () => {
    let response;
    if (isFollowed) {
      response = await ApiSpotify.delete('/me/following', { params: {
        type: 'artist',
        ids: artist.id,
      }});
    } else {
      response = await ApiSpotify.put('/me/following', null, { params: {
        type: 'artist',
        ids: artist.id,
      }});
    }
    if (response.status === 204) {
      setIsFollowed((prevState) => !prevState);
    }
  };

  const handlePlay = () => {
    togglePlay([artist.uri], 0);
  };

  const handlePlayTrack = (selectedOffset: number, selectedPositionMs: number) => {
    togglePlay([artist.uri], selectedOffset, selectedPositionMs);
  };

  return (
    <div className="px-4 py-4">
      {artist.id ? (
        <div className="px-4 py-4">
          <PlayerListHeader
            image={artist.images && artist.images[0].url}
            name={artist.name}
            type={artist.type}
          />
          <div className="flex items-center">
            <PlayButton
              className="w-16 h-16 mr-6"
              onClick={handlePlay}
            />
            <Button
              text={isFollowed ? 'Following' : 'Follow'}
              onClick={handleFollow}
              color={isFollowed ? 'green' : 'white'}
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
            <div className="mb-4 flex justify-between items-end mr-8 font-bold">
              <div className="text-2xl">Albums</div>
              <TextLink
                text="See All"
                url={'/artist/' + params.id + '/albums'}
              />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {albums.map((album) => (
                <CardItem
                  key={album.id}
                  name={album.name}
                  description={getArtistNames(album.artists)}
                  image={album.images && album.images[0] && album.images[0].url}
                  uri={album.uri}
                  href={'/album/' + album.id}
                />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-4 flex justify-between items-end mr-8 font-bold">
              <div className="text-2xl">Fans Also Like</div>
              <TextLink
                text="See All"
                url={'/artist/' + params.id + '/related'}
              />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {relatedAtists.slice(0, 5).map((artist) => (
                <CardItem
                  key={artist.id}
                  name={artist.name}
                  description={artist.name}
                  image={artist.images && artist.images[0] && artist.images[0].url}
                  uri={artist.uri}
                  href={'/artist/' + artist.id}
                />
              ))}
            </div>
          </div>
        </div>
      ) : ''}
    </div>
  );
};

export default ArtistPage;
