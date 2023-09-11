import type { UseStore } from "idb-keyval";

interface StyleFn {
  /**
   * Removes <style> from document
   */
  (): HTMLStyleElement;

  /**
   * Updates CSS in <style> element
   */
  (style: HTMLStyleElement["innerHTML"]): void;
}

export function appendStyle(style: HTMLStyleElement["innerHTML"]): void;
export const neptuneIdbStore: UseStore;
export function createPersistentObject<T = unknown>(id, isArray = false): [T, Promise<void>];
export function createPersistentObject<T = unknown>(id, isArray = true): [T[], Promise<void>];

export type ArtistSizes = "160x160" | "320x320" | "480x480" | "750x750";
export type ArtistGridSizes = "160x107" | "320x214" | "640x428" | "750x500" | "1080x720";
export type AlbumSizes = "80x80" | "160x160" | "320x320" | "640x640" | "1280x1280";
export type VideoSizes = "160x90" | "320x180" | "480x270" | "640x360" | "800x450" | "1280x720";
export type PlaylistSizes = "160x160" | "320x320" | "480x480" | "640x640" | "750x750" | "1080x1080";
export type MixSizes = "320x320" | "640x640" | "1500x1500";
export type ArtistBannerSizes = "1024x256";
export type FeaturedPromoSizes = "1280x400" | "1650x400" | "2200x400" | "2750x400";
export type GenreSizes = "460x306" | "2048x512";
export type MoodSizes = "342x342" | "2048x330";
export type PlaylistRatioThreeTwoSizes =
  | "160x107"
  | "320x214"
  | "480x320"
  | "640x428"
  | "750x500"
  | "1080x720";
export type ProfileSizes = "100x100" | "210x210" | "600x600";
export type PromoSizes = "550x400" | "640x465" | "1100x800";
export type UserSizes = "100x100" | "210x210" | "600x600";
export type Size =
  | ArtistSizes
  | ArtistGridSizes
  | AlbumSizes
  | VideoSizes
  | PlaylistSizes
  | MixSizes
  | ArtistBannerSizes
  | FeaturedPromoSizes
  | GenreSizes
  | MoodSizes
  | PlaylistRatioThreeTwoSizes
  | ProfileSizes
  | PromoSizes
  | UserSizes;

export function getMediaURLFromID<TPath extends `/${Size}.${string}` = "/1280x1280.jpg">(
  id?: string,
  path?: TPath,
): `https://resources.tidal.com/images/${string}${TPath}`;
