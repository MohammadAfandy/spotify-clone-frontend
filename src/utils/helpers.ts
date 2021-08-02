import Cookies from 'js-cookie';
import Artist from '../types/Artist';
import moment from 'moment';

const cookiePrefix = 'spotify_clone_';

export const getHashValue = () => {
  const arrHash = window.location.hash.substring(1).split('&');
  const result: { [key: string]: string } = {};
  arrHash.forEach((hash) => {
    const [param, value] = hash.split('=');
    result[param] = decodeURIComponent(value);
  });

  return result;
};

export const getCookie = (key: string): string => {
  return Cookies.get(cookiePrefix + key) || '';
}

export const setCookie = (key: string, value: string): void => {
  Cookies.set(cookiePrefix + key, value);
};

export const removeCookie = (key: string): void => {
  Cookies.remove(cookiePrefix + key);
};

export const getSmallestImage = (images: any[] = []) => {
  return images.reduce((acc, curr, idx) => {
    if (!acc) return curr.url;
    const previousArr = images[idx - 1];
    if (curr.height < previousArr.height) {
      return curr.url;
    }
    return previousArr.url;
  }, '');
};

export const getHighestImage = (images: any[] = []) => {
  return images.reduce((acc, curr, idx) => {
    if (!acc) return curr.url;
    const previousArr = images[idx - 1];
    if (curr.height > previousArr.height) {
      return curr.url;
    }
    return previousArr.url;
  }, '');
};

export const ellipsis = (text: string, max = 40): string => {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
};

export const sleep = (miliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
};

export const getArtistNames = (artists: Artist[]): string => {
  return artists.map((v) => v.name).join(', ');
};

export const formatDate = (date: string | number | Date, format = 'string'): string => {
  return moment(date).format(format);
};

export const duration = (miliseconds: number, humanize = false): string|number => {
  const momentObj = moment.utc(miliseconds);
  const hours = momentObj.hours();
  
  if (humanize) {
    const minutes = momentObj.minutes();
    const seconds = momentObj.seconds();
    let result = [];
    if (hours > 0) {
      result.push(hours + ' hr');
    }
    if (minutes > 0) {
      result.push(minutes + ' min');
    }
    if (hours <= 0) {
      result.push(seconds + ' sec');
    }

    return result.join(' ');
  } else {
    let format = 'mm:ss';
    if (hours > 1) format = 'h:mm:ss';
    return momentObj.format(format);
  }
};

export const fromNow = (date: Date): string => {
  const momentObj = moment(date);
  const diff = momentObj.diff(new Date(), 'months');
  if (diff <= -1) {
    return momentObj.format('MMM D, YYYY');
  }  
  return momentObj.fromNow();
};

export const toBase64 = (file: Blob): Promise<string | ArrayBuffer | null> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});
