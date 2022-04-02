import { toast } from 'react-toastify';
import { useAddToHomescreenPrompt } from '../hooks/useAddToHomeScreenPrompt';
import { SPOTIFY_LOGO, SPOTIFY_LOGO_WHITE } from '../utils/constants';

const GetAppPage: React.FC = () => {
  const [prompt, promptToInstall] = useAddToHomescreenPrompt();

  const handleInstallPWA = () => {
    if (!prompt) {
      toast.error(`Your browser doesn't support PWA`);
      return;
    }
    promptToInstall();
  }

  return (
    <div className="flex flex-col justify-around bg-banner-gradient sm:p-4 p-2 h-full font-semibold">
      <div className="flex flex-col justify-center items-center rounded-md bg-indigo-200 bg-opacity-40 py-4 px-10">
        <img src={SPOTIFY_LOGO} alt="Spotify" className="w-10 h-10 mb-2" />
        <span className="text-center mb-2">
          Spotify Official App
        </span>
        <span className="text-sm text-center mb-2">
          Build your library • Use less data • Test Spotify Premium
        </span>
        <a
          className="bg-white rounded-xl px-8 py-2 text-gray-800 font-semibold"
          role="button"
          href="https://www.spotify.com/download"
          target="_blank"
          rel="noreferrer"
        >
          Get The Official App
        </a>
      </div>
      <div className="flex flex-col justify-center items-center rounded-md bg-indigo-200 bg-opacity-40 py-4 px-10">
        <img src={SPOTIFY_LOGO_WHITE} alt="Spotify" className="w-10 h-10 mb-2" />
        <span className="text-center mb-2">
          Spotify Clone on Home Screen
        </span>
        <span className="text-sm text-center mb-2">
          Open Spotify Clone in one tap · Listen in your browser · No download required · Save space on your phone
        </span>
        <button
          className="bg-white rounded-xl px-8 py-2 text-gray-800 font-semibold"
          onClick={handleInstallPWA}
        >
          Add Now
        </button>
      </div>
    </div>
  );
};

export default GetAppPage;
