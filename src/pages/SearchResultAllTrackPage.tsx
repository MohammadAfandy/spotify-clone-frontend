import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { PlayerContext } from '../context/player-context';
import useFetchTracks from '../hooks/useFetchTracks';

import PlayerListTrack from '../components/PlayerList/PlayerListTrack';

const SearchResultAllTrackPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();

  const { currentTrack, isPlaying, togglePlay, togglePause } = useContext(PlayerContext);

  const { setNextUrl, tracks, pageData } = useFetchTracks(
    `/search?q=${query}&type=track`
  );

  const handlePlayTrack = (
    selectedOffset: number,
    selectedPositionMs: number
  ) => {
    const trackUris = tracks.map((track) => track.uri);
    togglePlay(trackUris, selectedOffset, selectedPositionMs);
  };

  const handlePauseTrack = () => {
    togglePause();
  };

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
        handlePlayTrack={handlePlayTrack}
        handlePauseTrack={handlePauseTrack}
        handleNext={() => setNextUrl(pageData.next)}
        hasMore={!!pageData.next}
      />
    </div>
  );
};

export default SearchResultAllTrackPage;
