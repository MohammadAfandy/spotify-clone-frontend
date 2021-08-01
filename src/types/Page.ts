type Page = {
  href: string,
  limit: number,
  next: string | null,
  offset: number,
  previous: string | null,
  total: number,
};

export default Page;
