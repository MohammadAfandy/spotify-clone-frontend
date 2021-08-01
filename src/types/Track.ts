import Artist from './Artist';
import Album from './Album';

type Track = {
  id: string,
  name: string,
  type: string,
  uri: string,
  href: string,
  track_number: number,
  duration_ms: number,
  added_at: Date,
  disc_number: number,
  explicit: boolean,
  is_local: boolean,
  popularity: number,
  preview_url: string,
  is_saved: boolean,
  artists: Artist[],
  album: Album
};

export default Track;
