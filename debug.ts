import { Gamepad, GamepadEvent } from './src/Gamepad';
import { IConfig, GamepadButton } from './src/IConfig';
import type { StickValue } from './src/StickValue'; // Add this import
import { gamepadConfigs } from './src/gamepads';

// Simple logger
const logger = {
    debug: console.log,
    log: console.log,
    error: console.error,
};

// Load gamepad config
const config: IConfig = gamepadConfigs.eightBitDoPro2;

console.log('=== Gamepad Debug Mode ===');
console.log('Config:', JSON.stringify(config, null, 2));

// Create gamepad instance
const gamepad = new Gamepad(config, logger, true);

// Register combinations
gamepad.registerCombination('FAST_ATTACK', [GamepadButton.A, GamepadButton.B]);
gamepad.registerCombination('SPECIAL', [GamepadButton.A, GamepadButton.B, GamepadButton.START]);

console.log('Registered combinations:', gamepad.getCombinations());

// Set up event listeners
gamepad.on(GamepadEvent.CONNECTED, () => {
    console.log('✓ Gamepad connected!');
});

gamepad.on(GamepadEvent.DISCONNECTED, () => {
    console.log('✗ Gamepad disconnected!');
});

gamepad.on(GamepadEvent.DOWN, (button: GamepadButton) => {
    console.log(`Button DOWN: ${button}`);
});

gamepad.on(GamepadEvent.UP, (button: GamepadButton) => {
    console.log(`Button UP: ${button}`);
});

// Listen for combination events
gamepad.on(GamepadEvent.COMBO_DOWN, (comboName: string) => {
    console.log(`🎯 COMBO ACTIVATED: ${comboName}`);
});

gamepad.on(GamepadEvent.COMBO_UP, (comboName: string) => {
    console.log(`🎯 COMBO DEACTIVATED: ${comboName}`);
});

// Listen for stick movement events
gamepad.on(GamepadEvent.MOVE, (stickName: GamepadButton, position: StickValue) => {
    console.log(`Stick MOVE: ${stickName} x=${position.x} y=${position.y}`);
});

// Start the gamepad
gamepad.start();

// Keep the process alive
console.log('Press Ctrl+C to exit...');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    gamepad.stop();
    process.exit(0);
});
