import { useContext } from 'react';
import { useParams } from "react-router-dom";
import { PlayerContext } from '../context/player-context';
import useFetchTracks from '../hooks/useFetchTracks';

import PlayerListTrack from '../Components/PlayerList/PlayerListTrack';

const SearchResultAllTrackPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();

  const {
    currentTrack,
    togglePlay,
  } = useContext(PlayerContext);

  const {
    setNextUrl,
    tracks,
    pageData
  } = useFetchTracks(`/search?q=${query}&type=track`);
  console.log({
    tracks,
    pageData
  })

  const handlePlayTrack = (selectedOffset: number, selectedPositionMs: number) => {
    const trackUris = tracks.map((track) => track.uri);
    togglePlay(trackUris, selectedOffset, selectedPositionMs);
  };

  return (
    <div className="flex flex-col px-4 py-4">
      <div className="text-2xl mb-4">
        All songs for “{query}”
      </div>
      <PlayerListTrack
        tracks={tracks}
        showAlbum
        currentTrack={currentTrack}
        handlePlayTrack={handlePlayTrack}
        handleNext={() => setNextUrl(pageData.next)}
        hasMore={!!pageData.next}
      />
    </div>
  );
};

export default SearchResultAllTrackPage;
