import EventEmitter from 'events';
import { HID, devices } from 'node-hid';
import { evaluate } from 'mathjs';
import { ILogger } from './ILogger';
import { GamepadButton, IButtonConfig, IConfig } from './IConfig';
import { Combination } from './ICombination';
import { StickValue } from './StickValue';

/**
 * Gamepad controller class using node-hid for HID device communication.
 *
 * Manages connection to a gamepad device, processes button states,
 * and emits events for button presses/releases and device connection changes.
 */
export class Gamepad extends EventEmitter {
    private _hid?: HID = undefined;
    private _running: boolean = false;
    private _connectRetry?: ReturnType<typeof setTimeout>;
    private _buttonStates = new Map<GamepadButton, boolean>();
    private _stickStates: Map<GamepadButton, StickValue> = new Map<GamepadButton, StickValue>();
    private _combinations = new Map<string, Combination>();
    private readonly _connectionDelay: number = 500;

    /**
     * Creates a new Gamepad instance.
     *
     * @param config - Device configuration including vendor/product IDs and button mappings
     * @param logger - Optional logger for debugging and information messages
     * @param nonExclusive - Whether the device should be opened in non-exclusive mode
     */
    constructor(
        private config: IConfig,
        private logger?: ILogger,
        private nonExclusive?: boolean
    ) {
        super();
    }

    /**
     * Starts the gamepad connection.
     *
     * Begins the connection process to the configured device.
     * If not already running, sets up the connection loop.
     */
    public start(): void {
        if (!this._running) {
            this.logger?.debug?.('Starting connection to gamepad...');
            this.connect();
            this._running = true;
        }
    }

    public stop(): void {
        this._running = false;
        this.stopConnectionRetries();
        this.closeDevice();
    }

    /**
     * Checks if a button is currently pressed.
     *
     * @param button - button to check
     * @returns true if the button is pressed, false otherwise
     */
    public isPressed(button: GamepadButton) {
        return this._buttonStates.get(button) ?? false;
    }

    /**
     * Registers a new combination that emits events when all buttons are pressed.
     *
     * @param name - Unique identifier for this combination
     * @param buttons - Array of buttons that must all be pressed to activate
     * @throws Error if buttons array is empty or name already exists
     */
    public registerCombination(name: string, buttons: GamepadButton[]): void {
        if (buttons.length === 0) {
            throw new Error('Combination must have at least one button');
        }

        if (this._combinations.has(name)) {
            throw new Error(`Combination "${name}" already registered`);
        }

        const combination: Combination = {
            name,
            buttons,
            isActive: false,
        };

        this._combinations.set(name, combination);
    }

    /**
     * Removes a previously registered combination.
     *
     * @param name - Name of the combination to remove
     * @throws Error if combination with given name doesn't exist
     */
    public unregisterCombination(name: string): void {
        if (!this._combinations.has(name)) {
            throw new Error(`Combination "${name}" not found`);
        }

        this._combinations.delete(name);
    }

    /**
     * Gets all registered combination names.
     *
     * @returns Array of combination names
     */
    public getCombinations(): string[] {
        return Array.from(this._combinations.keys());
    }

    /**
     * Checks if a combination is currently active (all buttons pressed).
     *
     * @param name - Name of the combination to check
     * @returns true if combination is active, false otherwise
     */
    public isCombinationPressed(name: string): boolean {
        const combination = this._combinations.get(name);
        return combination?.isActive ?? false;
    }

