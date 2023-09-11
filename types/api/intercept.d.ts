import type { ActionTypes } from "../tidal";
export type UninterceptFunction = () => void;

export type ActionType = keyof ActionTypes;

export type PayloadActionTypeTuple<AT extends ActionType> = [ActionTypes[AT], AT];
export type CallbackFunction<ForActionTypes extends ActionType> =
  /**
   * @returns anything else to continue
   * @returns `false` to cancel dispatch
   */
  <AT extends ForActionTypes>([payload, at]: PayloadActionTypeTuple<AT>) => false | unknown;

/**
 * intercept redux events
 */
export function intercept<AT extends ActionType>(
  type: AT,
  cb: CallbackFunction<AT>,
  once?: boolean,
): UninterceptFunction;
// /**
//  * dont use this signature
//  * @deprecated
//  */
// export function intercept<AT extends ActionType>(
//   types: AT[],
//   cb: CallbackFunction<AT>,
//   once = false
// ): UninterceptFunction
