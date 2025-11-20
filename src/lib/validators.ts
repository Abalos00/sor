import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
  termsAcceptedVersion: z
    .string()
    .min(1, "Debes aceptar los terminos de servicio para continuar"),
});

const wallpaperSchema = z
  .object({
    url: z
      .string()
      .trim()
      .max(2048, "La URL es demasiado larga")
      .optional()
      .transform((value) => (value && value.length ? value : null))
      .refine(
        (value) => value === null || /^https?:\/\//i.test(value ?? ""),
        "Ingresa una URL valida que comience con http o https",
      ),
    locked: z.boolean().optional(),
  })
  .optional()
  .transform((value) =>
    value
      ? {
          url: value.url ?? null,
          locked: value.locked ?? false,
        }
      : undefined,
  );

export const profileSchema = z.object({
  name: z.string().min(3).max(50),
  industry: z.enum(["Escolar", "Empresa", "Laboratorio", "Otro"]),
  os: z.enum(["windows", "macos", "linux"]),
  toolIds: z.array(z.string()).min(1, "Selecciona al menos una herramienta"),
  optionsByTool: z.record(z.string(), z.any()).optional(),
  wallpaper: wallpaperSchema,
});

export const onboardingProfileSchema = profileSchema.extend({
  os: z.literal("windows"),
});

export const jobSchema = z.object({
  profileId: z.string().min(1, "Selecciona un perfil"),
  deviceId: z
    .string()
    .optional()
    .transform((value) => (value && value.trim() !== "" ? value.trim() : undefined)),
  deviceName: z
    .string()
    .min(3, "El nombre del equipo debe tener 3 caracteres como minimo")
    .max(50)
    .optional()
    .transform((value) => (value && value.trim() !== "" ? value.trim() : undefined)),
});

export const jobReportSchema = z.object({
  status: z.enum(["encola", "running", "failed", "succeeded"]),
  tasks: z
    .array(
      z.object({
        id: z.string(),
        type: z.string().optional(),
        command: z.string().optional(),
        status: z.string().optional(),
        startedAt: z.string().optional(),
        finishedAt: z.string().optional(),
        logsUrl: z.string().optional(),
      }),
    )
    .optional(),
});

export const deviceSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50)
    .transform((value) => value.trim()),
  os: z.enum(["windows", "macos", "linux"], {
    message: "Selecciona un sistema operativo valido",
  }),
});
