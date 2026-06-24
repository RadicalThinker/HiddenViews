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
  Button,
} from '@react-email/components';

interface PasswordResetEmailProps {
  username: string;
  resetToken: string;
}

export default function PasswordResetEmail({ username, resetToken }: PasswordResetEmailProps) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://hiddenreviews.yashcore.app';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

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
      <Preview>Reset your HiddenViews password</Preview>
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
              🔐 Password Reset Request
            </Heading>
            
            <Text style={{
              fontSize: '16px',
              color: '#4a5568',
              margin: '0 0 24px',
              lineHeight: '1.5'
            }}>
              Hi <strong>{username}</strong>, we received a request to reset your password for your HiddenViews account.
            </Text>

            <Text style={{
              fontSize: '16px',
              color: '#4a5568',
              margin: '0 0 32px',
              lineHeight: '1.5'
            }}>
              Click the button below to reset your password. This link will expire in 1 hour for security reasons.
            </Text>

            <Section style={{
              margin: '32px 0',
              textAlign: 'center' as const
            }}>
              <Button
                href={resetUrl}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  display: 'inline-block',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reset Password
              </Button>
            </Section>

            <Text style={{
              fontSize: '14px',
              color: '#718096',
              margin: '32px 0 16px',
              lineHeight: '1.4'
            }}>
              If the button doesn't work, you can copy and paste this link into your browser:
            </Text>

            <Text style={{
              fontSize: '12px',
              color: '#4a5568',
              backgroundColor: '#f7fafc',
              padding: '12px',
              borderRadius: '4px',
              wordBreak: 'break-all' as const,
              fontFamily: 'Monaco, Consolas, monospace'
            }}>
              {resetUrl}
            </Text>

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
              If you didn't request a password reset, please ignore this email. Your password will not be changed.
            </Text>

            <Text style={{
              fontSize: '14px',
              color: '#e53e3e',
              margin: '0',
              lineHeight: '1.4',
              fontWeight: '600'
            }}>
              For security reasons, this link will expire in 1 hour.
            </Text>
          </Section>

          <Text style={{
            fontSize: '12px',
            color: '#a0aec0',
            textAlign: 'center' as const,
            margin: '24px 0 0',
            lineHeight: '1.4'
          }}>
            © 2024 HiddenViews. Secure anonymous feedback platform.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}