    private connect(): void {
        const device = devices(this.config.vendorID, this.config.productID)?.find((device) => {
            return this.config.serialNumber
                ? this.config.serialNumber === device.serialNumber
                : true;
        });

        if (!device || !device.path) {
            this.logger?.debug?.('Gamepad not found, trying again later');
            this._connectRetry = setTimeout(() => this.connect(), this._connectionDelay);
            return;
        }

        this.logger?.debug?.(`connecting to: ${JSON.stringify(device)}`);
        try {
            this._hid = new HID(device.path, { nonExclusive: this.nonExclusive });
            this.logger?.debug?.('connected to:');
            this.emit(GamepadEvent.CONNECTED);
            this._connectRetry = undefined;
            this._hid.on('data', (data: number[]) => this.onControllerEvent(data));
            this._hid.on('error', (error) => {
                this.logger?.log?.(`Error occurred:${JSON.stringify(error)}`);
                this.emit(GamepadEvent.DISCONNECTED);
                this.closeDevice();
                setTimeout(() => {
                    this.logger?.log?.('reconnecting');
                    this.connect();
                }, this._connectionDelay);
            });
        } catch (error) {
            const typedError = error as Error;
            this.logger?.log?.(`Error occurred: ${typedError.message}`);
            this.closeDevice();
            this._connectRetry = setTimeout(() => this.connect(), this._connectionDelay);
        }
    }

    private onControllerEvent(data: number[]) {
        this.logger?.debug?.(`Received event: ${JSON.stringify(data)}`);
        this.processButtons(data);
        this.processSticks(data);
        this.checkCombinations();
    }

    private processButtons(data: number[]) {
        this.config.buttons?.forEach((button) => {
            if (data.length > button.pin) {
                this.processButton(data, button);
            }
        });
    }

    private processButton(data: number[], config: IButtonConfig) {
        const savedState: boolean = this._buttonStates.get(config.name) ?? false;
        const currentState: boolean = evaluate(config.value, { value: data[config.pin] });

        if (savedState !== currentState) {
            this._buttonStates.set(config.name, currentState);
            this.emit(currentState ? GamepadEvent.DOWN : GamepadEvent.UP, config.name);
        }
    }

    private processSticks(data: number[]) {
        this.config.sticks?.forEach((stick) => {
            if (data.length > stick.x.pin && data.length > stick.y.pin) {
                const oldState = this._stickStates.get(stick.name);
                const newState = {
                    x: data[stick.x.pin],
                    y: data[stick.y.pin],
                };

                if (
                    oldState === undefined ||
                    oldState.x !== newState.x ||
                    oldState.y !== newState.y
                ) {
                    this.emit(GamepadEvent.MOVE, stick.name, newState);
                    this._stickStates.set(stick.name, newState);
                }
            }
        });
    }

    private closeDevice(): void {
        this._hid?.close();
        this._hid = undefined;
    }

    /**
     * Checks all registered combinations and emits events if their state changes.
     */
    private checkCombinations(): void {
        for (const [name, combo] of this._combinations) {
            const allPressed = combo.buttons.every((btn) => {
                return this.isPressed(btn);
            });

            if (allPressed !== combo.isActive) {
                combo.isActive = allPressed;
                this.emit(allPressed ? GamepadEvent.COMBO_DOWN : GamepadEvent.COMBO_UP, name);
            }
        }
    }

    private stopConnectionRetries(): void {
        if (this._connectRetry) {
            clearTimeout(this._connectRetry);
            this._connectRetry = undefined;
        }
    }
}

/**
 * Events emitted by the Gamepad class.
 *
 * These events can be listened to using standard EventEmitter methods.
 */
export enum GamepadEvent {
    /**
     * Emitted when the gamepad device is successfully connected.
     */
    CONNECTED = 'connected',

    /**
     * Emitted when the gamepad device is disconnected or an error occurs.
     */
    DISCONNECTED = 'disconnected',

    /**
     * Emitted when a button is pressed.
     *
     * @param buttonName - The name of the button that was pressed (GamepadButton)
     */
    DOWN = 'down',

    /**
     * Emitted when a button is released.
     *
     * @param buttonName - The name of the button that was released (GamepadButton)
     */
    UP = 'up',

    /**
     * Emitted when a combination becomes active (all buttons pressed).
     *
     * @param combinationName - The name of the combination that became active
     */
    COMBO_DOWN = 'comboDown',

    /**
     * Emitted when a combination becomes inactive (any button released).
     *
     * @param combinationName - The name of the combination that became inactive
     */
    COMBO_UP = 'comboUp',

    /**
     * Emitted when a stick (joystick) position changes.
     *
     * @param stickName - The name of the stick that moved (GamepadButton)
     * @param position - The new position as StickValue { x: number, y: number }
     */
    MOVE = 'move',
}
