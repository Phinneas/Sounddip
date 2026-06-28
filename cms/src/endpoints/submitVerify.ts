import { Endpoint } from 'payload'

// Simple token generator
function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

// POST /api/submit-verify — generate and store verification token, optionally send email
export const submitVerifyEndpoint: Endpoint = {
  path: '/submit-verify',
  method: 'post',
  handler: async (req) => {
    // In Payload 3, req.body is not auto-parsed — must use req.json()
    const body = await req.json()
    const { email, name, slug } = body as {
      email?: string
      name?: string
      slug?: string
    }

    if (!email || !name || !slug) {
      return Response.json({ error: 'Missing required fields: email, name, slug' }, { status: 400 })
    }

    // Generate verification token
    const token = generateToken()
    const verifyUrl = `https://sounddip.com/verify?token=${token}&slug=${slug}`

    try {
      // Find the listing and append token to sourcingNotes
      const listings = await req.payload.find({
        collection: 'listings',
        where: { slug: { equals: slug } },
        limit: 1,
      })

      if (!listings.docs[0]) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
      }

      const listing = listings.docs[0]
      const existingNotes = listing.sourcingNotes || ''
      const updatedNotes = existingNotes.replace(
        /Pending verification/,
        `Pending verification | verify-token: ${token} | verify-email: ${email}`,
      )

      await req.payload.update({
        collection: 'listings',
        id: listing.id,
        data: {
          sourcingNotes: updatedNotes,
        },
      })

      // Send verification email if Resend API key is configured
      // On day 1 without RESEND_API_KEY, admin verifies manually from dashboard
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Sound Dip <hello@sounddip.com>',
              to: [email],
              subject: 'Verify your listing on Sound Dip',
              html: `
                <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; color: #221b13;">
                  <h1 style="font-size: 24px; font-weight: 400; margin-bottom: 24px;">Verify your listing on Sound Dip</h1>
                  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Hi ${name},<br/><br/>
                    We received your submission to Sound Dip. Click the link below to confirm your email address:
                  </p>
                  <a href="${verifyUrl}" style="display: inline-block; background: #221b13; color: #f4ede0; text-decoration: none; padding: 14px 28px; border-radius: 100px; font-size: 15px; margin-bottom: 24px;">
                    Confirm my email
                  </a>
                  <p style="font-size: 14px; color: #75685a; line-height: 1.5;">
                    If you didn't submit this listing, you can ignore this email.
                  </p>
                </div>
              `,
            }),
          })
        } catch (emailErr) {
          console.error('Email sending error:', emailErr)
        }
      } else {
        console.log(`[submit-verify] No RESEND_API_KEY. Verify URL: ${verifyUrl}`)
      }

      return Response.json({
        success: true,
        message: 'Verification token stored. Check your email to confirm.',
        ...(process.env.NODE_ENV !== 'production' ? { token, verifyUrl } : {}),
      })
    } catch (err: any) {
      console.error('submit-verify POST error:', err)
      return Response.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
  },
}

// PUT /api/submit-verify — verify token and update listing status
export const submitVerifyPutEndpoint: Endpoint = {
  path: '/submit-verify',
  method: 'put',
  handler: async (req) => {
    const body = await req.json()
    const { token, slug } = body as {
      token?: string
      slug?: string
    }

    if (!token || !slug) {
      return Response.json({ error: 'Missing required fields: token, slug' }, { status: 400 })
    }

    try {
      const listings = await req.payload.find({
        collection: 'listings',
        where: { slug: { equals: slug } },
        limit: 1,
      })

      if (!listings.docs[0]) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
      }

      const listing = listings.docs[0]
      const notes = listing.sourcingNotes || ''

      if (!notes.includes(`verify-token: ${token}`)) {
        return Response.json({ error: 'Invalid or expired verification token' }, { status: 400 })
      }

      if (notes.includes('Email verified')) {
        return Response.json({ error: 'This listing has already been verified' }, { status: 400 })
      }

      // Mark as email-verified — still needs admin approval
      const updatedNotes = notes.replace(
        /Pending verification/,
        'Email verified · Pending admin review',
      )

      await req.payload.update({
        collection: 'listings',
        id: listing.id,
        data: {
          sourcingNotes: updatedNotes,
          _status: 'draft',
        },
      })

      return Response.json({
        success: true,
        message: 'Email verified. Your listing is in the review queue.',
      })
    } catch (err: any) {
      console.error('submit-verify PUT error:', err)
      return Response.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
  },
}
