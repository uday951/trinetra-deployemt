declare module 'node-openvpn' {
  export class OpenVPNManagement {
    constructor(options: {
      host: string;
      port: number;
      timeout?: number;
    });

    connect(): Promise<void>;
    disconnect(): Promise<void>;
    status(): Promise<any>;
    sendCommand(command: string): Promise<string>;
  }
} 