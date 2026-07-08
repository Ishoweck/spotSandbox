import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const key = process.env.RESEND_API_KEY;
    console.log("[Ambassador] key present:", !!key, "| starts with:", key?.slice(0, 6));
    const resend = new Resend(key);
    const {
      role, name, email, phone, location, social, why,
      homeAddress, idType, idNumber, idImage,
      nextOfKinName, nextOfKinAddress, nextOfKinPhone,
      agreedToTerms,
    } = await req.json();

    const roleDisplay = role === 'student' ? 'Student Ambassador' : role === 'state' ? 'State Ambassador' : role;
    const idTypeLabels: Record<string, string> = {
      nin: 'NIN',
      drivers_license: "Driver's License",
      international_passport: 'International Passport',
      student_id: 'Student ID Card',
    };
    const idTypeDisplay = idTypeLabels[idType] || idType || 'Not provided';

    await resend.emails.send({
      from: "Vendorspot Ambassadors <support@vendorspotng.com>",
      to: "support@vendorspotng.com",
      replyTo: email,
      subject: `[Ambassador Application] ${roleDisplay} — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#d7004b;padding:24px 32px;border-radius:12px 12px 0 0">
            <h2 style="color:#ffffff;margin:0;font-size:20px">New Ambassador Application</h2>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px">${roleDisplay}</p>
          </div>

          <div style="border:1px solid #e5e5e5;border-top:none;border-radius:0 0 12px 12px;overflow:hidden">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr>
                <td style="padding:12px 20px;font-weight:600;color:#555;width:140px;background:#fafafa;border-bottom:1px solid #f0f0f0">Name</td>
                <td style="padding:12px 20px;color:#1a1a1a;border-bottom:1px solid #f0f0f0">${name}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-weight:600;color:#555;background:#fafafa;border-bottom:1px solid #f0f0f0">Email</td>
                <td style="padding:12px 20px;border-bottom:1px solid #f0f0f0"><a href="mailto:${email}" style="color:#d7004b">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-weight:600;color:#555;background:#fafafa;border-bottom:1px solid #f0f0f0">Phone</td>
                <td style="padding:12px 20px;color:#1a1a1a;border-bottom:1px solid #f0f0f0">${phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-weight:600;color:#555;background:#fafafa;border-bottom:1px solid #f0f0f0">Location</td>
                <td style="padding:12px 20px;color:#1a1a1a;border-bottom:1px solid #f0f0f0">${location || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-weight:600;color:#555;background:#fafafa;border-bottom:1px solid #f0f0f0">Social Media</td>
                <td style="padding:12px 20px;color:#1a1a1a;border-bottom:1px solid #f0f0f0">${social ? `<a href="${social.startsWith("http") ? social : `https://${social}`}" style="color:#d7004b">${social}</a>` : "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-weight:600;color:#555;background:#fafafa;border-bottom:1px solid #f0f0f0">Home Address</td>
                <td style="padding:12px 20px;color:#1a1a1a;border-bottom:1px solid #f0f0f0">${homeAddress || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-weight:600;color:#555;background:#fafafa;border-bottom:1px solid #f0f0f0">Means of ID</td>
                <td style="padding:12px 20px;color:#1a1a1a;border-bottom:1px solid #f0f0f0">${idTypeDisplay} — ${idNumber || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-weight:600;color:#555;background:#fafafa;border-bottom:1px solid #f0f0f0">Next of Kin</td>
                <td style="padding:12px 20px;color:#1a1a1a;border-bottom:1px solid #f0f0f0">${nextOfKinName || "Not provided"}${nextOfKinPhone ? ` · ${nextOfKinPhone}` : ""}${nextOfKinAddress ? `<br/><span style="color:#777">${nextOfKinAddress}</span>` : ""}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-weight:600;color:#555;background:#fafafa">Terms Accepted</td>
                <td style="padding:12px 20px;color:#1a1a1a">${agreedToTerms ? "Yes" : "No"}</td>
              </tr>
            </table>

            <div style="padding:20px;border-top:1px solid #f0f0f0">
              <p style="margin:0 0 8px;font-weight:600;color:#555;font-size:13px;text-transform:uppercase;letter-spacing:0.05em">Why they want to join</p>
              <p style="margin:0;color:#1a1a1a;line-height:1.6;white-space:pre-wrap;font-size:14px">${why}</p>
            </div>
          </div>

          <p style="color:#aaa;font-size:12px;margin-top:20px;text-align:center">
            Sent via vendorspotng.com · Ambassador Program
          </p>
        </div>
      `,
    });

    // Save submission to backend — this record is what admin actually reviews/approves,
    // so a failure here must be surfaced (the email alone isn't enough to act on).
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vapp-be.onrender.com/api';
      const backendRes = await fetch(`${backendUrl}/ambassadors/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, role, location, social, why,
          homeAddress, idType, idNumber, idImage,
          nextOfKinName, nextOfKinAddress, nextOfKinPhone,
          agreedToTerms,
        }),
      });
      if (!backendRes.ok) {
        const errJson = await backendRes.json().catch(() => null);
        throw new Error(errJson?.message || 'Backend save failed');
      }
    } catch (backendErr) {
      console.error('[Ambassador] Backend save failed:', backendErr);
      return NextResponse.json({ ok: false, error: 'Could not save your application. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Ambassador]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
