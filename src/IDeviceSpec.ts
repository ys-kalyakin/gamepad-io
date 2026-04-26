/**
 * Device specification for identifying a gamepad device.
 *
 * Used to uniquely identify a specific gamepad model or instance by its hardware identifiers.
 */
export interface IDeviceSpec {
    /**
     * USB vendor ID.
     *
     * The vendor identifier assigned by USB-IF to the device manufacturer.
     */
    vendorID: number;

    /**
     * USB product ID.
     *
     * The product identifier assigned by the vendor to this specific device model.
     */
    productID: number;

    /**
     * Device serial number.
     *
     * Optional serial number for distinguishing between multiple instances of the same device model.
     */
    serialNumber?: string;
}
