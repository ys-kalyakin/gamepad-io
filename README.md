# gamepad-io

[![npm version](https://img.shields.io/npm/v/gamepad-io.svg)](https://www.npmjs.com/package/gamepad-io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

Node.js library for gamepad support using `node-hid`. Provides event-driven API for button presses, stick movements, and key combinations.

## Installation

```bash
npm install gamepad-io
```

**Important:** This library requires native HID access. On Linux, you may need to configure udev rules. On macOS and Windows, additional setup might be required for non-standard gamepads.

## Quick Start

```typescript
import { Gamepad, GamepadEvent, GamepadButton } from 'gamepad-io';
import { config } from 'gamepad-io/src/gamepads/8bitdopro2.json';

// Create gamepad instance
const gamepad = new Gamepad(config);

// Listen for button events
gamepad.on(GamepadEvent.DOWN, (buttonName) => {
    console.log(`Button ${buttonName} pressed`);
});

gamepad.on(GamepadEvent.UP, (buttonName) => {
    console.log(`Button ${buttonName} released`);
});

// Start listening
gamepad.start();
```

## Usage Examples

### Tracking Button States

```typescript
import { Gamepad, GamepadEvent, GamepadButton } from 'gamepad-io';
import config from './path-to-your-config.json';

const gamepad = new Gamepad(config);

// Check if a button is currently pressed
if (gamepad.isPressed(GamepadButton.A)) {
    console.log('A button is pressed');
}

// Handle specific button events
gamepad.on(GamepadEvent.DOWN, (buttonName) => {
    switch (buttonName) {
        case GamepadButton.A:
            console.log('Jump!');
            break;
        case GamepadButton.B:
            console.log('Attack!');
            break;
    }
});

gamepad.start();
```

### Working with Sticks (Joysticks)

```typescript
import { Gamepad, GamepadEvent } from 'gamepad-io';
import config from './path-to-your-config.json';

const gamepad = new Gamepad(config);

// Listen for stick movements
gamepad.on(GamepadEvent.MOVE, (stickName, position) => {
    console.log(`Stick ${stickName} moved: x=${position.x}, y=${position.y}`);

    // Example: dead zone handling
    const deadZone = 0.1;
    if (Math.abs(position.x) > deadZone || Math.abs(position.y) > deadZone) {
        console.log(`Active movement detected`);
    }
});

gamepad.start();
```

### Key Combinations

```typescript
import { Gamepad, GamepadEvent, GamepadButton } from 'gamepad-io';
import config from './path-to-your-config.json';

const gamepad = new Gamepad(config);

// Register combination
gamepad.registerCombination('SPECIAL_ATTACK', [GamepadButton.A, GamepadButton.B, GamepadButton.X]);

// Listen for combination events
gamepad.on(GamepadEvent.COMBO_DOWN, (comboName) => {
    console.log(`${comboName} activated!`);
});

gamepad.on(GamepadEvent.COMBO_UP, (comboName) => {
    console.log(`${comboName} deactivated`);
});

// Check combination state
if (gamepad.isCombinationPressed('SPECIAL_ATTACK')) {
    console.log('Special attack is ready!');
}

gamepad.start();
```

### Debug Mode

The library includes a debug utility that logs all gamepad events:

```typescript
import { debug } from 'gamepad-io/debug';
import config from './path-to-your-config.json';

// Start debug mode
debug(config);
```

Or via npm script:

```bash
npm run debug
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix  # Auto-fix lint issues
```

### Watch Mode (Development)

```bash
npm run dev
```

## License

MIT © 2026 ys.kalyakin
