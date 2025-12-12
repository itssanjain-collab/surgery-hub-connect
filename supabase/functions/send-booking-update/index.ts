import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingUpdateRequest {
  patientName: string;
  patientEmail: string;
  hospitalName: string;
  bookingType: string;
  originalDate: string;
  originalTime: string;
  newDate?: string;
  newTime?: string;
  bookingId: string;
  updateType: 'cancelled' | 'rescheduled';
}

serve(async (req: Request): Promise<Response> => {
  console.log("Received request to send booking update notification");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      patientName,
      patientEmail,
      hospitalName,
      bookingType,
      originalDate,
      originalTime,
      newDate,
      newTime,
      bookingId,
      updateType,
    }: BookingUpdateRequest = await req.json();

    console.log(`Sending ${updateType} notification to ${patientEmail} for booking ${bookingId}`);

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const bookingTypeLabel = {
      consultation: 'Consultation',
      surgery: 'Surgery',
      visit: 'Hospital Visit'
    }[bookingType] || bookingType;

    const isCancelled = updateType === 'cancelled';
    const headerColor = isCancelled ? '#EF4444' : '#F59E0B';
    const headerText = isCancelled ? 'Booking Cancelled' : 'Booking Rescheduled';
    const subject = isCancelled 
      ? `Booking Cancelled - ${bookingTypeLabel} at ${hospitalName}`
      : `Booking Rescheduled - ${bookingTypeLabel} at ${hospitalName}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${headerText}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background: ${headerColor}; padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Surgery Hub</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">${headerText}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <p style="font-size: 18px; color: #333; margin: 0 0 20px;">Hello <strong>${patientName}</strong>,</p>
                ${isCancelled ? `
                <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 30px;">
                  Your ${bookingTypeLabel.toLowerCase()} at <strong>${hospitalName}</strong> has been cancelled as requested.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 12px; overflow: hidden; border-left: 4px solid #EF4444;">
                  <tr>
                    <td style="padding: 25px;">
                      <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">Original Appointment</p>
                      <p style="margin: 0; color: #1e293b; font-size: 16px;">
                        <strong>${formatDate(originalDate)}</strong> at <strong>${originalTime}</strong>
                      </p>
                    </td>
                  </tr>
                </table>
                ` : `
                <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 30px;">
                  Your ${bookingTypeLabel.toLowerCase()} at <strong>${hospitalName}</strong> has been rescheduled. Please see the updated details below:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
                  <tr>
                    <td style="padding: 25px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Previous Date & Time</span><br>
                            <span style="color: #94a3b8; font-size: 16px; text-decoration: line-through;">${formatDate(originalDate)} at ${originalTime}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <span style="color: #64748b; font-size: 14px;">New Date & Time</span><br>
                            <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${formatDate(newDate!)} at ${newTime}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <p style="font-size: 14px; color: #64748b; margin: 30px 0 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <strong>Reminder:</strong> Please arrive 15 minutes before your new scheduled time.
                </p>
                `}
                <p style="font-size: 14px; color: #666; margin: 30px 0 0;">
                  Booking Reference: <strong style="color: #1E88E5;">${bookingId.slice(0, 8).toUpperCase()}</strong>
                </p>
                ${isCancelled ? `
                <p style="font-size: 14px; color: #666; margin: 20px 0 0;">
                  If you'd like to book a new appointment, please visit our website.
                </p>
                ` : ''}
              </td>
            </tr>
            <tr>
              <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 14px; color: #64748b; margin: 0 0 10px;">Questions? Contact the hospital directly.</p>
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} Surgery Hub. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Surgery Hub <onboarding@resend.dev>",
        to: [patientEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-update function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
