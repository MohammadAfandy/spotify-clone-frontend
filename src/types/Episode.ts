import Show from './Show';

type Episode = {
  id: string;
  name: string;
  uri: string;
  type: string;
  href: string;
  audio_preview_url: string;
  description: string;
  html_description: string;
  duration_ms: number;
  explicit: boolean;
  is_playable: boolean;
  language: string;
  release_date: string;
  release_date_precision: string;
  resume_point: {
    fully_played: boolean;
    resume_position_ms: number;
  };
  is_saved: boolean;
  images?: {
    [key: string]: any;
  }[];
  show: Show;
};

export default Episode;
