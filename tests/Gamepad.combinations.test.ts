import { Gamepad, GamepadEvent } from '../src/Gamepad';
import { GamepadButton } from '../src/IConfig';

// Mock config for testing
const mockConfig = {
    vendorID: 11720,
    productID: 24582,
    buttons: [
        { value: "value == 2", pin: 8, name: GamepadButton.A },
        { value: "value == 1", pin: 8, name: GamepadButton.B },
        { value: "value == 16", pin: 8, name: GamepadButton.X },
    ]
};

// Mock logger
const mockLogger = {
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

describe('Gamepad registerCombination', () => {
    it('should register a combination successfully', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        gamepad.registerCombination('ATTACK', [GamepadButton.A, GamepadButton.B]);

        const combos = gamepad.getCombinations();
        expect(combos).toContain('ATTACK');
    });

    it('should throw error for empty buttons array', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        expect(() => {
            gamepad.registerCombination('EMPTY', []);
        }).toThrow('Combination must have at least one button');
    });

    it('should throw error for duplicate combination name', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        gamepad.registerCombination('ATTACK', [GamepadButton.A, GamepadButton.B]);

        expect(() => {
            gamepad.registerCombination('ATTACK', [GamepadButton.X, GamepadButton.Y]);
        }).toThrow('Combination "ATTACK" already registered');
    });
});

describe('Gamepad unregisterCombination', () => {
    it('should unregister a combination successfully', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        gamepad.registerCombination('ATTACK', [GamepadButton.A, GamepadButton.B]);
        expect(gamepad.getCombinations()).toContain('ATTACK');

        gamepad.unregisterCombination('ATTACK');
        expect(gamepad.getCombinations()).not.toContain('ATTACK');
    });

    it('should throw error for non-existent combination', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        expect(() => {
            gamepad.unregisterCombination('NONEXISTENT');
        }).toThrow('Combination "NONEXISTENT" not found');
    });
});

describe('Gamepad isCombinationPressed', () => {
    it('should return true when all combination buttons are pressed', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        gamepad.registerCombination('ATTACK', [GamepadButton.A, GamepadButton.B]);

        // Simulate button presses
        (gamepad as any)._buttonStates.set(GamepadButton.A, true);
        (gamepad as any)._buttonStates.set(GamepadButton.B, true);
        (gamepad as any)._combinations.get('ATTACK').isActive = true;

        expect(gamepad.isCombinationPressed('ATTACK')).toBe(true);
    });

    it('should return false when combination not active', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        gamepad.registerCombination('ATTACK', [GamepadButton.A, GamepadButton.B]);

        expect(gamepad.isCombinationPressed('ATTACK')).toBe(false);
    });
});

describe('Gamepad checkCombinations', () => {
    it('should emit COMBO_DOWN when all buttons pressed', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        gamepad.registerCombination('ATTACK', [GamepadButton.A, GamepadButton.B]);

        const comboDownSpy = jest.fn();
        gamepad.on(GamepadEvent.COMBO_DOWN, comboDownSpy);

        // Simulate button presses
        (gamepad as any)._buttonStates.set(GamepadButton.A, true);
        (gamepad as any)._buttonStates.set(GamepadButton.B, true);

        (gamepad as any).checkCombinations();

        expect(comboDownSpy).toHaveBeenCalledWith('ATTACK');
    });

    it('should emit COMBO_UP when any button released', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        gamepad.registerCombination('ATTACK', [GamepadButton.A, GamepadButton.B]);

        const comboUpSpy = jest.fn();
        gamepad.on(GamepadEvent.COMBO_UP, comboUpSpy);

        // Simulate button states - combo is active
        (gamepad as any)._buttonStates.set(GamepadButton.A, true);
        (gamepad as any)._buttonStates.set(GamepadButton.B, true);
        (gamepad as any)._combinations.get('ATTACK').isActive = true;

        // Release one button
        (gamepad as any)._buttonStates.set(GamepadButton.A, false);

        (gamepad as any).checkCombinations();

        expect(comboUpSpy).toHaveBeenCalledWith('ATTACK');
    });

    it('should not emit events when combination state unchanged', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        gamepad.registerCombination('ATTACK', [GamepadButton.A, GamepadButton.B]);

        const comboDownSpy = jest.fn();
        const comboUpSpy = jest.fn();
        gamepad.on(GamepadEvent.COMBO_DOWN, comboDownSpy);
        gamepad.on(GamepadEvent.COMBO_UP, comboUpSpy);

        // Simulate partial press (only one button)
        (gamepad as any)._buttonStates.set(GamepadButton.A, true);

        (gamepad as any).checkCombinations();

        expect(comboDownSpy).not.toHaveBeenCalled();
        expect(comboUpSpy).not.toHaveBeenCalled();
    });
});

describe('Gamepad combinations integration', () => {
    it('should handle overlapping combinations correctly', () => {
        const gamepad = new Gamepad(mockConfig, mockLogger, true);

        // Register overlapping combinations
        gamepad.registerCombination('COMBO1', [GamepadButton.A, GamepadButton.B]);
        gamepad.registerCombination('COMBO2', [GamepadButton.A, GamepadButton.B, GamepadButton.X]);

        const events: Array<{event: string, combo: string}> = [];
        gamepad.on(GamepadEvent.COMBO_DOWN, (combo) => events.push({event: 'DOWN', combo}));
        gamepad.on(GamepadEvent.COMBO_UP, (combo) => events.push({event: 'UP', combo}));

        // Press A and B - only COMBO1 should activate
        (gamepad as any)._buttonStates.set(GamepadButton.A, true);
        (gamepad as any)._buttonStates.set(GamepadButton.B, true);
        (gamepad as any).checkCombinations();

        expect(events).toEqual([{event: 'DOWN', combo: 'COMBO1'}]);

        // Press X - COMBO2 should also activate
        (gamepad as any)._buttonStates.set(GamepadButton.X, true);
        (gamepad as any).checkCombinations();

        expect(events).toEqual([
            {event: 'DOWN', combo: 'COMBO1'},
            {event: 'DOWN', combo: 'COMBO2'}
        ]);

        // Release B - both should deactivate
        (gamepad as any)._buttonStates.set(GamepadButton.B, false);
        (gamepad as any).checkCombinations();

        expect(events).toEqual([
            {event: 'DOWN', combo: 'COMBO1'},
            {event: 'DOWN', combo: 'COMBO2'},
            {event: 'UP', combo: 'COMBO1'},
            {event: 'UP', combo: 'COMBO2'}
        ]);
    });
});
