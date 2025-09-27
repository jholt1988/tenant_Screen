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
        
        <div className="mt-8 grid gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Review Queue
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Applicants who fall below automated thresholds but show strong
              compensating factors are routed here for manual review. Prioritize
              them to prevent unnecessary denials while maintaining consistent
              documentation of override rationales.
            </p>
            <div className="space-y-4">
              {[
                {
                  name: 'Ava Rodriguez',
                  score: 'Screening Score: 62 (Auto threshold: 70)',
                  factors: [
                    'Stable employment with 8 years tenure',
                    'Emergency savings covering 5 months rent',
                    'Recent rent increases driving temporary DTI spike',
                  ],
                },
                {
                  name: 'Daniel Green',
                  score: 'Screening Score: 58 (Auto threshold: 60)',
                  factors: [
                    'Housing voucher covering 70% of rent secured',
                    'Positive landlord references for previous 4 years',
                    'Short credit history due to recent immigration',
                  ],
                },
              ].map((applicant) => (
                <div
                  key={applicant.name}
                  className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {applicant.name}
                      </h3>
                      <p className="text-sm text-yellow-700">{applicant.score}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Assign to Reviewer
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {applicant.factors.map((factor) => (
                      <div key={factor} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <p className="text-sm text-gray-700">{factor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Property Manager Checklists
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Use these guided checklists during manual assessments to ensure
              consistent documentation and equitable treatment across all
              applicants.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  References &amp; Verification
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Confirm employer contact and job title</li>
                  <li>Request minimum two landlord references</li>
                  <li>Document any gaps in employment or residency</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Rental History Review
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Compare rent paid to current offer amount</li>
                  <li>Note payment patterns, late fees, or payment plans</li>
                  <li>Capture property condition upon move-out</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Assistance &amp; Support Programs
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Verify housing voucher or subsidy status</li>
                  <li>Record supplemental income documentation received</li>
                  <li>Flag need for follow-up with case manager</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Override Outcome Tracking
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Monitor the downstream results of manual overrides to recalibrate
              automated scoring and fairness thresholds over time.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 border-b">
                    <th className="py-2 pr-4">Applicant</th>
                    <th className="py-2 pr-4">Override Reason</th>
                    <th className="py-2 pr-4">Decision</th>
                    <th className="py-2 pr-4">Outcome After 6 Months</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="text-gray-700">
                    <td className="py-3 pr-4 font-medium">Lina Patel</td>
                    <td className="py-3 pr-4">Verified rent assistance approval</td>
                    <td className="py-3 pr-4 text-green-600 font-medium">Approved</td>
                    <td className="py-3 pr-4">On-time payments, lease renewed</td>
                  </tr>
                  <tr className="text-gray-700">
                    <td className="py-3 pr-4 font-medium">Marcus Hill</td>
                    <td className="py-3 pr-4">DTI adjusted for childcare stipend</td>
                    <td className="py-3 pr-4 text-green-600 font-medium">Approved</td>
                    <td className="py-3 pr-4">No late payments, DTI stabilized</td>
                  </tr>
                  <tr className="text-gray-700">
                    <td className="py-3 pr-4 font-medium">Sofia Chen</td>
                    <td className="py-3 pr-4">Short credit history, strong savings</td>
                    <td className="py-3 pr-4 text-yellow-600 font-medium">
                      Conditional Approval
                    </td>
                    <td className="py-3 pr-4">Monitoring payment plan compliance</td>
                  </tr>
                </tbody>
              </table>
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
