import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

export async function POST(request: Request) {
  // Only allow in development
  // if (process.env.NODE_ENV !== 'development') {
  //   return NextResponse.json(
  //     { success: false, message: 'Email testing only available in development' },
  //     { status: 403 }
  //   );
  // }

  try {
    const { to, type } = await request.json();

    if (!to) {
      return NextResponse.json(
        { success: false, message: 'Email address (to) is required' },
        { status: 400 }
      );
    }

    console.log('\n🧪 EMAIL TEST ENDPOINT TRIGGERED');
    console.log('Testing email type:', type);
    console.log('Target email:', to);
    console.log('Resend API Key present:', !!process.env.RESEND_API_KEY);

    let emailResponse;

    switch (type) {
      case 'verification':
        const { sendVerificationEmail } = await import('@/helpers/sendVerificationEmail');
        emailResponse = await sendVerificationEmail(to, 'TestUser', '123456');
        break;

      case 'contact':
        emailResponse = await resend.emails.send({
          from: 'HiddenViews Contact <onboarding@resend.dev>',
          to: [to],
          subject: 'Test Contact Form Message',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #5227FF;">🧪 Test Contact Form Email</h2>
              <p>This is a test email from the development environment.</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
          `
        });
        emailResponse = { success: true, message: 'Test contact email sent' };
        break;

      case 'query-reply':
        emailResponse = await resend.emails.send({
          from: 'HiddenViews <onboarding@resend.dev>',
          to: [to],
          subject: 'Test Query Reply Notification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">🧪 Test Query Reply Email</h2>
              <p>This is a test query reply notification from the development environment.</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
          `
        });
        emailResponse = { success: true, message: 'Test query reply email sent' };
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid email type. Use: verification, contact, or query-reply' },
          { status: 400 }
        );
    }

    console.log('✅ Email test result:', emailResponse);
    console.log('================================\n');

    return NextResponse.json({
      success: emailResponse.success,
      message: emailResponse.message,
      timestamp: new Date().toISOString(),
      type: type,
      to: to
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return NextResponse.json(
      { success: false, message: 'Email test failed', error: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { message: 'Email testing only available in development' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Email Test Endpoint',
    usage: {
      method: 'POST',
      body: {
        to: 'test@example.com',
        type: 'verification | contact | query-reply'
      }
    },
    examples: [
      {
        description: 'Test verification email',
        curl: 'curl -X POST /api/test-email -H "Content-Type: application/json" -d \'{"to":"your-email@example.com","type":"verification"}\''
      },
      {
        description: 'Test contact form email',
        curl: 'curl -X POST /api/test-email -H "Content-Type: application/json" -d \'{"to":"your-email@example.com","type":"contact"}\''
      },
      {
        description: 'Test query reply email',
        curl: 'curl -X POST /api/test-email -H "Content-Type: application/json" -d \'{"to":"your-email@example.com","type":"query-reply"}\''
      }
    ],
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      RESEND_API_KEY_PRESENT: !!process.env.RESEND_API_KEY,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set'
    }
  });
}