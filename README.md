# Tenant Screening App

A modern web application for managing tenant screening processes, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Application Management**: Track and manage tenant applications throughout the screening process
- **Background Checks**: Run comprehensive credit, criminal, and employment verification checks
- **Document Management**: Securely upload, store, and organize tenant documents
- **Reporting**: Generate detailed screening reports and analytics
- **User Authentication**: Secure login and role-based access control
- **Responsive Design**: Mobile-friendly interface with modern UI components

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Development**: ESLint for code quality
- **Build Tool**: Next.js built-in bundling and optimization

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Tenant Screening API

- Endpoint: `POST /api/screening`
- Request body example:

```
{
  "income": 50000,
  "monthly_rent": 1500,
  "debt": 15000,
  "credit_score": 720,
  "rental_history": { "evictions": 0, "late_payments": 2 },
  "criminal_background": { "has_criminal_record": false, "type_of_crime": null },
  "employment_status": "full-time"
}
```

- Response:

```
{ "risk_score": 5, "decision": "Flagged for Review" }
```

UI: Navigate to `/screening/calculator` to use a form that calls this API.

### Policy and fairness resources

- Run `npm run audit:affordability` to compare strict 3× rent enforcement with the tiered affordability scoring model.
- See [docs/affordabilityPolicy.md](docs/affordabilityPolicy.md) for methodology, results, and policy guidance.
- Review [docs/individualizedAssessmentPolicy.md](docs/individualizedAssessmentPolicy.md) for case-by-case criminal and eviction screening standards, staff training expectations, and audit logging requirements.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
└── components/         # Reusable UI components
    └── Button.tsx      # Button component
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Future Enhancements

- Database integration for data persistence
- User authentication and authorization
- API endpoints for backend functionality
- Advanced reporting and analytics
- Integration with third-party screening services
- Mobile app companion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
