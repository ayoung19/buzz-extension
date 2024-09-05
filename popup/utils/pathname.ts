export const getPathnameSegments = (pathname: string) =>
  pathname
    .split("/")
    .filter((x) => x.length > 0)
    .map((x) => `/${x}`);
