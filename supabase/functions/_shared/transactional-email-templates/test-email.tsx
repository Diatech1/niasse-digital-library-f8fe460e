import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Faydabook'

const TestEmail = () => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Test email from {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Email delivery confirmed</Heading>
        <Text style={text}>
          This is a test message from {SITE_NAME} to confirm that the email
          infrastructure on admin.faydabook.com is working correctly.
        </Text>
        <Text style={footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TestEmail,
  subject: 'Faydabook email test',
  displayName: 'Test email',
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#064e3b', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 20px' }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '24px 0 0' }
