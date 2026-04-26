import { IDeviceSpec } from "./IDeviceSpec";

/**
 * Enumeration of standard gamepad button types.
 *
 * Represents the common buttons found on most gamepad controllers.
 */
export enum GamepadButton {
    /** D-pad up button */
    DPAD_UP = "DPAD_UP",
    /** D-pad down button */
    DPAD_DOWN = "DPAD_DOWN",
    /** D-pad right button */
    DPAD_RIGHT = "DPAD_RIGHT",
    /** D-pad left button */
    DPAD_LEFT = "DPAD_LEFT",
    /** A button (typically bottom face button) */
    A = "A",
    /** B button (typically right face button) */
    B = "B",
    /** X button (typically left face button) */
    X = "X",
    /** Y button (typically top face button) */
    Y = "Y",
    /** Right bumper button */
    RB = "RB",
    /** Left bumper button */
    LB = "LB",
    /** Right trigger button */
    RT = "RT",
    /** Left trigger button */
    LT = "LT",
    /** Left stick click button */
    L3 = "L3",
    /** Right stick click button */
    R3 = "R3",
    /** Select/Back button */
    SELECT = "SELECT",
    /** Start button */
    START = "START",
    /** Right stick */
    RIGHT_STICK = "RIGHT_STICK",
    /** Left stick */
    LEFT_STICK = "LEFT_STICK",
    /** Triangle button (playstation) */
    TRIANGLE = "TRIANGLE",
    /** Circle button (playstation) */
    CIRCLE = "CIRCLE",
    /** Square button (playstation) */
    SQUARE = "SQUARE",
}

/**
 * Configuration for a joystick axis.
 *
 * Maps X and Y axes to specific pins on the HID device.
 */
export interface IStickConfig {
    /** The button identifier for this joystick */
    name: GamepadButton,

    /** X-axis pin configuration */
    x: { pin: number };

    /** Y-axis pin configuration */
    y: { pin: number };
}

/**
 * Configuration for a gamepad button.
 *
 * Defines how to read a button's state from the HID device data.
 */
export interface IButtonConfig {
    /**
     * Mathematical expression to evaluate the button state.
     * The expression should use the 'value' variable which represents
     * the data at the specified pin. Example: "value > 128".
     */
    value: string;

    /** The pin number in the HID data array to read */
    pin: number;

    /** The button identifier */
    name: GamepadButton;
}

/**
 * Complete gamepad configuration.
 *
 * Combines device specification with mappings for buttons,
 * joysticks, status indicators, and analog inputs.
 */
export interface IConfig extends IDeviceSpec {
    /** Joystick axis configurations */
    sticks?: IStickConfig[];

    /** Button configurations */
    buttons?: IButtonConfig[];
}
