import type { ActionTypes } from "../tidal";
export type UninterceptFunction = () => void;

export type ActionType = keyof ActionTypes;

export type PayloadActionTypeTuple<AT extends ActionType> = [ActionTypes[AT], AT];
export type CallbackFunction<ForActionTypes extends ActionType> =
  /**
   * @returns `true` to cancel dispatch
   * @returns anything else to continue
   */
  <AT extends ForActionTypes>([payload, at]: PayloadActionTypeTuple<AT>) =>
    | true
    | void
    | Promise<void>;

/**
 * intercept redux events
 *
 * return `true` from callback function to cancel the dispatch
 */
export function intercept<AT extends ActionType>(
  type: AT,
  cb: CallbackFunction<AT>,
  once?: boolean,
): UninterceptFunction;

/**
 * if using this signature you will have to manually cast action payloads
 * to their proper types because narrowing generic types isn't
 * possible yet in TypeScript
 *
 * return `true` from callback function to cancel the dispatch
 */
export function intercept<AT extends ActionType>(
  types: AT[],
  cb: CallbackFunction<AT>,
  once?: boolean,
): UninterceptFunction;
