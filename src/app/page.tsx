import Link from 'next/link';
import Button from '@/components/Button';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to Tenant Screening App
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Application Management
            </h2>
            <p className="text-gray-600 mb-4">
              Manage tenant applications and track their status throughout the screening process.
            </p>
            <Link href="/applications">
              <Button>View Applications</Button>
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Background Checks
            </h2>
            <p className="text-gray-600 mb-4">
              Run comprehensive background checks including credit, criminal, and employment verification.
            </p>
            <Link href="/screening">
              <Button>Run Checks</Button>
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Document Management
            </h2>
            <p className="text-gray-600 mb-4">
              Upload, store, and manage tenant documents securely in one place.
            </p>
            <Link href="/documents">
              <Button>Manage Documents</Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600 mb-4">
            Welcome to your tenant screening dashboard. Here you can manage all aspects of the tenant screening process:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Review and process tenant applications</li>
            <li>Conduct background and credit checks</li>
            <li>Verify employment and rental history</li>
            <li>Generate comprehensive screening reports</li>
            <li>Manage tenant documents and communications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
