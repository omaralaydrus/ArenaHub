import type { TypedStartListening } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./index";
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
