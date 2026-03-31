export type CreateSlideActionState =
  | { success: true; code: string; expiresAt: number }
  | { success?: false; error: string }
  | { success?: false; error?: undefined };

export type GetSlideActionState =
  | {
      success: true;
      name: string;
      url: string;
      fileType: "ppt" | "pptx";
    }
  | { success?: false; error: string }
  | { success?: false; error?: undefined };
