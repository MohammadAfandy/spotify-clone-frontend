import { Route, Switch } from 'react-router-dom';
import { SkeletonTheme } from 'react-loading-skeleton';

import PrivateRoute from '../PrivateRoute/PrivateRoute';
import HomePage from '../../pages/HomePage';
import GenrePage from '../../pages/GenrePage';
import SearchPage from '../../pages/SearchPage';
import SearchResultPage from '../../pages/SearchResultPage';
import SearchResultAllPage from '../../pages/SearchResultAllPage';
import SearchResultAllTrackPage from '../../pages/SearchResultAllTrackPage';
import CategoryDetailPage from '../../pages/CategoryDetailPage';
import AlbumPage from '../../pages/AlbumPage';
import ArtistPage from '../../pages/ArtistPage';
import ArtistAllPage from '../../pages/ArtistAllPage';
import PlaylistPage from '../../pages/PlaylistPage';
import ShowPage from '../../pages/ShowPage';
import EpisodePage from '../../pages/EpisodePage';
import CollectionPodcastPage from '../../pages/CollectionPodcastPage';
import CollectionPlaylistPage from '../../pages/CollectionPlaylistPage';
import CollectionArtistPage from '../../pages/CollectionArtistPage';
import CollectionAlbumPage from '../../pages/CollectionAlbumPage';
import CollectionTrackPage from '../../pages/CollectionTrackPage';
import CollectionEpisodePage from '../../pages/CollectionEpisodePage';
import NotFoundPage from '../../pages/NotFoundPage';
import ScrollToTop from '../Scroll/ScrollToTop';

const MainContent: React.FC = () => {
  return (
    <div
      id="main-container"
      className="relative main-content overflow-auto flex flex-col w-full sm:ml-52 mt-16"
    >
      <SkeletonTheme color="#202020" highlightColor="#444">
        <ScrollToTop />
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
      </SkeletonTheme>
    </div>
  );
};

export default MainContent;
