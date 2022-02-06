import { useState, useEffect, useContext } from 'react';
import ApiBackend from '../utils/api-backend';
import { PlayerContext } from '../context/player-context';

type Lyric = {
  seconds: number;
  lyrics: string;
}[];

const LyricPage: React.FC = () => {
  const { currentTrack, positionMs, isPlaying } = useContext(PlayerContext);
  const [lyric, setLyric] = useState<Lyric>([]);
  const [plainLyric, setPlainLyric] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lyricSecond, setLyricSecond] = useState(0);
  const [showedLyric, setShowedLyric] = useState<Lyric>([]);
  const [isShowRunningLyric, setIsShowRunningLyric] = useState(true);

  const artist = currentTrack.artists ? currentTrack.artists[0].name : '';

  useEffect(() => {
    const fetchLyric = async () => {
      try {
        setIsLoading(true);
        setLyric([]);
        setShowedLyric([]);
        setPlainLyric('');
        if (currentTrack.id && currentTrack.type === 'track') {
          const response = await ApiBackend.get('/lyrics', {
            params: {
              artist,
              title: currentTrack.name.replace(/\([\s\S]*?\)/g, '').trim(),
            },
          });
          setLyric(response.data.lyric);
          setPlainLyric(response.data.plainLyric);
          setIsShowRunningLyric(response.data.lyric.length > 0);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyric();
  }, [currentTrack.id, artist, currentTrack.name, currentTrack.type]);

  useEffect(() => {
    setLyricSecond(Math.floor(positionMs / 1000));
  }, [positionMs]);

  useEffect(() => {
    if (isPlaying && isShowRunningLyric) {
      const interval = setInterval(() => {
        const newSecond = lyricSecond + .5;
        setLyricSecond(newSecond);

        let showedLineIndex = -1;
        for (let i = lyric.length - 1; i >= 0; i--) {
          if (lyric[i].seconds - .5 <= newSecond) {
            showedLineIndex = i;
            break;
          }
        }

        let newShowedLyric: Lyric;
        if (showedLineIndex !== -1) {
          const nextLine = lyric[showedLineIndex + 1];
          newShowedLyric = [
            lyric[showedLineIndex],
            nextLine || { seconds: 0, lyrics: '...' },
          ];
        } else {
          newShowedLyric = [
            { seconds: 0, lyrics: '...' },
            lyric[0] || { seconds: 0, lyrics: '...' },
          ];
        }
        setShowedLyric(newShowedLyric);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [lyricSecond, isPlaying, lyric, isShowRunningLyric]);

  const RunningLyricComponent = (
    <>
      {showedLyric.length > 0 && (
        <div className="text-4xl lg:text-5xl h-full flex flex-col justify-center">
          <div className="text-green-500">
            {showedLyric[0].lyrics}
          </div>
          <div className="mt-10">
            {showedLyric[1].lyrics}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className={`relative px-4 py-4 ${isShowRunningLyric ? 'h-full' : ''}`}>
      {lyric.length > 0 && plainLyric && (
        <div
          className="absolute top-2 left-2 cursor-pointer mb-4 bg-light-black-2 py-2 px-6 rounded-md text-gray-300"
          onClick={() => setIsShowRunningLyric((prevState) => !prevState)}
        >
          {isShowRunningLyric ? 'Show all lyric' : 'Show running lyric'}
        </div>
      )}
      <div className="whitespace-pre-wrap font-bold pt-10 h-full text-center">
        {isLoading && 'Loading...'}
        {!isLoading && (
          <>
            {!currentTrack.id && 'No track loaded.'}
            {currentTrack.id && (
              <>
                {isShowRunningLyric && lyric.length > 0 && RunningLyricComponent}
                {!isShowRunningLyric && 
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    {plainLyric ? plainLyric : lyric.map((lyr) => lyr.lyrics).join('\n')}
                  </div>
                }
                {!lyric.length && !plainLyric && 'Sorry, we could not find any lyrics for this song.'}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LyricPage;
