import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = contactSchema.parse(body);

    try {
      // In development, log email details for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 EMAIL TEST - Contact Form');
        console.log('From: HiddenViews Contact <onboarding@resend.dev>');
        console.log('To: voicesecret9@gmail.com');
        console.log('Subject:', `New Contact Form Message from ${name}`);
        console.log('Sender Name:', name);
        console.log('Sender Email:', email);
        console.log('Message:', message);
        console.log('Resend API Key present:', !!process.env.RESEND_API_KEY);
        console.log('================================\n');
      }
      
      const response = await resend.emails.send({
        from: 'HiddenViews Contact <onboarding@resend.dev>',
        to: ['voicesecret9@gmail.com'],
        subject: `New Contact Form Message from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #5227FF; border-bottom: 2px solid #5227FF; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              This email was sent from the HiddenViews contact form.
            </p>
          </div>
        `
      });

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully'
      });
    } catch (emailError) {
      console.error('Resend error:', emailError);
      
      // In development, show detailed error info
      if (process.env.NODE_ENV === 'development') {
        console.error('🚫 CONTACT EMAIL SEND FAILED:');
        console.error('Error details:', JSON.stringify(emailError, null, 2));
        console.error('Resend API Key present:', !!process.env.RESEND_API_KEY);
        console.error('Sender details:', { name, email, message: message.substring(0, 50) + '...' });
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}