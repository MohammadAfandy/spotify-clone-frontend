import { BACKEND_URI } from '../utils/constants';

import Button from "../Components/Button/Button";

import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex justify-center items-center text-4xl py-10 border-b-2 border-opacity-40 border-gray-500">
        Spotify Clone
      </div>
      <div className="flex justify-center items-center py-10">
        <div className="flex flex-col w-96">
          <Button
            className="w-full h-14 text-xl mb-8"
            onClick={() => window.location.href = BACKEND_URI + '/login'}
            text="Log In"
            color="green"
          />
          <div className={`w-full text-center text-sm mb-8 ${styles.lineThrough}`}>
            OR
          </div>
          <Button
            className="w-full h-14 text-xl"
            onClick={() => window.open('https://spotify.com/signup', '_blank')}
            text="Sign Up"
          />
        </div>
      </div>
      <div className="flex justify-center items-center py-10 border-t-2 border-opacity-40 border-gray-500">
        <div className="w-8/12 text-justify">
          This web player is intended for educational purpose only. All data including image, song, logo, etc belong to their respective copyright owners. Currently you need premium account to for better experience in using this app. To visit the official app, please go to <a className="underline" href="https://open.spotify.com" target="_blank" rel="noreferrer">open.spotify.com</a>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;
