export const INITIAL_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Santhosh Sharma',
    email: 'santhosh@familyvault.io',
    role: 'Owner',
    relation: 'Self / Head of Family',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    joinedDate: '2024-01-15',
    phone: '+91 98765 43210',
    documentsCount: 4
  },
  {
    id: 'mem-2',
    name: 'Priya Sharma',
    email: 'priya.s@gmail.com',
    role: 'Admin',
    relation: 'Spouse',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    joinedDate: '2024-01-16',
    phone: '+91 98765 43211',
    documentsCount: 3
  },
  {
    id: 'mem-3',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@outlook.com',
    role: 'Member',
    relation: 'Father',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    joinedDate: '2024-02-01',
    phone: '+91 98765 43212',
    documentsCount: 2
  },
  {
    id: 'mem-4',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@outlook.com',
    role: 'Member',
    relation: 'Mother',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    joinedDate: '2024-02-05',
    phone: '+91 98765 43213',
    documentsCount: 2
  },
  {
    id: 'mem-5',
    name: 'Aarav Sharma',
    email: 'aarav.minor@familyvault.io',
    role: 'Member',
    relation: 'Son (Minor)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    joinedDate: '2024-03-10',
    phone: 'Managed by Parent',
    documentsCount: 1
  }
];

export const INITIAL_INVITES = [
  {
    id: 'inv-1',
    name: 'Vikram Sharma',
    email: 'vikram.s@techcorp.in',
    role: 'Member',
    relation: 'Brother',
    invitedBy: 'Santhosh Sharma',
    invitedAt: '2024-04-02',
    status: 'Pending',
    inviteCode: 'FV-INV-9938'
  }
];

export const INITIAL_FAMILY_PROFILE = {
  id: 'fam-8842',
  name: 'Sharma Family Vault',
  vaultCode: 'FV-8842-BLR',
  createdAt: '15 Jan 2024',
  planTier: 'Family Pro (Encrypted)',
  storageUsed: '14.8 MB',
  maxStorage: '500 MB',
  securityLevel: 'AES-256 GCM Client-Side',
  backupFrequency: 'Real-time sync',
  primaryAdmin: 'Santhosh Sharma'
};

