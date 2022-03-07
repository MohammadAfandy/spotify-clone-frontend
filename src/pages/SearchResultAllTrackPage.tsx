import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import useFetchTracks from '../hooks/useFetchTracks';

import PlayerListTrack from '../components/PlayerList/PlayerListTrack';

const SearchResultAllTrackPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();

  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);

  const { setNextUrl, tracks, pageData } = useFetchTracks(
    `/search?q=${query}&type=track`
  );

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="text-2xl font-bold mb-4 truncate">
        All songs for “{query}”
      </div>
      <PlayerListTrack
        tracks={tracks}
        showAlbum
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        uris={tracks.map((track) => track.uri)}
        handleNext={() => setNextUrl(pageData.next)}
        hasMore={!!pageData.next}
      />
    </div>
  );
};

export default SearchResultAllTrackPage;
