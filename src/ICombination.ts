import { GamepadButton } from "./IConfig";

/**
 * Represents a registered key combination.
 *
 * A combination is active when all specified buttons are pressed simultaneously.
 * State is checked on every button event and emits events when state changes.
 */
export interface Combination {
    /** Unique identifier for combination - used in events */
    name: string;

    /** Array of buttons that must all be pressed to activate this combination */
    buttons: GamepadButton[];

    /** Current state of the combination (true = all buttons pressed, false = otherwise) */
    isActive: boolean;
}
