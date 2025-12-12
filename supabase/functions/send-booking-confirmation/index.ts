import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  patientName: string;
  patientEmail: string;
  hospitalName: string;
  doctorName?: string;
  surgeryName?: string;
  bookingType: string;
  scheduledDate: string;
  scheduledTime: string;
  bookingId: string;
}

serve(async (req: Request): Promise<Response> => {
  console.log("Received request to send booking confirmation");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      patientName,
      patientEmail,
      hospitalName,
      doctorName,
      surgeryName,
      bookingType,
      scheduledDate,
      scheduledTime,
      bookingId,
    }: BookingConfirmationRequest = await req.json();

    console.log(`Sending confirmation to ${patientEmail} for booking ${bookingId}`);

    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const bookingTypeLabel = {
      consultation: 'Consultation',
      surgery: 'Surgery',
      visit: 'Hospital Visit'
    }[bookingType] || bookingType;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background: linear-gradient(135deg, #1E88E5 0%, #26A69A 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Surgery Hub</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your Booking is Confirmed!</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <p style="font-size: 18px; color: #333; margin: 0 0 20px;">Hello <strong>${patientName}</strong>,</p>
                <p style="font-size: 16px; color: #666; line-height: 1.6; margin: 0 0 30px;">
                  Your ${bookingTypeLabel.toLowerCase()} has been successfully booked. Please find the details below:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
                  <tr>
                    <td style="padding: 25px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Booking Type</span><br>
                            <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${bookingTypeLabel}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Hospital</span><br>
                            <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${hospitalName}</span>
                          </td>
                        </tr>
                        ${doctorName ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Doctor</span><br>
                            <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${doctorName}</span>
                          </td>
                        </tr>` : ''}
                        ${surgeryName ? `
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Surgery</span><br>
                            <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${surgeryName}</span>
                          </td>
                        </tr>` : ''}
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 14px;">Date</span><br>
                            <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${formattedDate}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <span style="color: #64748b; font-size: 14px;">Time</span><br>
                            <span style="color: #1e293b; font-size: 16px; font-weight: 600;">${scheduledTime}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <p style="font-size: 14px; color: #64748b; margin: 30px 0 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <strong>Important:</strong> Please arrive 15 minutes before your scheduled time. Bring any relevant medical records.
                </p>
                <p style="font-size: 14px; color: #666; margin: 30px 0 0;">
                  Booking Reference: <strong style="color: #1E88E5;">${bookingId.slice(0, 8).toUpperCase()}</strong>
                </p>
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
        subject: `Booking Confirmed - ${bookingTypeLabel} at ${hospitalName}`,
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
    console.error("Error in send-booking-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
