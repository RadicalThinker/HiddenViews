import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Section,
  Text,
  Container,
  Body,
  Hr,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your HiddenViews verification code is {otp}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Inter, Arial, sans-serif' }}>
        <Container style={{ 
          margin: '0 auto', 
          padding: '20px 0 48px',
          maxWidth: '580px' 
        }}>
          <Section style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e6ebf1',
            padding: '32px',
            textAlign: 'center' as const
          }}>
            <Heading style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 24px',
              lineHeight: '1.3'
            }}>
              Welcome to HiddenViews! 🎉
            </Heading>
            
            <Text style={{
              fontSize: '16px',
              color: '#4a5568',
              margin: '0 0 24px',
              lineHeight: '1.5'
            }}>
              Hi <strong>{username}</strong>, you're almost ready to start your anonymous journey!
            </Text>

            <Text style={{
              fontSize: '16px',
              color: '#4a5568',
              margin: '0 0 32px',
              lineHeight: '1.5'
            }}>
              To complete your account setup, please enter this verification code:
            </Text>

            <Section style={{
              backgroundColor: '#f7fafc',
              border: '2px dashed #cbd5e0',
              borderRadius: '8px',
              padding: '24px',
              margin: '0 0 32px'
            }}>
              <Text style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#2d3748',
                margin: '0',
                letterSpacing: '0.1em',
                fontFamily: 'Monaco, Consolas, monospace'
              }}>
                {otp}
              </Text>
            </Section>

            <Hr style={{
              border: 'none',
              borderTop: '1px solid #e2e8f0',
              margin: '32px 0'
            }} />

            <Text style={{
              fontSize: '14px',
              color: '#718096',
              margin: '0 0 16px',
              lineHeight: '1.4'
            }}>
              This code will expire in <strong>1 hour</strong> for security reasons.
            </Text>

            <Text style={{
              fontSize: '14px',
              color: '#718096',
              margin: '0',
              lineHeight: '1.4'
            }}>
              If you didn't create an account with HiddenViews, please disregard this email.
            </Text>
          </Section>

          <Text style={{
            fontSize: '12px',
            color: '#a0aec0',
            textAlign: 'center' as const,
            margin: '24px 0 0',
            lineHeight: '1.4'
          }}>
            © 2024 HiddenViews. Made with ❤️ for anonymous feedback.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
