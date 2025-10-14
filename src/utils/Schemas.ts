import { z } from "zod";

export const ipAddressSchema = z.string()
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP address format")
    .refine((ip) => {
      const parts = ip.split('.').map(Number);
      return parts.every(part => part >= 0 && part <= 255);
    }, "IP address octets must be 0-255");