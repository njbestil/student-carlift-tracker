import { z } from 'zod';

export const createVehicleLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
  recordedAt: z.string().datetime().optional(),
});

export type CreateVehicleLocationInput = z.infer<typeof createVehicleLocationSchema>;
