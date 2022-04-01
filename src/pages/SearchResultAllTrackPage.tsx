import { useParams } from 'react-router-dom';
import useFetchTracks from '../hooks/useFetchTracks';

import PlayerListTrack from '../components/PlayerList/PlayerListTrack';

const SearchResultAllTrackPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();

  const { setNextUrl, tracks, pageData } = useFetchTracks(
    `/search?q=${query}&type=track`
  );

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="text-2xl font-bold mb-4 truncate">
        All songs for “{query}”
      </div>
      <PlayerListTrack
        tracks={tracks}
        showAlbum
        uris={tracks.map((track) => track.uri)}
        handleNext={() => setNextUrl(pageData.next)}
        hasMore={!!pageData.next}
      />
    </div>
  );
};

export default SearchResultAllTrackPage;
