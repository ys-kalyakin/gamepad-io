import { gamepadConfigs } from '../src/gamepads';
import { Gamepad } from '../src/Gamepad';
import { GamepadButton } from '../src/IConfig';

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
        // Simple evaluation for testing
        if (expr.includes('>')) {
            const match = expr.match(/value\s*>\s*(\d+)/);
            if (match) {
                return scope.value > parseInt(match[1], 10);
            }
        }
        if (expr.includes('==')) {
            const match = expr.match(/value\s*==\s*(\d+)/);
            if (match) {
                return scope.value === parseInt(match[1], 10);
            }
        }
        if (expr.includes('&&') || expr.includes('||')) {
            // For complex expressions, return false for testing
            return false;
        }
        return false;
    }),
}));

// Mock logger
const mockLogger = {
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

describe('Gamepad Configurations', () => {
    test('should contain all expected configurations', () => {
        const configNames = Object.keys(gamepadConfigs);
        expect(configNames).toEqual(['eightBitDoPro2', 'logitechF310', 'logitechF710']);
    });

    describe('eightBitDoPro2 configuration', () => {
        const config = gamepadConfigs.eightBitDoPro2;

        test('should have correct vendor and product IDs', () => {
            expect(config.vendorID).toBe(11720); // 0x2dc8
            expect(config.productID).toBe(24582); // 0x6006
        });

        test('should have sticks configuration', () => {
            expect(config.sticks).toBeDefined();
            expect(Array.isArray(config.sticks)).toBe(true);
            expect(config.sticks?.length).toBe(2);

            const leftStick = config.sticks?.find((s) => s.name === GamepadButton.LEFT_STICK);
            const rightStick = config.sticks?.find((s) => s.name === GamepadButton.RIGHT_STICK);

            expect(leftStick).toBeDefined();
            expect(rightStick).toBeDefined();
            expect(leftStick?.x.pin).toBe(2);
            expect(leftStick?.y.pin).toBe(3);
            expect(rightStick?.x.pin).toBe(4);
            expect(rightStick?.y.pin).toBe(5);
        });

        test('should have buttons configuration', () => {
            expect(config.buttons).toBeDefined();
            expect(Array.isArray(config.buttons)).toBe(true);
            expect(config.buttons?.length).toBeGreaterThan(0);

            // Check for some expected buttons
            const aButton = config.buttons?.find((b) => b.name === GamepadButton.A);
            const bButton = config.buttons?.find((b) => b.name === GamepadButton.B);
            const startButton = config.buttons?.find((b) => b.name === GamepadButton.START);

            expect(aButton).toBeDefined();
            expect(bButton).toBeDefined();
            expect(startButton).toBeDefined();
        });

        test('should create Gamepad instance without errors', () => {
            expect(() => {
                new Gamepad(config, mockLogger, true);
            }).not.toThrow();
        });
    });

    describe('logitechF310 configuration', () => {
        const config = gamepadConfigs.logitechF310;

        test('should have correct vendor and product IDs', () => {
            expect(config.vendorID).toBe(1133); // 0x046d
            expect(config.productID).toBe(49686); // 0xc216
        });

        test('should have sticks configuration', () => {
            expect(config.sticks).toBeDefined();
            expect(Array.isArray(config.sticks)).toBe(true);
            expect(config.sticks?.length).toBe(2);

            const leftStick = config.sticks?.find((s) => s.name === GamepadButton.LEFT_STICK);
            const rightStick = config.sticks?.find((s) => s.name === GamepadButton.RIGHT_STICK);

            expect(leftStick).toBeDefined();
            expect(rightStick).toBeDefined();
            expect(leftStick?.x.pin).toBe(0);
            expect(leftStick?.y.pin).toBe(1);
            expect(rightStick?.x.pin).toBe(2);
            expect(rightStick?.y.pin).toBe(3);
        });

        test('should have buttons configuration', () => {
            expect(config.buttons).toBeDefined();
            expect(Array.isArray(config.buttons)).toBe(true);
            expect(config.buttons?.length).toBeGreaterThan(0);

            // Check for some expected buttons
            const aButton = config.buttons?.find((b) => b.name === GamepadButton.A);
            const bButton = config.buttons?.find((b) => b.name === GamepadButton.B);
            const xButton = config.buttons?.find((b) => b.name === GamepadButton.X);
            const yButton = config.buttons?.find((b) => b.name === GamepadButton.Y);
            const lbButton = config.buttons?.find((b) => b.name === GamepadButton.LB);
            const rbButton = config.buttons?.find((b) => b.name === GamepadButton.RB);

            expect(aButton).toBeDefined();
            expect(bButton).toBeDefined();
            expect(xButton).toBeDefined();
            expect(yButton).toBeDefined();
            expect(lbButton).toBeDefined();
            expect(rbButton).toBeDefined();
        });

        test('should create Gamepad instance without errors', () => {
            expect(() => {
                new Gamepad(config, mockLogger, true);
            }).not.toThrow();
        });
    });

    describe('logitechF710 configuration', () => {
        const config = gamepadConfigs.logitechF710;

        test('should have correct vendor and product IDs', () => {
            expect(config.vendorID).toBe(1133); // 0x046d
            expect(config.productID).toBe(49689); // 0xc219
        });

        test('should have sticks configuration', () => {
            expect(config.sticks).toBeDefined();
            expect(Array.isArray(config.sticks)).toBe(true);
            expect(config.sticks?.length).toBe(2);

            const leftStick = config.sticks?.find((s) => s.name === GamepadButton.LEFT_STICK);
            const rightStick = config.sticks?.find((s) => s.name === GamepadButton.RIGHT_STICK);

            expect(leftStick).toBeDefined();
            expect(rightStick).toBeDefined();
            expect(leftStick?.x.pin).toBe(1);
            expect(leftStick?.y.pin).toBe(2);
            expect(rightStick?.x.pin).toBe(3);
            expect(rightStick?.y.pin).toBe(4);
        });

        test('should have buttons configuration', () => {
            expect(config.buttons).toBeDefined();
            expect(Array.isArray(config.buttons)).toBe(true);
            expect(config.buttons?.length).toBeGreaterThan(0);

            // Check for some expected buttons
            const aButton = config.buttons?.find((b) => b.name === GamepadButton.A);
            const bButton = config.buttons?.find((b) => b.name === GamepadButton.B);
            const xButton = config.buttons?.find((b) => b.name === GamepadButton.X);
            const yButton = config.buttons?.find((b) => b.name === GamepadButton.Y);
            const lbButton = config.buttons?.find((b) => b.name === GamepadButton.LB);
            const rbButton = config.buttons?.find((b) => b.name === GamepadButton.RB);

            expect(aButton).toBeDefined();
            expect(bButton).toBeDefined();
            expect(xButton).toBeDefined();
            expect(yButton).toBeDefined();
            expect(lbButton).toBeDefined();
            expect(rbButton).toBeDefined();
        });

        test('should create Gamepad instance without errors', () => {
            expect(() => {
                new Gamepad(config, mockLogger, true);
            }).not.toThrow();
        });
    });

    test('all configurations should have valid button expressions', () => {
        Object.values(gamepadConfigs).forEach((config) => {
            if (config.buttons) {
                config.buttons.forEach((button) => {
                    expect(typeof button.value).toBe('string');
                    expect(button.value.length).toBeGreaterThan(0);
                    // Expression should contain 'value' variable
                    expect(button.value).toContain('value');
                });
            }
        });
    });

    test('all configurations should have valid stick pin numbers', () => {
        Object.values(gamepadConfigs).forEach((config) => {
            if (config.sticks) {
                config.sticks.forEach((stick) => {
                    expect(typeof stick.x.pin).toBe('number');
                    expect(typeof stick.y.pin).toBe('number');
                    expect(stick.x.pin).toBeGreaterThanOrEqual(0);
                    expect(stick.y.pin).toBeGreaterThanOrEqual(0);
                });
            }
        });
    });
});
