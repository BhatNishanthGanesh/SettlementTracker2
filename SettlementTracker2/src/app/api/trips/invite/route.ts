// app/api/trips/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/db';
import nodemailer from 'nodemailer';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId, tripName, members, invitedBy, shareableLink } = body;

    if (!tripId || !members || members.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { createdBy: true },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const joinLink = shareableLink || `${appUrl}/join/${trip.inviteCode}`;

    // Send emails using nodemailer
    const emailPromises = members
      .filter((member: any) => member.email && member.email !== session.user?.email)
      .map(async (member: any) => {
        try {
          const emailContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
                  .content { padding: 30px; }
                  .trip-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                  .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
                  .button:hover { background: #5a67d8; }
                  .footer { text-align: center; margin-top: 30px; font-size: 13px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🎉 You're Invited!</h1>
                    <p style="font-size: 18px; margin-top: 10px; opacity: 0.95;">Join "${tripName}"</p>
                  </div>
                  <div class="content">
                    <p style="font-size: 16px;">Hello ${member.name || 'Friend'},</p>
                    <p><strong>${invitedBy}</strong> has invited you to join the trip <strong>"${tripName}"</strong>.</p>
                    
                    <div class="trip-details">
                      <p style="margin: 5px 0;"><strong>Trip:</strong> ${tripName}</p>
                      <p style="margin: 5px 0;"><strong>Organized by:</strong> ${invitedBy}</p>
                      ${trip.destination ? `<p style="margin: 5px 0;"><strong>Destination:</strong> ${trip.destination}</p>` : ''}
                    </div>

                    <p style="font-size: 16px;">Click the button below to join the trip and start planning together!</p>
                    
                    <div style="text-align: center; color:white;">
                      <a href="${joinLink}" class="button">Join Trip Now</a>
                    </div>

                    <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0; font-size: 14px; color: #4a5568;">
                        💡 <strong>Already have an account?</strong> Sign in to instantly join.
                        <br>
                        🆕 <strong>New to Trip Planner?</strong> Create a free account in minutes.
                      </p>
                    </div>
                  </div>
                  <div class="footer">
                    <p style="margin: 0;">This email was sent by Trip Planner</p>
                    <p style="margin: 5px 0; font-size: 12px;">If you didn't expect this invitation, please ignore this email.</p>
                  </div>
                </div>
              </body>
            </html>
          `;

          // Send email using nodemailer
          const info = await transporter.sendMail({
            from: `"Settlement Tracker" <${process.env.SMTP_FROM_EMAIL || 'noreply@settlementtracker.com'}>`,
            to: member.email,
            subject: `You're invited to join "${tripName}"! 🎉`,
            html: emailContent,
          });

          console.log(`Email sent to ${member.email}:`, info.messageId);
          return { success: true, email: member.email, messageId: info.messageId };
        } catch (error) {
          console.error(`Error sending to ${member.email}:`, error);
          return { success: false, email: member.email, error: String(error) };
        }
      });

    const results = await Promise.all(emailPromises);
    const sentCount = results.filter(r => r.success).length;
    const failedEmails = results.filter(r => !r.success).map(r => r.email);

    return NextResponse.json({
      success: true,
      message: `Invitations sent to ${sentCount} members`,
      sentCount,
      total: members.filter((m: any) => m.email && m.email !== session.user?.email).length,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    );
  }
}