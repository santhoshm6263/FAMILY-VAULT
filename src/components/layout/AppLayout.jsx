import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/Toast';
import { DocumentUploadModal } from '../documents/DocumentUploadModal';

export const AppLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Global Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Main Content Shell */}
      <div
        className="main-app-content"
        style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.25s ease-in-out'
        }}
      >
        {/* Topbar Header */}
        <Topbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />

        {/* Page View Body */}
        <main style={{ flex: 1, padding: '24px 32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Outlet context={{ openUploadModal: () => setIsUploadModalOpen(true) }} />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .main-app-content {
            margin-left: 0 !important;
          }
        }
        @media (max-width: 640px) {
          main {
            padding: 16px 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

