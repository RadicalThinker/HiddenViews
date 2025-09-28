import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import EventModel from '@/model/Event';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { queryReplySchema } from '@/schemas/querySchema';
import { Resend } from 'resend';

export async function POST(
  request: NextRequest,
  { params }: { params: { queryId: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { content } = await request.json();
    const { queryId } = params;

    // Validate the reply content
    const result = queryReplySchema.safeParse({ content });
    if (!result.success) {
      const replyErrors = result.error.format();
      return NextResponse.json(
        {
          success: false,
          message: replyErrors.content?._errors || 'Invalid reply content',
        },
        { status: 400 }
      );
    }

    const userId = _user._id;
    
    // Find the event that contains this query and is owned by the user
    const event = await EventModel.findOne({
      createdBy: userId,
      'queries._id': queryId
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Query not found or you do not have permission to reply' },
        { status: 404 }
      );
    }

    // Find the specific query
    const query = event.queries.id(queryId);
    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query not found' },
        { status: 404 }
      );
    }

    const senderEmail = query.senderEmail;

    // Add reply to the query
    query.reply = {
      content,
      createdAt: new Date(),
    };

    // Mark as resolved
    query.isResolved = true;

    // Stats will be automatically updated by the pre-save middleware
    await event.save();

    // Send email notification if sender provided email
    if (senderEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        // Get event creator info for email
        await event.populate('createdBy', 'username');
        const creatorUsername = (event.createdBy as any).username;
        
        await resend.emails.send({
          from: 'HiddenViews <noreply@hiddenviews.com>',
          to: [senderEmail],
          subject: `Your question about "${event.title}" has been answered!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Your Question Has Been Answered!</h2>
              
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3 style="margin-top: 0; color: #374151;">Your Question:</h3>
                <p style="color: #6b7280; font-style: italic;">"${query.content}"</p>
              </div>

              <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb;">
                <h3 style="margin-top: 0; color: #1e40af;">@${creatorUsername}'s Reply:</h3>
                <p style="color: #374151;">${content}</p>
              </div>

              <div style="margin: 24px 0; text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/e/${event.slug}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Event Page
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
                This is an automated message from HiddenViews. You received this because you asked a question and requested email notifications.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(
      { success: true, message: 'Reply sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error replying to query:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
