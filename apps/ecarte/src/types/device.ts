export interface Device {
  id: string;
  deviceName: string;
  fingerprint: string;
  confirmed: boolean;
  createdAt: string;
}

export interface RegisterDeviceDto {
  deviceName: string;
  fingerprint: string;
}

export interface RegisterDeviceResponse {
  deviceId: string;
  message: string;
}

export interface ConfirmDeviceDto {
  fingerprint: string;
  otp: string;
}

export interface MessageResponse {
  message: string;
}