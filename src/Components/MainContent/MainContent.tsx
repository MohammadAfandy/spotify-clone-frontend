import { Route, Switch } from 'react-router-dom';

import HomePage from '../../Pages/HomePage';
import GenrePage from '../../Pages/GenrePage';
import SearchPage from '../../Pages/SearchPage';
import SearchResultPage from '../../Pages/SearchResultPage';
import SearchResultAllPage from '../../Pages/SearchResultAllPage';
import SearchResultAllTrackPage from '../../Pages/SearchResultAllTrackPage';
import CategoryDetailPage from '../../Pages/CategoryDetailPage';
import AlbumPagePage from '../../Pages/AlbumPage';
import ArtistPagePage from '../../Pages/ArtistPage';
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

const MainContent: React.FC = () => {
  return (
    <div id="main-container" className="main-content overflow-auto flex flex-col w-full ml-52 mt-14">
      <Switch>
        <Route path="/" exact>
          <HomePage />
        </Route>
        <Route path="/genre/:type" exact>
          <GenrePage />
        </Route>
        <Route path="/search" exact>
          <SearchPage />
        </Route>
        <Route path="/search/:query/track" exact render={(props) => (
          <SearchResultAllTrackPage key={'search-track-' + props.match.params.query} {...props} />)
        } />
        <Route path="/search/:query/:type" exact>
          <SearchResultAllPage />
        </Route>
        <Route path="/category/:id" exact>
          <CategoryDetailPage />
        </Route>
        <Route path="/album/:id" exact>
          <AlbumPagePage />
        </Route>
        <Route path="/artist/:id/:type" exact>
          <ArtistAllPage />
        </Route>
        <Route path="/show/:id" exact>
          <ShowPage />
        </Route>
        <Route path="/episode/:id" exact>
          <EpisodePage />
        </Route>
        <Route path="/collection/playlists" exact>
          <CollectionPlaylistPage />
        </Route>
        <Route path="/collection/podcasts" exact>
          <CollectionPodcastPage />
        </Route>
        <Route path="/collection/albums" exact>
          <CollectionAlbumPage />
        </Route>
        <Route path="/collection/artists" exact>
          <CollectionArtistPage />
        </Route>
        <Route path="/collection/tracks" exact>
          <CollectionTrackPage />
        </Route>
        <Route path="/collection/episodes" exact>
          <CollectionEpisodePage />
        </Route>

        {/* This is to trigger rerender on same props but different url
        because sometimes (as in this route list) the previous route is the same as the destination route
        and when it happens it doesn't reset the state of the component */}
        <Route path="/search/:query" exact render={(props) => (
          <SearchResultPage key={'search-' + props.match.params.query} {...props} />)
        } />
        <Route path="/artist/:id" exact render={(props) => (
          <ArtistPagePage key={'artist-' + props.match.params.id} {...props} />)
        } />
        <Route path="/playlist/:id" exact render={(props) => (
          <PlaylistPage key={'playlist-' + props.match.params.id} {...props} />)
        } />
      </Switch>
    </div>
  );
};

export default MainContent;
