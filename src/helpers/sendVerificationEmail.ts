import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    console.log('Sending verification email:', { email, username, verifyCode });
    
    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "HiddenViews | Verification Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    console.log("Resend API Response:", response);

    if (response.error) {
      console.error("Resend API Error:", response.error);
      return {
        success: false,
        message: `Failed to send email: ${response.error.message}`,
      };
    }

    return {
      success: true,
      message: "Verification email sent successfully.",
    };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return {
      success: false,
      message: "An error occurred while sending the verification email.",
    };
  }
}
