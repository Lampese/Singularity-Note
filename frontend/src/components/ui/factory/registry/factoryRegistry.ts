import {
  buttonFactory,
  iconButtonFactory,
  pillButtonFactory,
  toggleButtonFactory,
} from "../groups/button/factories";
import {
  fieldShellFactory,
  inputFactory,
  textareaFactory,
} from "../groups/input/factories";
import { listActionFactory, listRowFactory } from "../groups/list/factories";
import {
  confirmDialogFactory,
  dialogShellFactory,
  popoverTriggerFactory,
} from "../groups/overlay/factories";
import { assertNoDependencyCycles } from "./dependencyMap";

assertNoDependencyCycles();

export const factoryRegistry = {
  button_factory_group: {
    buttonFactory,
    iconButtonFactory,
    toggleButtonFactory,
    pillButtonFactory,
  },
  input_factory_group: {
    inputFactory,
    textareaFactory,
    fieldShellFactory,
  },
  list_factory_group: {
    listRowFactory,
    listActionFactory,
  },
  overlay_factory_group: {
    dialogShellFactory,
    confirmDialogFactory,
    popoverTriggerFactory,
  },
} as const;

export type FactoryRegistry = typeof factoryRegistry;
