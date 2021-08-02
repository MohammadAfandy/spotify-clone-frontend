type Artist = {
  id: string;
  name: string;
  uri: string;
  type: string;
  href: string;
  followers?: {
    [key: string]: any;
  };
  genres?: [];
  popularity?: number;
  images?: {
    [key: string]: any;
  }[];
};

export default Artist;
