import Track from './Track';

type Playlist = {
  id: string;
  name: string;
  href: string;
  description: string;
  followers: {
    href: string | null;
    total: number;
  };
  tracks: {
    href: string;
    total: number;
    items: Track[];
  };
  type: string;
  uri: string;
  images?: {
    [key: string]: any;
  }[];
  owner: {
    [key: string]: any;
  };
};

export default Playlist;
