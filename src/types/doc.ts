export type CreateDocActionState =
  | { success: true; code: string; expiresAt: number }
  | { success?: false; error: string }
  | { success?: false; error?: undefined };

export type GetDocActionState =
  | { success: true; name: string; url: string }
  | { success?: false; error: string }
  | { success?: false; error?: undefined };
