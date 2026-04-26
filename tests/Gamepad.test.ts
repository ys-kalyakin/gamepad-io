import { Gamepad, GamepadEvent } from '../src/Gamepad';
import { IConfig, GamepadButton } from '../src/IConfig';
import { ILogger } from '../src/ILogger';
import { EventEmitter } from 'events';

// Mock node-hid
jest.mock('node-hid', () => {
    return {
        HID: jest.fn().mockImplementation(() => {
            return {
                on: jest.fn(),
                close: jest.fn(),
            };
        }),
        devices: jest.fn().mockReturnValue([]),
    };
});

// Mock mathjs
jest.mock('mathjs', () => ({
    evaluate: jest.fn((expr: string, scope: { value: number }) => {
        if (expr === 'value > 128') {
            return scope.value > 128;
        }
        if (expr === 'value > 64') {
            return scope.value > 64;
        }
        return false;
    }),
}));

// Use fake timers to prevent timer leaks in Jest
jest.useFakeTimers();

describe('Gamepad', () => {
    let mockConfig: IConfig;
    let mockLogger: ILogger;
    let gamepad: Gamepad;

    beforeEach(() => {
        mockConfig = {
            vendorID: 0x1234,
            productID: 0x5678,
            buttons: [
                {
                    name: GamepadButton.A,
                    pin: 0,
                    value: 'value > 128',
                },
                {
                    name: GamepadButton.B,
                    pin: 1,
                    value: 'value > 128',
                },
            ],
            sticks: [
                {
                    name: GamepadButton.LEFT_STICK,
                    x: { pin: 2 },
                    y: { pin: 3 },
                },
                {
                    name: GamepadButton.RIGHT_STICK,
                    x: { pin: 4 },
                    y: { pin: 5 },
                },
            ],
        };

        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            log: jest.fn(),
        };

        gamepad = new Gamepad(mockConfig, mockLogger, false);
        jest.clearAllMocks();
    });

    afterEach(() => {
        gamepad.removeAllListeners();
    });

    describe('Constructor', () => {
        it('should create a new Gamepad instance', () => {
            expect(gamepad).toBeInstanceOf(EventEmitter);
        });

        it('should accept config parameter', () => {
            const testConfig: IConfig = {
                vendorID: 0x1111,
                productID: 0x2222,
            };
            const testGamepad = new Gamepad(testConfig);
            expect(testGamepad).toBeDefined();
        });

        it('should accept optional logger', () => {
            const testGamepad = new Gamepad(mockConfig, mockLogger);
            expect(testGamepad).toBeDefined();
        });

        it('should accept optional nonExclusive flag', () => {
            const testGamepad = new Gamepad(mockConfig, mockLogger, true);
            expect(testGamepad).toBeDefined();
        });
    });

    describe('start', () => {
        it('should set _running to true when called', () => {
            gamepad.start();
            const gamepadAny = gamepad as any;
            expect(gamepadAny._running).toBe(true);
        });

        it('should not start if already running', () => {
            gamepad.start();
            const debugSpy = mockLogger.debug as jest.Mock;
            const beforeCalls = debugSpy.mock.calls.length;
            gamepad.start();
            // Second call should not trigger additional logging
            expect(debugSpy.mock.calls.length).toBe(beforeCalls);
        });
    });

    describe('isPressed', () => {
        it('should return false for a button that has never been pressed', () => {
            expect(gamepad.isPressed(GamepadButton.A)).toBe(false);
        });

        it('should return false for unknown button', () => {
            expect(gamepad.isPressed('unknown' as any)).toBe(false);
        });
    });

    describe('Button state tracking', () => {
        it('should emit "down" event when button is pressed', (done) => {
            gamepad.on('down', (buttonName: GamepadButton) => {
                expect(buttonName).toBe(GamepadButton.A);
                done();
            });

            // Simulate button press by accessing private method through reflection
            const gamepadAny = gamepad as any;
            gamepadAny.processButton([200], mockConfig.buttons![0]);
        });

        it('should emit "up" event when button is released', (done) => {
            // First press the button
            const gamepadAny = gamepad as any;
            gamepadAny.processButton([200], mockConfig.buttons![0]);

            gamepad.on('up', (buttonName: GamepadButton) => {
                expect(buttonName).toBe(GamepadButton.A);
                done();
            });

            // Then release it
            gamepadAny.processButton([50], mockConfig.buttons![0]);
        });

        it('should not emit events when button state does not change', () => {
            const downSpy = jest.fn();
            gamepad.on('down', downSpy);

            const gamepadAny = gamepad as any;
            gamepadAny.processButton([200], mockConfig.buttons![0]);
            gamepadAny.processButton([200], mockConfig.buttons![0]);

            expect(downSpy).toHaveBeenCalledTimes(1);
        });

        it('should track button state correctly with isPressed', (done) => {
            gamepad.on('down', () => {
                expect(gamepad.isPressed(GamepadButton.A)).toBe(true);
                done();
            });

            const gamepadAny = gamepad as any;
            gamepadAny.processButton([200], mockConfig.buttons![0]);
        });

        it('should return false after button is released', (done) => {
            // First press
            const gamepadAny = gamepad as any;
            gamepadAny.processButton([200], mockConfig.buttons![0]);

            gamepad.on('up', () => {
                expect(gamepad.isPressed(GamepadButton.A)).toBe(false);
                done();
            });

            // Then release
            gamepadAny.processButton([50], mockConfig.buttons![0]);
        });
    });

    describe('Multiple buttons', () => {
        it('should handle multiple button configurations', () => {
            const gamepadAny = gamepad as any;
            const downSpy = jest.fn();

            gamepad.on('down', downSpy);

            // Press both buttons
            gamepadAny.processButton([200, 0], mockConfig.buttons![0]); // A button
            gamepadAny.processButton([0, 200], mockConfig.buttons![1]); // B button

            expect(downSpy).toHaveBeenCalledTimes(2);
        });

        it('should track state for each button independently', () => {
            const gamepadAny = gamepad as any;

            // Press A, release B
            gamepadAny.processButton([200, 0], mockConfig.buttons![0]); // A pressed
            gamepadAny.processButton([0, 200], mockConfig.buttons![1]); // B pressed

            expect(gamepad.isPressed(GamepadButton.A)).toBe(true);
            expect(gamepad.isPressed(GamepadButton.B)).toBe(true);
        });
    });

    describe('processButtons', () => {
        it('should skip buttons if data length is insufficient', () => {
            const gamepadAny = gamepad as any;
            const processButtonSpy = jest.spyOn(gamepadAny, 'processButton');

            gamepadAny.processButtons([100]);

            // Should process only the first button (pin 0)
            expect(processButtonSpy).toHaveBeenCalledTimes(1);
        });

        it('should process all buttons when data length is sufficient', () => {
            const gamepadAny = gamepad as any;
            const processButtonSpy = jest.spyOn(gamepadAny, 'processButton');

            gamepadAny.processButtons([100, 100, 100]);

            // Should process both buttons
            expect(processButtonSpy).toHaveBeenCalledTimes(2);
        });

        it('should handle undefined buttons config', () => {
            const gamepadAny = gamepad as any;
            const configWithoutButtons = { ...mockConfig, buttons: undefined };
            Object.defineProperty(gamepadAny, 'config', { value: configWithoutButtons });

            expect(() => gamepadAny.processButtons([100, 100])).not.toThrow();
        });
    });

    describe('onControllerEvent', () => {
        it('should call processButtons with received data', () => {
            const gamepadAny = gamepad as any;
            const processButtonsSpy = jest.spyOn(gamepadAny, 'processButtons');

            gamepadAny.onControllerEvent([100, 100]);

            expect(processButtonsSpy).toHaveBeenCalledWith([100, 100]);
        });

        it('should log debug message with received data', () => {
            const gamepadAny = gamepad as any;
            gamepadAny.onControllerEvent([100, 100]);

            expect(mockLogger.debug).toHaveBeenCalled();
        });
    });

    describe('Config handling', () => {
        it('should work with config without buttons', () => {
            const configWithoutButtons: IConfig = {
                vendorID: 0x1234,
                productID: 0x5678,
            };

            const testGamepad = new Gamepad(configWithoutButtons);
            expect(testGamepad).toBeDefined();
        });

        it('should work with empty buttons array', () => {
            const configWithEmptyButtons: IConfig = {
                vendorID: 0x1234,
                productID: 0x5678,
                buttons: [],
            };

            const testGamepad = new Gamepad(configWithEmptyButtons);
            expect(testGamepad).toBeDefined();
        });
    });

    describe('Logger integration', () => {
        it('should not throw when logger is undefined', () => {
            const gamepadWithoutLogger = new Gamepad(mockConfig);
            const gamepadAny = gamepadWithoutLogger as any;

            expect(() => gamepadAny.onControllerEvent([100, 100])).not.toThrow();
        });

        it('should use logger when provided', () => {
            const gamepadAny = gamepad as any;
            gamepadAny.onControllerEvent([100, 100]);

            expect(mockLogger.debug).toHaveBeenCalled();
        });
    });

    describe('Button value expressions', () => {
        it('should use different value expressions for different buttons', () => {
            const configWithDifferentValues: IConfig = {
                vendorID: 0x1234,
                productID: 0x5678,
                buttons: [
                    {
                        name: GamepadButton.A,
                        pin: 0,
                        value: 'value > 128',
                    },
                    {
                        name: GamepadButton.B,
                        pin: 1,
                        value: 'value > 64',
                    },
                ],
            };

            const testGamepad = new Gamepad(configWithDifferentValues);
            const gamepadAny = testGamepad as any;

            // A button should not be pressed at 100 (< 128)
            gamepadAny.processButton([100, 0], configWithDifferentValues.buttons![0]);
            expect(testGamepad.isPressed(GamepadButton.A)).toBe(false);

            // B button should be pressed at 100 (> 64)
            gamepadAny.processButton([0, 100], configWithDifferentValues.buttons![1]);
            expect(testGamepad.isPressed(GamepadButton.B)).toBe(true);
        });
    });

    describe('Event emissions', () => {
        it('should emit events with button name', (done) => {
            gamepad.on('down', (buttonName: GamepadButton) => {
                expect(buttonName).toBe(GamepadButton.A);
                done();
            });

            const gamepadAny = gamepad as any;
            gamepadAny.processButton([200], mockConfig.buttons![0]);
        });

        it('should support multiple event listeners', (done) => {
            let callCount = 0;
            const expectedCalls = 2;

            const handler = () => {
                callCount++;
                if (callCount === expectedCalls) {
                    done();
                }
            };

            gamepad.on('down', handler);
            gamepad.on('down', handler);

            const gamepadAny = gamepad as any;
            gamepadAny.processButton([200], mockConfig.buttons![0]);
        });
    });

    describe('Sticks', () => {
        beforeEach(() => {
            // Reset gamepad to ensure clean state
            gamepad = new Gamepad(mockConfig, mockLogger);
        });

        it('should have stick configuration', () => {
            const gamepadAny = gamepad as any;
            expect(gamepadAny.config.sticks).toBeDefined();
            expect(gamepadAny.config.sticks).toHaveLength(2);
        });

        test('should emit MOVE event when stick position changes', () => {
            const mockCallback = jest.fn();
            gamepad.on(GamepadEvent.MOVE, mockCallback);

            // Simulate HID data with stick movement
            const mockData = [0, 0, 128, 64, 0, 0, 0, 0, 0, 0]; // LEFT_STICK at x=128, y=64
            (gamepad as any).onControllerEvent(mockData);

            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenCalledWith(GamepadButton.LEFT_STICK, { x: 128, y: 64 });
            expect(mockCallback).toHaveBeenCalledWith(GamepadButton.RIGHT_STICK, { x: 0, y: 0 });
        });

        test('should handle multiple sticks in single data event', () => {
            const mockCallback = jest.fn();
            gamepad.on(GamepadEvent.MOVE, mockCallback);

            // Simulate HID data with both sticks moving
            const mockData = [0, 0, 128, 64, 192, 96, 0, 0, 0, 0];
            (gamepad as any).onControllerEvent(mockData);

            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenCalledWith(GamepadButton.LEFT_STICK, { x: 128, y: 64 });
            expect(mockCallback).toHaveBeenCalledWith(GamepadButton.RIGHT_STICK, { x: 192, y: 96 });
        });

        test('should not emit MOVE event when position unchanged', () => {
            const mockCallback = jest.fn();
            gamepad.on(GamepadEvent.MOVE, mockCallback);

            // First event
            const mockData1 = [0, 0, 128, 64, 0, 0, 0, 0, 0, 0];
            (gamepad as any).onControllerEvent(mockData1);

            expect(mockCallback).toHaveBeenCalledTimes(2);

            // Reset mock
            mockCallback.mockClear();

            // Same position - should not emit
            const mockData2 = [0, 0, 128, 64, 0, 0, 0, 0, 0, 0];
            (gamepad as any).onControllerEvent(mockData2);

            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should track stick state in _stickStates map', () => {
            const mockData = [0, 0, 128, 64, 192, 96, 0, 0, 0, 0];
            (gamepad as any).onControllerEvent(mockData);

            const stickStates = (gamepad as any)._stickStates;
            expect(stickStates.get(GamepadButton.LEFT_STICK)).toEqual({ x: 128, y: 64 });
            expect(stickStates.get(GamepadButton.RIGHT_STICK)).toEqual({ x: 192, y: 96 });
        });

        test('should handle data array shorter than pin index gracefully', () => {
            const mockCallback = jest.fn();
            gamepad.on(GamepadEvent.MOVE, mockCallback);

            // Data array too short for stick pins (only 3 elements, need at least 6)
            const shortData = [0, 0, 128];
            (gamepad as any).onControllerEvent(shortData);

            // Should not crash and should not emit events
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should handle partial stick data (only x or y pin available)', () => {
            const mockCallback = jest.fn();
            gamepad.on(GamepadEvent.MOVE, mockCallback);

            // Data has x pin but not y pin for right stick
            const partialData = [0, 0, 128, 64, 192]; // Missing y for right stick
            (gamepad as any).onControllerEvent(partialData);

            // Should emit for left stick only
            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(GamepadButton.LEFT_STICK, { x: 128, y: 64 });
        });
    });
});
