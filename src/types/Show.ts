type Show = {
  id: string;
  name: string;
  uri: string;
  type: string;
  href: string;
  description: string;
  html_description: string;
  explicit: boolean;
  media_type: string;
  publisher: string;
  total_episodes: number;
  images?: {
    [key: string]: any;
  }[];
};

export default Show;
