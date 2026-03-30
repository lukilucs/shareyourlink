export type CreateLinkActionState =
  | { success: true; code: string; expiresAt: number }
  | { success?: false; error: string }
  | { success?: false; error?: undefined };

export type GetLinkActionState =
  | { success: true; link: string }
  | { success?: false; error: string }
  | { success?: false; error?: undefined };
