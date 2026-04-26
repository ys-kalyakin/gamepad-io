import { IConfig, GamepadButton } from '../IConfig';
import eightBitDoPro2Config from './8bitdopro2.json';

/**
 * Convert raw JSON configuration to typed IConfig.
 * Ensures that string names are properly typed as GamepadButton enum values.
 */
function convertConfig(config: any): IConfig {
    return {
        ...config,
        sticks:
            config.sticks?.map((stick: any) => ({
                ...stick,
                name: stick.name as GamepadButton,
            })) || [],
        buttons:
            config.buttons?.map((button: any) => ({
                ...button,
                name: button.name as GamepadButton,
            })) || [],
    };
}

/**
 * Predefined gamepad configurations.
 *
 * These configurations map specific gamepad models to their button and stick mappings.
 */
export const gamepadConfigs: {
    eightBitDoPro2: IConfig;
} = {
    /**
     * Configuration for 8BitDo Pro 2 controller.
     *
     * Vendor ID: 0x2dc8 (11720)
     * Product ID: 0x6006 (24582)
     */
    eightBitDoPro2: convertConfig(eightBitDoPro2Config),
};

export type GamepadConfigName = keyof typeof gamepadConfigs;
