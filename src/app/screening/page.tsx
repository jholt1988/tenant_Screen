import Button from '@/components/Button';
import Link from 'next/link';

export default function ScreeningPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Background Screening
          </h1>
          <Link href="/screening/calculator">
            <Button>Run New Check</Button>
          </Link>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Screening Services
            </h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Credit Check</h3>
                  <span className="text-green-600 font-medium">$29.99</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Comprehensive credit history and score analysis
                </p>
                <Button size="sm" variant="outline">Run Credit Check</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Criminal Background</h3>
                  <span className="text-green-600 font-medium">$24.99</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  National and local criminal record search
                </p>
                <Button size="sm" variant="outline">Run Criminal Check</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Employment Verification</h3>
                  <span className="text-green-600 font-medium">$19.99</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Verify current and previous employment history
                </p>
                <Button size="sm" variant="outline">Verify Employment</Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Rental History</h3>
                  <span className="text-green-600 font-medium">$15.99</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Previous rental performance and landlord references
                </p>
                <Button size="sm" variant="outline">Check Rental History</Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Screening Results
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">John Doe - Credit Check</h3>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <p className="text-sm text-green-700">
                  ✓ Credit Score: 750 (Excellent)
                </p>
                <p className="text-sm text-green-700">
                  ✓ No negative marks in last 2 years
                </p>
              </div>
              
              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Jane Smith - Criminal Check</h3>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
                <p className="text-sm text-yellow-700">
                  ⚠ Minor traffic violation 3 years ago
                </p>
                <p className="text-sm text-yellow-700">
                  ✓ No felony convictions
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 bg-red-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Mike Johnson - Employment</h3>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
                <p className="text-sm text-red-700">
                  ✗ Unable to verify current employment
                </p>
                <p className="text-sm text-red-700">
                  ⚠ Income below affordability threshold (3× rent or mitigated DTI required)
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Screening Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">87%</div>
                  <div className="text-xs text-gray-600">Pass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-600">34</div>
                  <div className="text-xs text-gray-600">This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Comprehensive Screening Package
          </h2>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">Complete Tenant Screen</h3>
                <p className="text-primary-700">Credit + Criminal + Employment + Rental History</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">$79.99</div>
                <div className="text-sm text-primary-600 line-through">$89.96</div>
                <div className="text-xs text-green-600">Save $9.97!</div>
              </div>
            </div>
            <Button size="lg">Run Complete Screening</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
