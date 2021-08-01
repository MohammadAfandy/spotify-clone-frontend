import Artist from './Artist';
import Track from './Track';

type Album = {
  id: string,
  name: string,
  uri: string,
  type: string,
  album_type: string,
  href: string,
  total_tracks: number,
  release_date: string,
  images?: {
    [key: string]: any,
  }[],
  artists: Artist[],
  tracks: Track[],
};

export default Album;
