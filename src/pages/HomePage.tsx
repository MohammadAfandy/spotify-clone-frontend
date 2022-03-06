import { useEffect, useState, useContext } from 'react';
import Track from '../types/Track';
import Artist from '../types/Artist';
import Album from '../types/Album';
import Playlist from '../types/Playlist';
import ApiSpotify from '../utils/api-spotify';
import { AuthContext } from '../context/auth-context';
import { getHighestImage, getArtistNames, makeRequest } from '../utils/helpers';

import Skeleton from '../components/Skeleton/Skeleton';
import CardItem from '../components/Card/CardItem';
import TextLink from '../components/Text/TextLink';
import { CARD_COUNT } from '../utils/constants';
import Slider from '../components/Slider/Slider';
import RecentlyPlayed from '../types/RecentlyPlayed';

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);

  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [message, setMessage] = useState('');

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setIsLoading(true);
        const params = { limit: CARD_COUNT };
        const promises = [
          makeRequest('/browse/new-releases', { params }, isLoggedIn),
          makeRequest('/browse/featured-playlists', { params }, isLoggedIn)
        ];
        if (isLoggedIn) {
          promises.push(
            ApiSpotify.get('/me/player/recently-played', { params }),
            ApiSpotify.get('/me/top/tracks', { params }),
            ApiSpotify.get('/me/top/artists', { params })
          );
        }
        const response = await Promise.all(promises);

        setNewReleases(response[0].data.albums.items);
        setFeaturedPlaylists(response[1].data.playlists.items);
        setMessage(response[1].data.message);

        if (isLoggedIn) {
          setRecentlyPlayed(
            response[2].data.items
              .filter((v: RecentlyPlayed, i: number, a: RecentlyPlayed[]) => {
                return a.findIndex((t) => t.track.id === v.track.id) === i;
              })
          );
          setTopTracks(response[3].data.items);
          setTopArtists(response[4].data.items);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHome();
  }, [isLoggedIn]);

  const CardLoading = (
    [...Array(CARD_COUNT)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="mb-8">
        <div className="mb-4 flex justify-between items-center font-bold w-full">
          {isLoading && <Skeleton width={200} height={30} />}
          {!isLoading && <div className="text-lg md:text-2xl truncate">{message}</div>}
          <TextLink className="ml-6 whitespace-pre" text="See All" url="/genre/featured-playlists" />
        </div>
        <Slider>
          {isLoading && CardLoading}
          {!isLoading && featuredPlaylists.map((playlist) => (
            <CardItem
              key={playlist.id}
              name={playlist.name}
              description={`By ${playlist.owner.display_name}`}
              image={getHighestImage(playlist.images)}
              uri={playlist.uri}
              href={'/playlist/' + playlist.id}
            />
          ))}
        </Slider>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex justify-between items-center font-bold w-full">
          <div className="text-lg md:text-2xl truncate">New Releases</div>
          <TextLink className="ml-6 whitespace-pre" text="See All" url="genre/new-releases" />
        </div>
        <Slider>
          {isLoading && CardLoading}
          {!isLoading && newReleases.map((album) => (
            <CardItem
              key={album.id}
              name={album.name}
              description={getArtistNames(album.artists)}
              image={getHighestImage(album.images)}
              uri={album.uri}
              href={'/album/' + album.id}
            />
          ))}
        </Slider>
      </div>

      {isLoggedIn && recentlyPlayed.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center font-bold w-full">
            {isLoading && <Skeleton width={200} height={30} />}
            {!isLoading && <div className="text-lg md:text-2xl truncate">Recently Played</div>}
            <TextLink className="ml-6 whitespace-pre" text="See All" url="/genre/recently-played" />
          </div>
          <Slider>
            {isLoading && CardLoading}
            {!isLoading && recentlyPlayed.map(({ track }) => (
              <CardItem
                key={track.id}
                name={track.name}
                description={getArtistNames(track.artists)}
                image={getHighestImage(track.album.images)}
                uri={track.uri}
                href={'/album/' + track.album.id}
              />
            ))}
          </Slider>
        </div>
      )}

      {isLoggedIn && topTracks.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center font-bold w-full">
            <div className="text-lg md:text-2xl truncate">Your Top Tracks</div>
            <TextLink className="ml-6 whitespace-pre" text="See All" url="genre/top-tracks" />
          </div>
          <Slider>
            {isLoading && CardLoading}
            {!isLoading && topTracks.map((track) => (
              <CardItem
                key={track.id}
                name={track.name}
                description={getArtistNames(track.artists)}
                image={getHighestImage(track.album.images)}
                uri={track.uri}
                href={'/album/' + track.album.id}
              />
            ))}
          </Slider>
        </div>
      )}

      {isLoggedIn && topTracks.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center font-bold w-full">
            <div className="text-lg md:text-2xl truncate">Your Top Artists</div>
            <TextLink className="ml-6 whitespace-pre" text="See All" url="genre/top-artists" />
          </div>
          <Slider>
            {isLoading && CardLoading}
            {!isLoading && topArtists.map((artist) => (
              <CardItem
                key={artist.id}
                name={artist.name}
                description={artist.type}
                image={getHighestImage(artist.images)}
                uri={artist.uri}
                href={'/artist/' + artist.id}
              />
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default HomePage;
