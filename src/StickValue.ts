/**
 * Represents a joystick/stick position value.
 *
 * Values typically range from -1.0 to 1.0, where (0, 0) represents the neutral/center position.
 * X axis: -1.0 = left, 1.0 = right
 * Y axis: -1.0 = up, 1.0 = down
 */
export interface StickValue {
    /** X-axis position (-1.0 to 1.0) */
    x: number;
    /** Y-axis position (-1.0 to 1.0) */
    y: number;
}
