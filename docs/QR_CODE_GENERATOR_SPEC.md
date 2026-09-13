# QR Code Generator Specification

## Overview

A comprehensive QR code generator web application that supports multiple content types, customization options, and scanning capabilities. Similar to [qr.ioi.tw](https://qr.ioi.tw/zh/).

---

## 1. Core Features

### 1.1 QR Code Content Types

The application shall support the following content types:

#### 1.1.1 URL

- **Input**: Single text field for URL
- **Validation**: Valid URL format (http/https)
- **Output**: Direct navigation to URL when scanned

#### 1.1.2 Bank Transfer (TWQR - Taiwan QR Code Payment Standard)

- **Inputs**:
  - Bank code/ID (dropdown with major Taiwan banks)
  - Account number
  - Transfer amount (optional)
  - Message/memo (optional)
- **Output**: Compatible with Taiwan Pay, Jko Pay, and other payment apps
- **Note**: Display compatibility warning for supported payment apps

#### 1.1.3 Map Coordinates

- **Inputs**:
  - Latitude (decimal degrees)
  - Longitude (decimal degrees)
  - Zoom level (1-20)
- **Features**:
  - Interactive map picker
  - Search by address
- **Output**: Opens map application with coordinates

#### 1.1.4 vCard (Contact Card)

- **Inputs**:
  - First Name
  - Last Name
  - Company/Organization
  - Email
  - Mobile Phone
  - Phone
  - Fax
  - Address (Street, City, State, Postal Code, Country)
  - Website URL
  - Notes
- **Output**: Add contact to phone book

#### 1.1.5 Calendar Event

- **Inputs**:
  - Event Title
  - All-day toggle
  - Start Date & Time
  - End Date & Time
  - Location
  - Description
- **Output**: Add event to calendar app

#### 1.1.6 WiFi Connection

- **Inputs**:
  - Network SSID
  - Password
  - Encryption Type (WPA/WPA2, WEP, None)
- **Output**: Auto-connect to WiFi network

#### 1.1.7 Cryptocurrency Address

- **Supported Currencies**:
  - Bitcoin (BTC)
  - Bitcoin Cash (BCH)
  - Ethereum (ETH)
  - Litecoin (LTC)
  - Dash (DASH)
  - Monero (XMR)
  - Dogecoin (DOGE)
- **Inputs**:
  - Wallet Address
  - Amount (optional)
  - Label (optional)
  - Message (optional)
- **Output**: Opens crypto wallet app with pre-filled transaction

#### 1.1.8 SMS Message

- **Inputs**:
  - Phone Number
  - Message Content
- **Output**: Opens SMS app with pre-filled message

#### 1.1.9 Phone Call

- **Input**: Phone Number
- **Output**: Initiates phone call

#### 1.1.10 Plain Text

- **Input**: Any text content
- **Output**: Displays text (can be copied)

#### 1.1.11 Scan to Copy

- **Input**: Text to copy
- **Output**: Automatically copies to clipboard

---

## 2. QR Code Customization

### 2.1 Basic Settings

#### 2.1.1 QR Code Size

- **Range**: 100px - 1000px
- **Default**: 300px
- **Control**: Slider with numerical input

#### 2.1.2 Colors

- **QR Code Color**: Color picker with hex input
- **Background Color**: Color picker with hex input
- **Background Transparency**: Toggle (opaque/transparent)

#### 2.1.3 Density (Version)

- **Auto-detect**: Based on content length
- **Manual Override**: Version 1-40
- **Display**: Shows approximate capacity

#### 2.1.4 Error Correction Level

- **Options**:
  - L (Low) - 7% recovery capacity
  - M (Medium) - 15% recovery capacity
  - Q (Quartile) - 25% recovery capacity
  - H (High) - 30% recovery capacity
- **Default**: M
- **Note**: Higher levels allow logo embedding

#### 2.1.5 Border

- **Options**: With Border / Without Border
- **Width**: Adjustable (0-10 modules)
- **Default**: 4 modules

#### 2.1.6 QR Code Dot Style

- **Options**:
  - Square (default)
  - Rounded Square
  - Rounded Dots
- **Preview**: Real-time visual update

### 2.2 Corner Square Customization

#### 2.2.1 Outer Frame Style

- **Options**:
  - Same as internal (default)
  - Square
  - Rounded
  - Ring/Circle
- **Color**: Independent color picker

#### 2.2.2 Inner Frame Style

- **Options**:
  - Same as internal (default)
  - Square
  - Rounded
  - Dot
- **Color**: Independent color picker

### 2.3 Logo/Branding

#### 2.3.1 Logo Modes

- **No Logo**: Standard QR code
- **Text Logo**:
  - Custom text input
  - Font selection (6-8 system fonts)
  - Text color picker
  - Background style (box, bar, outline, transparent)
- **Image Logo**:
  - File upload (PNG, JPG, SVG)
  - Max file size: 5MB
  - Recommended: Square, transparent background

#### 2.3.2 Logo Settings

- **Size**: 10% - 30% of QR code size
- **Position**: Center (fixed)
- **Border Width**: 0-10px
- **Border Color**: Optional white border for contrast

---

## 3. Output & Export

### 3.1 Download Options

#### 3.1.1 File Formats

- PNG (default, transparent background support)
- JPEG (solid background)
- WEBP (smaller file size)
- SVG (vector, scalable)

#### 3.1.2 File Naming

- **Default**: `qrcode-{timestamp}.{format}`
- **Custom**: Editable filename input

#### 3.1.3 Resolution

- **Standard**: Same as preview size
- **High-DPI**: 2x, 3x multiplier options

### 3.2 Preview

- **Real-time**: Updates as settings change
- **Responsive**: Scales to container
- **Test Button**: Quick scan test with device camera

---

## 4. QR Code Scanner

### 4.1 Camera Scanner

- **Access**: Browser camera API
- **Features**:
  - Auto-focus
  - Flash toggle (if available)
  - Front/rear camera switch
- **Actions**:
  - Start scanning
  - Stop scanning
  - Pause/Resume

### 4.2 File Upload Scanner

- **Supported Formats**: PNG, JPG, WEBP, SVG
- **Method**: Drag & drop or file picker

### 4.3 Scan Results

- **Display**: Show decoded content
- **Actions Based on Type**:
  - URL: "Open Link" button
  - Text: "Copy" button
  - Contact: "Add to Contacts" button
  - etc.

---

## 5. User Interface

### 5.1 Layout Structure

```
┌─────────────────────────────────────────────┐
│           Header & Language Selector        │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │                 │  │                 │  │
│  │  Content Input  │  │   QR Preview    │  │
│  │     Panel       │  │                 │  │
│  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     Customization Settings          │   │
│  │  - Basic Settings                   │   │
│  │  - Corner & Logo                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        Download Button              │   │
│  └─────────────────────────────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│        Footer (About, Help, Donate)         │
└─────────────────────────────────────────────┘
```

### 5.2 Responsive Design

- **Desktop**: Side-by-side panels
- **Tablet**: Stacked with preview on top
- **Mobile**: Single column, collapsible panels

### 5.3 Theming

- **Primary Color**: Cyan/Teal (#00BCD4)
- **Dark Mode**: Optional toggle
- **Accessibility**: WCAG 2.1 AA compliant

---

## 6. Additional Features

### 6.1 Multi-language Support

- **Languages**:
  - English
  - Traditional Chinese (zh-TW)
  - Simplified Chinese (zh-CN)
  - Japanese (ja)
  - Korean (ko)
  - Portuguese (pt-PT)
  - Portuguese Brazil (pt-BR)
  - German (de)
  - Russian (ru)
  - Turkish (tr)
  - Polish (pl)

### 6.2 Help & Documentation

- **QR Code Introduction**: Modal with explanation
- **Usage Guide**: Step-by-step tutorial (video optional)
- **Copyright Notice**: DENSO WAVE information

### 6.3 History & Presets

- **Recent QR Codes**: Store last 10 generated codes (localStorage)
- **Saved Templates**: Save favorite configurations
- **Quick Actions**: One-click templates for common uses

### 6.4 Analytics (Optional)

- **Usage Statistics**: Most popular QR types
- **Performance**: Generation time tracking
- **Privacy**: No PII collection

---

## 7. Technical Requirements

### 7.1 Frontend Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Shadcn/ui + Tailwind CSS
- **QR Library**:
  - Generation: `qrcode` or `qrcode-generator`
  - Customization: Custom canvas rendering
  - Scanning: `jsqr` or `@zxing/browser`

### 7.2 Browser Support

- **Modern Browsers**:
  - Chrome/Edge (last 2 versions)
  - Firefox (last 2 versions)
  - Safari (last 2 versions)
- **Mobile**:
  - iOS Safari 14+
  - Android Chrome 90+

### 7.3 Performance

- **Generation Time**: < 500ms for standard QR codes
- **Bundle Size**: < 500KB initial load
- **Lighthouse Score**: > 90 for all metrics

### 7.4 Security

- **No Server-side Storage**: All processing client-side
- **Content Security Policy**: Strict CSP headers
- **XSS Protection**: Sanitize all user inputs
- **Camera Permissions**: Clear explanation before requesting

---

## 8. API Specification

### 8.1 QR Generation Function

```typescript
interface QRCodeOptions {
  // Content
  contentType: ContentType;
  content: Record<string, any>;
  
  // Basic Settings
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  
  // QR Settings
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  dotStyle: 'square' | 'rounded' | 'dots';
  border: {
    enabled: boolean;
    width: number;
  };
  
  // Corner Customization
  cornerSquare: {
    outerStyle: 'default' | 'square' | 'rounded' | 'ring';
    outerColor: string;
    innerStyle: 'default' | 'square' | 'rounded' | 'dot';
    innerColor: string;
  };
  
  // Logo
  logo?: {
    mode: 'none' | 'text' | 'image';
    text?: {
      content: string;
      font: string;
      color: string;
      background: 'box' | 'bar' | 'outline' | 'transparent';
    };
    image?: {
      data: string; // base64 or URL
    };
    size: number; // percentage
    borderWidth: number;
    borderColor?: string;
  };
}

type ContentType = 
  | 'url'
  | 'twqr'
  | 'geo'
  | 'vcard'
  | 'calendar'
  | 'wifi'
  | 'crypto'
  | 'sms'
  | 'tel'
  | 'text'
  | 'copy';

function generateQRCode(options: QRCodeOptions): Promise<{
  dataURL: string;
  svg: string;
  blob: Blob;
}>;
```

### 8.2 Content Encoders

```typescript
// URL
function encodeURL(url: string): string;

// TWQR (Taiwan QR Payment)
function encodeTWQR(data: {
  bankCode: string;
  accountNumber: string;
  amount?: number;
  message?: string;
}): string;

// Geographic Location
function encodeGeo(data: {
  latitude: number;
  longitude: number;
  zoom?: number;
}): string;

// vCard
function encodeVCard(data: {
  firstName: string;
  lastName: string;
  organization?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  website?: string;
  note?: string;
}): string;

// Calendar Event (iCal format)
function encodeCalendar(data: {
  title: string;
  allDay: boolean;
  startDate: Date;
  startTime?: string;
  endDate: Date;
  endTime?: string;
  location?: string;
  description?: string;
}): string;

// WiFi
function encodeWiFi(data: {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}): string;

// Cryptocurrency
function encodeCrypto(data: {
  currency: 'BTC' | 'BCH' | 'ETH' | 'LTC' | 'DASH' | 'XMR' | 'DOGE';
  address: string;
  amount?: number;
  label?: string;
  message?: string;
}): string;

// SMS
function encodeSMS(data: {
  phoneNumber: string;
  message?: string;
}): string;

// Phone
function encodePhone(phoneNumber: string): string;

// Plain Text
function encodeText(text: string): string;
```

---

## 9. Data Structures

### 9.1 Bank Code Database (Taiwan)

```typescript
interface BankCode {
  code: string;
  name: string;
  nameEn: string;
  type: 'bank' | 'credit_union' | 'post' | 'payment';
}

// Major banks from reference site
const TAIWAN_BANKS: BankCode[] = [
  { code: '004', name: '臺灣銀行', nameEn: 'Bank of Taiwan', type: 'bank' },
  { code: '005', name: '臺灣土地銀行', nameEn: 'Land Bank of Taiwan', type: 'bank' },
  { code: '006', name: '合作金庫商業銀行', nameEn: 'Taiwan Cooperative Bank', type: 'bank' },
  { code: '007', name: '第一商業銀行', nameEn: 'First Commercial Bank', type: 'bank' },
  { code: '008', name: '華南商業銀行', nameEn: 'Hua Nan Commercial Bank', type: 'bank' },
  // ... (full list from reference site)
];
```

### 9.2 Cryptocurrency Types

```typescript
interface CryptoConfig {
  id: string;
  name: string;
  symbol: string;
  uriScheme: string;
  addressPattern: RegExp;
}

const CRYPTO_CURRENCIES: CryptoConfig[] = [
  {
    id: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    uriScheme: 'bitcoin',
    addressPattern: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'Ξ',
    uriScheme: 'ethereum',
    addressPattern: /^0x[a-fA-F0-9]{40}$/
  },
  // ... others
];
```

---

## 10. Implementation Phases

### Phase 1: Core Functionality (MVP)

- Basic QR generation (URL, Text, Phone, SMS)
- Standard customization (size, colors, error correction)
- PNG export
- Basic UI layout

### Phase 2: Advanced Content Types

- vCard
- WiFi
- Calendar events
- Map coordinates
- Enhanced input validation

### Phase 3: Advanced Customization

- Dot styles (rounded, dots)
- Corner square customization
- Logo embedding (image & text)
- Multiple export formats (JPEG, WEBP, SVG)

### Phase 4: Scanner & Utilities

- Camera scanner
- File upload scanner
- Scan result actions
- History/templates

### Phase 5: Localization & Polish

- Multi-language support
- Dark mode
- Help documentation
- Performance optimization
- Analytics

### Phase 6: Taiwan-Specific Features

- TWQR (Taiwan payment QR)
- Taiwan bank database
- Cryptocurrency support

---

## 11. Testing Requirements

### 11.1 QR Code Generation Testing

- **Content Encoding**: Verify all content types encode correctly
- **Scanner Compatibility**: Test with iOS Camera, Android, WeChat, Line, etc.
- **Error Correction**: Test with partial damage/obstruction
- **Logo Integration**: Verify readability with logos at various sizes

### 11.2 Browser Testing

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Rendering**: Canvas API compatibility

### 11.3 Accessibility Testing

- **Keyboard Navigation**: Tab order, focus indicators
- **Screen Reader**: ARIA labels, semantic HTML
- **Color Contrast**: Minimum 4.5:1 for text

### 11.4 Performance Testing

- **Generation Speed**: < 500ms for standard codes
- **File Size**: Optimized exports
- **Bundle Analysis**: Code splitting effectiveness

---

## 12. Future Enhancements

### 12.1 Advanced Features

- **Batch Generation**: Create multiple QR codes from CSV
- **API Access**: Programmatic QR generation
- **QR Code Analytics**: Track scan statistics (opt-in)
- **Dynamic QR Codes**: Server-side with editable content
- **Print Templates**: Business card, flyer layouts

### 12.2 Integration Options

- **Social Media**: Share QR codes directly
- **Cloud Storage**: Save to Google Drive, Dropbox
- **URL Shortener**: Integrate with bit.ly, etc.
- **Payment Integration**: Direct payment processor links

### 12.3 Enterprise Features

- **Team Workspaces**: Shared templates and history
- **Brand Guidelines**: Enforce company colors/logos
- **White Label**: Custom domain/branding
- **SSO Integration**: Enterprise authentication

---

## 13. Monetization (Optional)

### 13.1 Free Tier

- All basic QR types
- Standard customization
- PNG export
- 10 saved templates

### 13.2 Premium Features (Donation/Subscription)

- Batch generation
- SVG export
- Priority support
- Remove watermark (if added)
- Advanced analytics

### 13.3 Donation Model

- **Buy Me a Coffee**: Integration with payment QR codes
- **Sponsorship**: GitHub Sponsors
- **Optional**: Show appreciation with crypto donation codes

---

## 14. References & Resources

### 14.1 QR Code Standards

- ISO/IEC 18004:2015 - QR Code bar code symbology specification
- [DENSO WAVE QR Code Essentials](https://www.qrcode.com/en/)

### 14.2 Taiwan Payment Standards

- [TWQR Specification](https://www.fisc.com.tw/en/) - Financial Information Service Co.
- Taiwan Pay integration guidelines

### 14.3 Libraries & Tools

- **qrcode.react**: React QR code component
- **qr-code-styling**: Advanced QR customization
- **jsqr**: JavaScript QR code scanner
- **@zxing/browser**: Cross-platform barcode scanning

### 14.4 Design Inspiration

- [qr.ioi.tw](https://qr.ioi.tw/zh/) - Primary reference
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

---

## 15. Copyright & Licensing

### 15.1 QR Code Patent

- **Patent Holder**: DENSO WAVE (Japan)
- **Status**: Patent-free, no licensing fees required
- **Trademark**: "QR Code" is a registered trademark of DENSO WAVE
- **Usage**: Free to generate and use QR codes without restrictions

### 15.2 Project License

- **Recommendation**: MIT or Apache 2.0 for open-source
- **Commercial Use**: Permitted with attribution
- **Third-party Libraries**: Ensure compatibility with chosen license

---

## Appendix A: File Structure

```
qr-code-generator/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main generator page
│   │   ├── scanner/
│   │   │   └── page.tsx            # Scanner page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── qr-generator/
│   │   │   ├── content-input.tsx   # Content type selector
│   │   │   ├── qr-preview.tsx      # Real-time preview
│   │   │   ├── qr-settings.tsx     # Customization panel
│   │   │   ├── logo-settings.tsx   # Logo configuration
│   │   │   └── download-button.tsx
│   │   ├── scanner/
│   │   │   ├── camera-scanner.tsx
│   │   │   └── file-scanner.tsx
│   │   └── ui/                     # Shadcn components
│   ├── lib/
│   │   ├── qr/
│   │   │   ├── generator.ts        # Core generation logic
│   │   │   ├── encoders.ts         # Content encoders
│   │   │   ├── renderer.ts         # Custom rendering
│   │   │   └── scanner.ts          # Scanning logic
│   │   └── utils.ts
│   ├── data/
│   │   ├── banks.ts                # Taiwan bank codes
│   │   └── crypto.ts               # Cryptocurrency configs
│   └── i18n/
│       └── locales/                # Translation files
├── public/
│   └── examples/                   # Sample QR codes
└── package.json
```

---

## Appendix B: Example Use Cases

1. **Small Business Owner**: Generate WiFi QR code for customers
2. **Restaurant**: Create menu URL QR code for tables
3. **Event Organizer**: Calendar event QR codes for invitations
4. **Cryptocurrency User**: Payment address QR codes
5. **Taiwan User**: TWQR bank transfer codes for receiving payments
6. **Real Estate Agent**: vCard QR codes on business cards
7. **Tourist Guide**: Map location QR codes for points of interest

---

## Document Version

- **Version**: 1.0
- **Date**: October 18, 2025
- **Author**: AI Assistant
- **Based on**: [qr.ioi.tw](https://qr.ioi.tw/zh/) analysis
