export class DeviceControl {
  async lockDevice(pin: string): Promise<void> {
    // Mock device locking
    console.log('Device locked with PIN:', pin);
  }

  async wipeDevice(confirmationCode: string): Promise<void> {
    // Mock device wiping
    console.log('Device wiped with confirmation code:', confirmationCode);
  }

  async playSound(): Promise<void> {
    // Mock sound playing
    console.log('Playing sound...');
  }
} 