import { useState, useEffect, useContext } from 'react';
import ApiBackend from '../utils/api-backend';
import { PlayerContext } from '../context/player-context';
import { getArtistNames } from '../utils/helpers';

const LyricPage: React.FC = () => {
  const { currentTrack } = useContext(PlayerContext);
  const [lyric, setLyric] = useState('');

  const artistNames = currentTrack.artists ? getArtistNames(currentTrack.artists) : '';

  useEffect(() => {
    const fetchLyric = async () => {
      setLyric('Loading ...');
      const response = await ApiBackend.get('/lyrics', {
        params: {
          artist: artistNames,
          title: currentTrack.name,
        },
      });
      setLyric(response.data.lyric);
    };
    if (currentTrack.id && currentTrack.type === 'track') {
      fetchLyric();
    } else {
      setLyric('')
    }
  }, [currentTrack.id, artistNames, currentTrack.name, currentTrack.type]);

  return (
    <div className="px-4 py-4">
      <div className="whitespace-pre-wrap ml-6 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
        {currentTrack.id ? (
          (currentTrack.type === 'track' && lyric) ? lyric : 'Sorry, we could not find the lyric.'
        ) : 'No track loaded.'}
      </div>
    </div>
  );
};

export default LyricPage;
