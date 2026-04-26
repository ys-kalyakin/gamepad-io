import eightBitDoPro2Config from './8bitdopro2.json';

/**
 * Predefined gamepad configurations.
 *
 * These configurations map specific gamepad models to their button and stick mappings.
 */
export const gamepadConfigs = {
    /**
     * Configuration for 8BitDo Pro 2 controller.
     *
     * Vendor ID: 0x2dc8 (11720)
     * Product ID: 0x6006 (24582)
     */
    eightBitDoPro2: eightBitDoPro2Config,
};

export type GamepadConfigName = keyof typeof gamepadConfigs;
