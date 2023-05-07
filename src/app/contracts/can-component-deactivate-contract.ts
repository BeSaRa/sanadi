import {CanNavigateOptions} from "@app/types/types";

export interface CanComponentDeactivateContract {
  canDeactivate: () => CanNavigateOptions;
}
