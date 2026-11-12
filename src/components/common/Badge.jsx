import React from 'react';
import { Shield, CheckCircle, Clock } from 'lucide-react';

export const RoleBadge = ({ role }) => {
  const roleLower = (role || 'member').toLowerCase();
  if (roleLower === 'owner') {
    return (
      <span className="badge badge-owner">
        <Shield size={12} />
        Owner
      </span>
    );
  }
  if (roleLower === 'admin') {
    return (
      <span className="badge badge-admin">
        <Shield size={12} />
        Admin
      </span>
    );
  }
  return <span className="badge badge-member">Member</span>;
};

export const CategoryBadge = ({ categoryName, className = '' }) => {
  const getStyle = () => {
    const cat = (categoryName || '').toLowerCase();
    if (cat.includes('aadhaar')) return 'cat-aadhaar';
    if (cat.includes('pan')) return 'cat-pan';
    if (cat.includes('passport')) return 'cat-passport';
    if (cat.includes('voter')) return 'cat-voter-id';
    if (cat.includes('driving')) return 'cat-driving-license';
    return 'cat-other';
  };

  return (
    <span className={`badge ${getStyle()} ${className}`}>
      {categoryName}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'verified') {
    return (
      <span className="badge badge-emerald">
        <CheckCircle size={12} />
        {status}
      </span>
    );
  }
  return (
    <span className="badge badge-amber">
      <Clock size={12} />
      {status || 'Pending'}
    </span>
  );
};

