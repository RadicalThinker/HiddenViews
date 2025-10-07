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
    
    // In development, log email details for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 EMAIL TEST - Verification Code');
      console.log('From: Acme <onboarding@resend.dev>');
      console.log('To:', email);
      console.log('Subject: HiddenViews | Verification Code');
      console.log('Username:', username);
      console.log('Verification Code:', verifyCode);
      console.log('Resend API Key present:', !!process.env.RESEND_API_KEY);
      console.log('================================\n');
    }
    
    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
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
    
    // In development, show detailed error info
    if (process.env.NODE_ENV === 'development') {
      console.error('🚫 VERIFICATION EMAIL SEND FAILED:');
      console.error('Error details:', JSON.stringify(emailError, null, 2));
      console.error('Resend API Key present:', !!process.env.RESEND_API_KEY);
      console.error('Target email:', email);
      console.error('Username:', username);
    }
    
    return {
      success: false,
      message: "An error occurred while sending the verification email.",
    };
  }
}
