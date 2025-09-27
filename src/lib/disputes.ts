export type DisputeStatus = 'Intake' | 'Verification' | 'Reinvestigation' | 'Closed';

export interface VerificationStep {
  label: string;
  completed: boolean;
  completedAt?: string;
}

export interface ReinvestigationDocument {
  name: string;
  receivedAt: string;
  summary: string;
}

export interface DisputeCase {
  id: string;
  applicant: string;
  submittedAt: string;
  trigger: string;
  status: DisputeStatus;
  assignedTo: string;
  verificationDue: string;
  verificationSteps: VerificationStep[];
  reinvestigationDocuments: ReinvestigationDocument[];
}

export const disputeQueue: DisputeCase[] = [
  {
    id: 'D-1027',
    applicant: 'Mike Johnson',
    submittedAt: '2024-05-28',
    trigger: 'Denied — employment unable to verify',
    status: 'Verification',
    assignedTo: 'A. Patel',
    verificationDue: '2024-06-02',
    verificationSteps: [
      { label: 'Send pre-adverse notice and disclosure packet', completed: true, completedAt: '2024-05-28' },
      { label: 'Confirm identity and authorization', completed: true, completedAt: '2024-05-29' },
      { label: 'Collect employer documentation', completed: false },
      { label: 'Document reinvestigation findings and notify applicant', completed: false },
    ],
    reinvestigationDocuments: [
      {
        name: 'Employer offer letter',
        receivedAt: '2024-05-30',
        summary: 'Applicant provided offer letter showing employment start date of 2024-06-03.',
      },
    ],
  },
  {
    id: 'D-1028',
    applicant: 'Jane Smith',
    submittedAt: '2024-05-29',
    trigger: 'Flagged — criminal record mismatch',
    status: 'Reinvestigation',
    assignedTo: 'L. Chen',
    verificationDue: '2024-06-04',
    verificationSteps: [
      { label: 'Provide copy of report', completed: true, completedAt: '2024-05-29' },
      { label: 'Verify DOB/SSN match with vendor', completed: true, completedAt: '2024-05-30' },
      { label: 'Request court disposition', completed: false },
      { label: 'Issue reinvestigation outcome letter', completed: false },
    ],
    reinvestigationDocuments: [
      {
        name: 'Applicant ID verification',
        receivedAt: '2024-05-29',
        summary: 'Copy of driver license uploaded confirming birthdate mismatch with vendor hit.',
      },
    ],
  },
  {
    id: 'D-1029',
    applicant: 'Carlos Ramirez',
    submittedAt: '2024-06-01',
    trigger: 'Denied — credit tradeline dispute',
    status: 'Intake',
    assignedTo: 'M. Lee',
    verificationDue: '2024-06-06',
    verificationSteps: [
      { label: 'Acknowledge receipt within 24 hours', completed: true, completedAt: '2024-06-01' },
      { label: 'Queue reinvestigation with bureau', completed: false },
      { label: 'Document communications with applicant', completed: false },
      { label: 'Finalize dispute determination', completed: false },
    ],
    reinvestigationDocuments: [],
  },
];
