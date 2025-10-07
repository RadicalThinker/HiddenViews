import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import { logger } from "@/lib/logger";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    logger.debug('Sending verification email', { email, username });
    
    const response = await resend.emails.send({
      from: "HiddenViews <verify@hiddenreviews.yashcore.app>",
      to: email,
      subject: "HiddenViews | Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    logger.debug('Verification email sent', { email });

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (emailError) {
    logger.error("Error sending verification email", emailError, { email, username });
    return {
      success: false,
      message: "An error occurred while sending the verification email.",
    };
  }
}
