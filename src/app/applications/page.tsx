import Button from '@/components/Button';
import { disputeQueue } from '@/lib/disputes';

export default function ApplicationsPage() {
  const manualReviewQueue = [
    {
      applicant: 'John Doe',
      property: '123 Main St, Apt 2B',
      riskScore: 14,
      decision: 'Flagged for Review',
      summary: 'DTI above policy threshold and part-time employment require verification.',
      factors: [
        {
          label: 'Debt-to-income ratio exceeds maximum threshold',
          points: 6,
          dataSource: 'Credit bureau debt obligations & stated income',
          recommendedAction: 'Collect recent pay statements or debt payoff letter to confirm updated balances.',
        },
        {
          label: 'Part-time employment may require extra review',
          points: 3,
          dataSource: 'Employment verification & income documentation',
          recommendedAction: 'Request full schedule, hours worked, or secondary income documentation.',
        },
      ],
      guidance: [
        'Verify income stability and clarify how overtime or supplemental earnings are documented.',
        'Consider conditional approval with higher deposit once documentation is received.',
      ],
    },
    {
      applicant: 'Mike Johnson',
      property: '789 Pine St, Suite 3C',
      riskScore: 21,
      decision: 'Denied',
      summary: 'Prior eviction and open collections elevate risk beyond policy tolerance.',
      factors: [
        {
          label: 'Prior eviction reported',
          points: 10,
          dataSource: 'Rental court records & landlord references',
          recommendedAction: 'Request dismissal paperwork or references from post-eviction landlords.',
        },
        {
          label: 'Credit history indicates elevated risk',
          points: 6,
          dataSource: 'Credit bureau report (FICO/VantageScore)',
          recommendedAction: 'Share pathways for credit repair or offer co-signer requirements.',
        },
      ],
      guidance: [
        'Document adverse action notice citing the specific data sources above.',
        'If applicant disputes data, outline reinvestigation process and timeline.',
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tenant Applications
          </h1>
          <Button>New Application</Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Applications</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">John Doe</div>
                    <div className="text-sm text-gray-500">john.doe@email.com</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">123 Main St, Apt 2B</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Under Review
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 days ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button size="sm" variant="outline">View Details</Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                    <div className="text-sm text-gray-500">jane.smith@email.com</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">456 Oak Ave, Unit 1A</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 week ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button size="sm" variant="outline">View Details</Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Mike Johnson</div>
                    <div className="text-sm text-gray-500">mike.j@email.com</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">789 Pine St, Suite 3C</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Rejected
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3 days ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button size="sm" variant="outline">View Details</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">12</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">5</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">3</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Dispute Handling Queue</h3>
            <p className="text-sm text-gray-600">
              Track FCRA reinvestigations with documented verification steps and supporting evidence.
            </p>
          </div>
          <div className="space-y-4">
            {disputeQueue.map((dispute) => (
              <div key={dispute.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      {dispute.id} — {dispute.applicant}
                    </h4>
                    <p className="text-sm text-gray-600">{dispute.trigger}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-900">Status:</span> {dispute.status}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Assigned to:</span> {dispute.assignedTo}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Verification due:</span> {dispute.verificationDue}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Verification Steps</h5>
                    <ul className="mt-2 space-y-2">
                      {dispute.verificationSteps.map((step, idx) => (
                        <li key={`${dispute.id}-step-${idx}`} className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-900">{step.label}</span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                step.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {step.completed ? 'Complete' : 'Pending'}
                            </span>
                          </div>
                          {step.completedAt && (
                            <p className="mt-1 text-xs text-gray-600">Completed {step.completedAt}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Reinvestigation Documentation</h5>
                    {dispute.reinvestigationDocuments.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-600">No supporting documents uploaded yet.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {dispute.reinvestigationDocuments.map((doc, idx) => (
                          <li key={`${dispute.id}-doc-${idx}`} className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-700">
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">Received {doc.receivedAt}</p>
                            <p className="mt-1 text-sm text-gray-700">{doc.summary}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  Dispute submitted {dispute.submittedAt}. Maintain all notes and correspondence in this case record to support FCRA compliance.
                </p>
-
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Manual Review Queue</h3>
              <p className="text-sm text-gray-600">
                Focus on the highest risk factors below and capture any outreach or supporting documentation.
              </p>
            </div>
            <Button size="sm" variant="outline">Download Review Checklist</Button>
          </div>
          <div className="space-y-4">
            {manualReviewQueue.map((item) => (
              <div key={item.applicant} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{item.applicant}</h4>
                    <p className="text-sm text-gray-600">{item.property}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Risk Score</p>
                      <p className="text-xl font-bold text-primary-600">{item.riskScore}</p>
                    </div>
                    <span
                      className={
                        item.decision === 'Flagged for Review'
                          ? 'inline-flex px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold'
                          : 'inline-flex px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold'
                      }
                    >
                      {item.decision}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-700">{item.summary}</p>

                <div className="mt-4 space-y-3">
                  {item.factors.map((factor) => (
                    <div key={factor.label} className="border-l-4 border-red-400 bg-red-50 rounded-md p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">{factor.label}</p>
                          <p className="text-xs text-gray-600">Data source: {factor.dataSource}</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">+{factor.points} pts</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-700">
                        Recommended action: <span className="font-semibold">{factor.recommendedAction}</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <h5 className="text-sm font-semibold text-gray-800 mb-1">Reviewer Checklist</h5>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {item.guidance.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
