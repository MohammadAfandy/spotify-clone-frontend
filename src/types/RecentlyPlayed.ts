import Track from './Track';

type RecentlyPlayed = {
  context: {
    external_urls: {
      spotify: string;
    },
    href: string;
    type: string;
    uri: string;
  },
  track: Track;
};

export default RecentlyPlayed;
