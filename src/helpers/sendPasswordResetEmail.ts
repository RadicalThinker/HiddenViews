import { getEmailFrom } from '@/lib/siteConfig';
import { resend } from "@/lib/resend";
import PasswordResetEmail from "../../emails/PasswordResetEmail";
import { ApiResponse } from "@/types/ApiResponse";
import { logger } from "@/lib/logger";

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<ApiResponse> {
  try {
    logger.debug('Sending password reset email', { email, username });
    
    const response = await resend.emails.send({
      from: getEmailFrom(),
      to: email,
      subject: "HiddenViews | Password Reset",
      react: PasswordResetEmail({ username, resetToken }),
    });
    if (!('id' in response)) {
      throw new Error(response.error?.message || 'Resend rejected the email');
    }

    logger.debug('Password reset email sent', { email });

    return {
      success: true,
      message: "Password reset email sent successfully.",
    };
  } catch (emailError) {
    logger.error("Error sending password reset email", emailError, { email, username });
    
    return {
      success: false,
      message: "An error occurred while sending the password reset email.",
    };
  }
}