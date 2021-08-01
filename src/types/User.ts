type User = {
  id: string,
  email: string,
  display_name: string,
  product: string,
  type: string,
  uri: string,
  href: string,
  country: string,
  explicit_content: {
    filter_enabled: boolean,
    filter_locked: boolean,
  },
  followers: {
    href: string | null,
    total: number,
  },
  images?: {
    [key: string]: any,
  }[],
};

export default User;
