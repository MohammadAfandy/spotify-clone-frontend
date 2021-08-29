import { Route, Switch } from 'react-router-dom';

import PrivateRoute from '../PrivateRoute/PrivateRoute';
import HomePage from '../../Pages/HomePage';
import GenrePage from '../../Pages/GenrePage';
import SearchPage from '../../Pages/SearchPage';
import SearchResultPage from '../../Pages/SearchResultPage';
import SearchResultAllPage from '../../Pages/SearchResultAllPage';
import SearchResultAllTrackPage from '../../Pages/SearchResultAllTrackPage';
import CategoryDetailPage from '../../Pages/CategoryDetailPage';
import AlbumPage from '../../Pages/AlbumPage';
import ArtistPage from '../../Pages/ArtistPage';
import ArtistAllPage from '../../Pages/ArtistAllPage';
import PlaylistPage from '../../Pages/PlaylistPage';
import ShowPage from '../../Pages/ShowPage';
import EpisodePage from '../../Pages/EpisodePage';
import CollectionPodcastPage from '../../Pages/CollectionPodcastPage';
import CollectionPlaylistPage from '../../Pages/CollectionPlaylistPage';
import CollectionArtistPage from '../../Pages/CollectionArtistPage';
import CollectionAlbumPage from '../../Pages/CollectionAlbumPage';
import CollectionTrackPage from '../../Pages/CollectionTrackPage';
import CollectionEpisodePage from '../../Pages/CollectionEpisodePage';
import NotFoundPage from '../../Pages/NotFoundPage';

const MainContent: React.FC = () => {
  return (
    <div
      id="main-container"
      className="main-content overflow-auto flex flex-col w-full ml-52 mt-14"
    >
      <Switch>
        <Route
          path="/"
          exact
          render={(props) => <HomePage />}
        />
        <Route
          path="/genre/:type"
          exact
          render={(props) => (
            <GenrePage
              key={'genre-' + props.match.params.type}
              {...props}
            />
          )}
        />
        <Route
          path="/search"
          exact
          render={(props) => <SearchPage />}
        />
        <Route
          path="/search/:query"
          exact
          render={(props) => (
            <SearchResultPage
              key={'search-' + props.match.params.query}
              {...props}
            />
          )}
        />
        <Route
          path="/artist/:id"
          exact
          render={(props) => (
            <ArtistPage
              key={'artist-' + props.match.params.id}
              {...props}
            />
          )}
        />
        <Route
          path="/playlist/:id"
          exact
          render={(props) => (
            <PlaylistPage
              key={'playlist-' + props.match.params.id}
              {...props}
            />
          )}
        />
        <Route
          path="/search/:query/track"
          exact
          render={(props) => (
            <SearchResultAllTrackPage
              key={'search-track-' + props.match.params.query}
              {...props}
            />
          )}
        />
        <Route
          path="/search/:query/:type"
          exact
          render={(props) => (
            <SearchResultAllPage
              key={'search-' + props.match.params.query + '-' + props.match.params.type}
              {...props}
            />
          )}
        />
        <Route
          path="/category/:id"
          exact
          render={(props) => (
            <CategoryDetailPage
              key={'category-' + props.match.params.id}
              {...props}
            />
          )}
        />
        <Route
          path="/album/:id"
          exact
          render={(props) => (
            <AlbumPage
              key={'album-' + props.match.params.id}
              {...props}
            />
          )}
        />
        <Route
          path="/artist/:id/:type"
          exact
          render={(props) => (
            <ArtistAllPage
              key={'artist-' + props.match.params.id + '-' + props.match.params.type}
              {...props}
            />
          )}
        />
        <Route
          path="/show/:id"
          exact
          render={(props) => (
            <ShowPage
              key={'show-' + props.match.params.id}
              {...props}
            />
          )}
        />
        <Route
          path="/episode/:id"
          exact
          render={(props) => (
            <EpisodePage
              key={'episode-' + props.match.params.id}
              {...props}
            />
          )}
        />

        {/* Private Route (Need Login) */}
        <PrivateRoute
          component={CollectionPlaylistPage}
          path="/collection/playlists"
          exact
        />
        <PrivateRoute
          component={CollectionPodcastPage}
          path="/collection/podcasts"
          exact
        />
        <PrivateRoute
          component={CollectionAlbumPage}
          path="/collection/albums"
          exact
        />
        <PrivateRoute
          component={CollectionArtistPage}
          path="/collection/artists"
          exact
        />
        <PrivateRoute
          component={CollectionTrackPage}
          path="/collection/tracks"
          exact
        />
        <PrivateRoute
          component={CollectionEpisodePage}
          path="/collection/episodes"
          exact
        />
        <Route path='*'>
          <NotFoundPage />
        </Route>
      </Switch>
    </div>
  );
};

export default MainContent;
