import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "./index";

/**
 * Typed hooks. `useAppSelector(selectZones)` is the direct counterpart of
 * Angular's `store.select(selectZones)` — same selector functions, same
 * memoisation via reselect; only the subscription mechanics differ.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
