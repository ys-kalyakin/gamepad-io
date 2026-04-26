import { IConfig, GamepadButton } from '../IConfig';
import eightBitDoPro2Config from './8bitdopro2.json';
import logitechF310Config from './logitechf310.json';
import logitechF710Config from './logitechf710.json';

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
    logitechF310: IConfig;
    logitechF710: IConfig;
} = {
    /**
     * Configuration for 8BitDo Pro 2 controller.
     *
     * Vendor ID: 0x2dc8 (11720)
     * Product ID: 0x6006 (24582)
     */
    eightBitDoPro2: convertConfig(eightBitDoPro2Config),
    /**
     * Configuration for Logitech F310 controller.
     *
     * Vendor ID: 0x046d (1133)
     * Product ID: 0xc216 (49686)
     */
    logitechF310: convertConfig(logitechF310Config),
    /**
     * Configuration for Logitech F710 controller.
     *
     * Vendor ID: 0x046d (1133)
     * Product ID: 0xc219 (49689)
     */
    logitechF710: convertConfig(logitechF710Config),
};

export type GamepadConfigName = keyof typeof gamepadConfigs;
