import "server-only";

import { backendRequest } from "@/services/backend-client";

export type EmailReminder = {
  enabled: boolean;
  reminderTime: string;
  timeZone: string;
};

export type EmailReminderResponse = {
  ok: true;
  reminder: EmailReminder;
};

export const getEmailReminder = (userId: string) =>
  backendRequest<EmailReminderResponse>("/settings/email-reminder", { userId });

export const updateEmailReminder = (
  userId: string,
  input: Pick<EmailReminder, "enabled" | "reminderTime">
) =>
  backendRequest<EmailReminderResponse>("/settings/email-reminder", {
    method: "PATCH",
    userId,
    body: input,
  });
